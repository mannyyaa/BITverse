/**
 * BITverse domain model.
 *
 * Single source of truth for all data shapes shared across features.
 * Keep this file free of UI concerns and framework imports.
 */

// ── Component kinds ──────────────────────────────────────────────────────────

export type ComponentKind =
  | "web-client"
  | "mobile-client"
  | "api-gateway"
  | "load-balancer"
  | "service"
  | "worker"
  | "serverless"
  | "database"
  | "cache"
  | "object-storage"
  | "message-queue"
  | "event-stream"
  | "cdn"
  | "external-api"
  | "firewall";

// ── Node status ──────────────────────────────────────────────────────────────

export type NodeStatus = "healthy" | "degraded" | "overloaded" | "down";

export type NodeId = string;
export type EdgeId = string;

// ── Graph ────────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: NodeId;
  kind: ComponentKind;
  label: string;
  status: NodeStatus;
  position: { x: number; y: number };
  /** Optional display metadata shown in the node card */
  meta?: {
    metric?: string;   // e.g. "1.2k req/s"
    detail?: string;   // e.g. "68% capacity"
  };
}

export interface GraphEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  label?: string;
  /** Visual style for degraded/failure connections */
  status?: "normal" | "degraded" | "severed";
  animated?: boolean;
}

export interface ArchitectureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── Queries / Discussions ────────────────────────────────────────────────────

export type QueryTarget =
  | { kind: "node"; id: NodeId }
  | { kind: "edge"; id: EdgeId };

export type QueryType = "question" | "issue" | "improvement";
export type QueryStatus = "open" | "in-discussion" | "resolved";
export type Priority = "low" | "medium" | "high" | "critical";

export interface Reply {
  id: string;
  author: string;
  body: string;
  createdAt: number;
}

export interface Query {
  id: string;
  title: string;
  body: string;
  type: QueryType;
  status: QueryStatus;
  priority: Priority;
  target: QueryTarget;
  author: string;
  assignee?: string;
  createdAt: number;
  resolvedAt?: number;
  thread: Reply[];
}

// ── Simulation ───────────────────────────────────────────────────────────────

export type ScenarioKind =
  | "database-outage"
  | "traffic-spike"
  | "network-partition"
  | "service-failure";

export interface FailureScenario {
  id: string;
  kind: ScenarioKind;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  impact: string;
  /** Primary node targeted by this scenario */
  primaryTarget: NodeId;
  /** Additional nodes / edges affected */
  affectedNodes?: NodeId[];
  affectedEdges?: EdgeId[];
}

export type SimulationPhase = "idle" | "running" | "paused" | "complete";

export interface SimulationState {
  phase: SimulationPhase;
  scenarioId: string | null;
  tick: number;
  elapsedSeconds: number;
  statuses: Record<NodeId, NodeStatus>;
  log: SimulationLogEntry[];
}

export interface SimulationLogEntry {
  tick: number;
  nodeId: NodeId;
  previousStatus: NodeStatus;
  status: NodeStatus;
  reason: string;
}

// ── Timeline / History ───────────────────────────────────────────────────────

export type TimelineEventKind =
  | "workspace-created"
  | "node-added"
  | "node-removed"
  | "edge-added"
  | "edge-removed"
  | "query-raised"
  | "query-resolved"
  | "simulation-started"
  | "simulation-complete"
  | "snapshot-saved"
  | "architecture-improved";

export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  description: string;
  author: string;
  timestamp: number;
  nodeId?: NodeId;
  queryId?: string;
  snapshotId?: string;
}

// ── Collaborators ────────────────────────────────────────────────────────────

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  initials: string;
  online: boolean;
  cursor?: { x: number; y: number };
}

// ── Workspace ────────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  graph: ArchitectureGraph;
  queries: Query[];
  timeline: TimelineEvent[];
  collaborators: Collaborator[];
  scenarios: FailureScenario[];
}
