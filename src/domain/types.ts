/**
 * BITverse domain model.
 *
 * Single source of truth for the data shapes shared across features
 * (canvas, queries, failure lab, timeline) and the pure engine.
 * Keep this file free of UI concerns and framework imports — anything
 * that imports React belongs in `features/`, not here.
 */

/** Kinds of components a user can place on the canvas. */
export type ComponentKind = "service" | "database" | "api" | "cache" | "queue";

/** Runtime health of a component, mutated by the simulation engine. */
export type NodeStatus = "healthy" | "degraded" | "overloaded" | "down";

export type NodeId = string;
export type EdgeId = string;

/** Reference to a graph element a query can be attached to. */
export type QueryTarget =
  | { kind: "node"; id: NodeId }
  | { kind: "edge"; id: EdgeId };

/** A component on the canvas. Position is read by the canvas + engine. */
export interface GraphNode {
  id: NodeId;
  kind: ComponentKind;
  label: string;
  status: NodeStatus;
  /** React Flow owns writing position during drag; everything else reads it. */
  position: { x: number; y: number };
}

/** A directed data-flow connection between two components. */
export interface GraphEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  label?: string;
}

/** The full architecture graph: what gets persisted and simulated. */
export interface ArchitectureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** A threaded discussion pinned to a node or edge. */
export interface Query {
  id: string;
  target: QueryTarget;
  author: string;
  body: string;
  createdAt: number;
  thread: Reply[];
}

export interface Reply {
  id: string;
  author: string;
  body: string;
  createdAt: number;
}

/** Canned failure scenarios for the Failure Lab. */
export type SimulationScenario =
  | { id: string; kind: "nodeDown"; targetId: NodeId }
  | { id: string; kind: "trafficSpike"; targetId: NodeId; multiplier: number }
  | { id: string; kind: "dependencyOutage"; edgeId: EdgeId };

/** Discrete snapshot of the simulation across one tick. */
export interface SimulationState {
  tick: number;
  statuses: Record<NodeId, NodeStatus>;
  log: SimulationLogEntry[];
}

export interface SimulationLogEntry {
  tick: number;
  nodeId: NodeId;
  status: NodeStatus;
  reason: string;
}
