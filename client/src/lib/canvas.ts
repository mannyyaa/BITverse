/**
 * Canvas helpers — pure functions over the domain model. No React/DOM.
 * Maps sticky/shape/stroke domain values to design tokens, projects the
 * architecture view for the simulation engine, and migrates legacy snapshots.
 */
import type {
  ArchitectureGraph,
  CanvasEdge,
  CanvasGraph,
  CanvasNode,
  GraphEdge,
  GraphNode,
  ShapeKind,
  StickyColor,
  StickyTemplate,
  Workspace,
  WorkspaceMode,
} from "@/domain/types";

// ── Sticky notes ─────────────────────────────────────────────────────────────

/** CSS variable for each sticky-note paper colour. */
export const STICKY_COLOR_VAR: Record<StickyColor, string> = {
  yellow: "var(--sticky-yellow)",
  pink: "var(--sticky-pink)",
  mint: "var(--sticky-mint)",
  cyan: "var(--sticky-cyan)",
  violet: "var(--sticky-violet)",
  coral: "var(--sticky-coral)",
};

/** Slightly deeper tone used for sticky borders / headers. */
export const STICKY_BORDER_VAR: Record<StickyColor, string> = {
  yellow: "var(--sticky-yellow-border)",
  pink: "var(--sticky-pink-border)",
  mint: "var(--sticky-mint-border)",
  cyan: "var(--sticky-cyan-border)",
  violet: "var(--sticky-violet-border)",
  coral: "var(--sticky-coral-border)",
};

export const STICKY_COLORS: StickyColor[] = ["yellow", "pink", "mint", "cyan", "violet", "coral"];

export interface StickyTemplateMeta {
  id: StickyTemplate;
  emoji: string;
  label: string;
  placeholder: string;
}

/** Starter styles with short, realistic example text (no lorem ipsum). */
export const STICKY_TEMPLATES: StickyTemplateMeta[] = [
  { id: "idea", label: "Idea", emoji: "💡", placeholder: "Can Redis reduce product lookup latency?" },
  { id: "question", label: "Question", emoji: "❓", placeholder: "What happens if PostgreSQL goes down?" },
  { id: "assumption", label: "Assumption", emoji: "🧠", placeholder: "Assumption: product reads are much more frequent than writes." },
  { id: "decision", label: "Decision", emoji: "✅", placeholder: "Decision: cache product catalog with a 60s TTL." },
  { id: "risk", label: "Risk", emoji: "⚠️", placeholder: "Risk: the primary database is a single point of failure." },
  { id: "todo", label: "TODO", emoji: "✍️", placeholder: "TODO: add a read replica and failover for PostgreSQL." },
];

export function stickyTemplateMeta(id?: StickyTemplate): StickyTemplateMeta | undefined {
  return STICKY_TEMPLATES.find((t) => t.id === id);
}

// ── Shapes ───────────────────────────────────────────────────────────────────

export const SHAPES: { kind: ShapeKind; label: string }[] = [
  { kind: "rect", label: "Rectangle" },
  { kind: "rect-rounded", label: "Rounded" },
  { kind: "ellipse", label: "Circle" },
  { kind: "diamond", label: "Diamond" },
  { kind: "frame", label: "Frame" },
];

/** Default dimensions for each shape kind (px). */
export const SHAPE_DEFAULT_SIZE: Record<ShapeKind, { width: number; height: number }> = {
  rect: { width: 160, height: 100 },
  "rect-rounded": { width: 160, height: 100 },
  ellipse: { width: 140, height: 140 },
  diamond: { width: 160, height: 120 },
  frame: { width: 360, height: 240 },
};

export const STICKY_DEFAULT_SIZE = { width: 190, height: 150 };

// ── Type guards / projections ────────────────────────────────────────────────

export function isArchitectureNode(n: CanvasNode): n is Extract<CanvasNode, { type: "architecture" }> {
  return n.type === "architecture";
}

/**
 * Project the whiteboard graph down to the narrow architecture view the
 * simulation engine consumes. Sticky notes, sketches, and brainstorm arrows
 * are deliberately excluded — they must never influence failure simulation.
 */
export function toArchitectureGraph(canvas: CanvasGraph): ArchitectureGraph {
  const nodes: GraphNode[] = [];
  for (const n of canvas.nodes) {
    if (n.type === "architecture") {
      nodes.push({
        id: n.id,
        kind: n.kind,
        label: n.label,
        status: n.status,
        position: n.position,
        meta: n.meta,
      });
    }
  }
  const edges: GraphEdge[] = canvas.edges
    .filter((e): e is CanvasEdge => e.kind === "dataflow")
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      status: e.status,
      animated: e.animated,
    }));
  return { nodes, edges };
}

// ── Legacy snapshot migration ─────────────────────────────────────────────────

/**
 * Older workspaces (pre-whiteboard) stored plain architecture `GraphNode`s
 * without a `type`, edges without a `kind`, and no `strokes`. Migrate them in
 * place so existing local saves keep working after the redesign.
 */
export function migrateWorkspace(ws: Workspace): Workspace {
  const graph = ws.graph as CanvasGraph | undefined;
  const nodes: CanvasNode[] = (graph?.nodes ?? []).map((n) =>
    n && typeof n === "object" && "type" in n && n.type
      ? (n as CanvasNode)
      : ({
          // legacy architecture node -> ArchitectureNode
          type: "architecture",
          id: (n as { id: string }).id,
          kind: (n as { kind: import("@/domain/types").ComponentKind }).kind,
          label: (n as { label: string }).label,
          status: (n as { status: import("@/domain/types").NodeStatus }).status ?? "healthy",
          position: (n as { position: { x: number; y: number } }).position,
          meta: (n as { meta?: { metric?: string; detail?: string } }).meta,
        } as CanvasNode),
  );
  const edges: CanvasEdge[] = (graph?.edges ?? []).map((e) =>
    e && typeof e === "object" && "kind" in e && e.kind
      ? (e as CanvasEdge)
      : ({
          // legacy architecture edge -> dataflow CanvasEdge
          id: (e as { id: string }).id,
          source: (e as { source: string }).source,
          target: (e as { target: string }).target,
          kind: "dataflow",
          label: (e as { label?: string }).label,
          status: (e as { status?: "normal" | "degraded" | "severed" }).status,
          animated: (e as { animated?: boolean }).animated,
        } as CanvasEdge),
  );
  const strokes = graph?.strokes ?? [];
  return {
    ...ws,
    graph: { nodes, edges, strokes },
    mode: ws.mode ?? "architecture",
  };
}

export const DEFAULT_MODE: WorkspaceMode = "brainstorm";
