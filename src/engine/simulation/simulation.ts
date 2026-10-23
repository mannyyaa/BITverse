/**
 * Deterministic, rule-based failure simulation engine.
 * Pure functions — no React, no DOM. Safe to run in a Web Worker later.
 */
import type {
  ArchitectureGraph,
  FailureScenario,
  NodeId,
  NodeStatus,
  SimulationLogEntry,
} from "@/domain/types";
import { getSuccessors, getPredecessors } from "@/engine/graph/graph";

export interface SimulationResult {
  statuses: Record<NodeId, NodeStatus>;
  log: SimulationLogEntry[];
}

/**
 * Run a full failure scenario against the current graph.
 * Returns the final status of every node plus a log of state changes.
 */
export function runScenario(
  graph: ArchitectureGraph,
  scenario: FailureScenario,
): SimulationResult {
  const statuses: Record<NodeId, NodeStatus> = {};
  const log: SimulationLogEntry[] = [];
  let tick = 0;

  // Seed healthy
  graph.nodes.forEach((n) => (statuses[n.id] = "healthy"));

  const record = (nodeId: NodeId, status: NodeStatus, reason: string) => {
    const prev = statuses[nodeId] ?? "healthy";
    if (prev === status) return;
    statuses[nodeId] = status;
    log.push({ tick, nodeId, previousStatus: prev, status, reason });
  };

  switch (scenario.kind) {
    case "database-outage": {
      // Primary DB goes down
      tick = 1;
      record(scenario.primaryTarget, "down", "Primary database instance unavailable");

      // Services with direct DB edges become degraded
      tick = 2;
      const dbPredecessors = getPredecessors(graph, scenario.primaryTarget);
      dbPredecessors.forEach((node) => {
        record(node.id, "degraded", `Database dependency unavailable — write operations failing`);
      });

      // Their own dependents further degrade
      tick = 3;
      dbPredecessors.forEach((node) => {
        getSuccessors(graph, node.id).forEach((downstream) => {
          if (statuses[downstream.id] === "healthy") {
            record(downstream.id, "degraded", `Upstream service ${node.label} degraded`);
          }
        });
      });
      break;
    }

    case "traffic-spike": {
      // Primary target becomes overloaded
      tick = 1;
      record(scenario.primaryTarget, "overloaded", "Incoming request rate exceeds capacity");

      // Downstream services degrade from pressure
      tick = 2;
      getSuccessors(graph, scenario.primaryTarget).forEach((node) => {
        record(node.id, "overloaded", "Elevated traffic from upstream pressure");
      });

      // Their downstream degraded
      tick = 3;
      graph.nodes
        .filter((n) => statuses[n.id] === "overloaded")
        .forEach((node) => {
          getSuccessors(graph, node.id).forEach((downstream) => {
            if (statuses[downstream.id] === "healthy") {
              record(downstream.id, "degraded", "Request queue backing up");
            }
          });
        });
      break;
    }

    case "network-partition": {
      // The primary target can no longer communicate downstream
      tick = 1;
      record(scenario.primaryTarget, "degraded", "Network partition — outbound connections severed");

      tick = 2;
      getSuccessors(graph, scenario.primaryTarget).forEach((node) => {
        record(node.id, "down", "No inbound traffic — network partition upstream");
      });
      break;
    }

    case "service-failure": {
      // Service itself goes down
      tick = 1;
      record(scenario.primaryTarget, "down", "Service stopped responding — health checks failing");

      // Downstream consumers can no longer receive data
      tick = 2;
      getSuccessors(graph, scenario.primaryTarget).forEach((node) => {
        if (node.kind === "message-queue" || node.kind === "database") {
          record(node.id, "degraded", `Producer ${scenario.primaryTarget} offline — reduced throughput`);
        } else {
          record(node.id, "degraded", `Upstream dependency unavailable`);
        }
      });
      break;
    }
  }

  return { statuses, log };
}

/**
 * Score how many nodes are impacted: returns fraction [0, 1] of nodes that
 * are not healthy. Lower is better.
 */
export function impactScore(statuses: Record<NodeId, NodeStatus>): number {
  const all = Object.values(statuses);
  if (all.length === 0) return 0;
  const unhealthy = all.filter((s) => s !== "healthy").length;
  return unhealthy / all.length;
}
