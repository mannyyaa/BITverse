/**
 * BITverse domain model — the single source of truth shared by the canvas,
 * stores, inspector, and the (pure) simulation engine. No React/DOM imports.
 *
 * The canvas is a whiteboard: it holds architecture components, sticky notes,
 * free text, shapes, freehand strokes, and two kinds of edges. The simulation
 * engine only cares about architecture nodes + data-flow edges, so it consumes
 * a projected `ArchitectureGraph` (see `lib/canvas.ts` -> toArchitectureGraph).
 */

// ── Architecture components ─────────────────────────────────────────────────

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

export type NodeStatus = "healthy" | "degraded" | "overloaded" | "down";

export type NodeId = string;
export type EdgeId = string;

// ── Canvas objects ───────────────────────────────────────────────────────────

export type StickyColor = "yellow" | "pink" | "mint" | "cyan" | "violet" | "coral";
export type StickyTemplate = "idea" | "question" | "assumption" | "decision" | "risk" | "todo";
export type ShapeKind = "rect" | "rect-rounded" | "ellipse" | "diamond" | "frame";
export type TextSize = "sm" | "md" | "lg";
export type EdgeKind = "dataflow" | "brainstorm";
export type StrokeTool = "pen" | "highlighter";

interface CanvasNodeBase {
  id: NodeId;
  position: { x: number; y: number };
  /** Optional explicit size for resizable objects (sticky / shape). */
  width?: number;
  height?: number;
  /** Hidden objects are kept in the graph but not rendered on the canvas. */
  hidden?: boolean;
  /** Locked objects cannot be dragged or resized. */
  locked?: boolean;
}

export interface ArchitectureNode extends CanvasNodeBase {
  type: "architecture";
  kind: ComponentKind;
  label: string;
  status: NodeStatus;
  description?: string;
  meta?: { metric?: string; detail?: string };
}

export interface StickyNode extends CanvasNodeBase {
  type: "sticky";
  text: string;
  color: StickyColor;
  template?: StickyTemplate;
  align?: "left" | "center";
}

export interface TextNode extends CanvasNodeBase {
  type: "text";
  content: string;
  size?: TextSize;
}

export interface ShapeNode extends CanvasNodeBase {
  type: "shape";
  shape: ShapeKind;
  label?: string;
  fill?: string;
  border?: string;
  /** Used by frames to name a grouped area (Frontend, Backend, …). */
  title?: string;
}

export type CanvasNode = ArchitectureNode | StickyNode | TextNode | ShapeNode;

export interface CanvasEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  kind: EdgeKind;
  label?: string;
  /** Brainstorm arrows can be straight or curved. */
  style?: "straight" | "curved";
  /** Data-flow edge semantics, surfaced by the simulation. */
  status?: "normal" | "degraded" | "severed";
  animated?: boolean;
}

export interface Stroke {
  id: string;
  tool: StrokeTool;
  color: string;
  width: number;
  /** Points in unprojected canvas coordinates. */
  points: { x: number; y: number }[];
}

/** Everything on the canvas: objects, connections, and sketches. */
export interface CanvasGraph {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  strokes: Stroke[];
}

// ── Architecture view (engine input) ─────────────────────────────────────────
// A stable, narrow contract for the pure simulation engine. Projected from a
// CanvasGraph so the engine never has to know about sticky notes or sketches.

export interface GraphNode {
  id: NodeId;
  kind: ComponentKind;
  label: string;
  status: NodeStatus;
  position: { x: number; y: number };
  meta?: { metric?: string; detail?: string };
}

export interface GraphEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  label?: string;
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

export type WorkspaceMode = "brainstorm" | "architecture";

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  graph: CanvasGraph;
  queries: Query[];
  timeline: TimelineEvent[];
  collaborators: Collaborator[];
  scenarios: FailureScenario[];
  mode?: WorkspaceMode;
}
