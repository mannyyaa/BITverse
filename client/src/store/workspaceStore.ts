/**
 * Local-first persistence for the current workspace.
 * Browser-local only — not cloud sync or multiplayer. The Zustand store is
 * the seam: feature components call actions and select state; when Yjs/WS
 * arrives, internals can be swapped without changing these signatures.
 */
import { create } from "zustand";
import type {
  ArchitectureNode,
  CanvasEdge,
  CanvasGraph,
  CanvasNode,
  ComponentKind,
  EdgeId,
  NodeId,
  Query,
  Reply,
  Stroke,
  TimelineEvent,
  Workspace,
} from "@/domain/types";
import { generateId } from "@/lib/id";
import { migrateWorkspace } from "@/lib/canvas";
import { demoWorkspace } from "@/data/demoWorkspace";

const WORKSPACE_STORAGE_KEY = "bitverse.workspace.v1";
const GRAPH_HISTORY_STORAGE_KEY = "bitverse.graph-history.v1";

function isWorkspaceSnapshot(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Workspace>;
  const graph = candidate.graph;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    !!graph &&
    typeof graph === "object" &&
    Array.isArray(graph.nodes) &&
    Array.isArray(graph.edges) &&
    Array.isArray(candidate.queries) &&
    Array.isArray(candidate.timeline) &&
    Array.isArray(candidate.collaborators) &&
    Array.isArray(candidate.scenarios)
  );
}

function loadInitialWorkspace(): Workspace {
  if (typeof window === "undefined") return demoWorkspace;

  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return demoWorkspace;

    const parsed: unknown = JSON.parse(raw);
    if (isWorkspaceSnapshot(parsed)) return migrateWorkspace(parsed);

    // A stale/corrupt snapshot should never prevent the app from opening.
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private/restricted browsing contexts.
  }

  return demoWorkspace;
}

function persistWorkspace(workspace: Workspace) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // Keep editing usable if storage is disabled or has reached its quota.
  }
}

interface GraphSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  strokes: Stroke[];
}

interface StoredGraphHistory {
  workspaceId: string;
  pastGraphStates: GraphSnapshot[];
  futureGraphStates: GraphSnapshot[];
}

const MAX_GRAPH_HISTORY = 50;

function isGraphSnapshot(value: unknown): value is GraphSnapshot {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<GraphSnapshot>;
  const hasValidNodes = Array.isArray(candidate.nodes) && candidate.nodes.every((node) =>
    Boolean(node && typeof node === "object" && typeof (node as CanvasNode).id === "string"),
  );
  const hasValidEdges = Array.isArray(candidate.edges) && candidate.edges.every((edge) =>
    Boolean(
      edge && typeof edge === "object" &&
      typeof (edge as CanvasEdge).id === "string" &&
      typeof (edge as CanvasEdge).source === "string" &&
      typeof (edge as CanvasEdge).target === "string",
    ),
  );

  return hasValidNodes && hasValidEdges;
}

/** Coerce a possibly-legacy snapshot (no `strokes`) into a full one. */
function asGraphSnapshot(value: unknown): GraphSnapshot {
  const snap = isGraphSnapshot(value) ? value : { nodes: [], edges: [], strokes: [] };
  return { nodes: snap.nodes, edges: snap.edges, strokes: snap.strokes ?? [] };
}

function loadGraphHistory(workspaceId: string): Pick<WorkspaceState, "pastGraphStates" | "futureGraphStates"> {
  const emptyHistory = { pastGraphStates: [], futureGraphStates: [] };
  if (typeof window === "undefined") return emptyHistory;

  try {
    const raw = window.localStorage.getItem(GRAPH_HISTORY_STORAGE_KEY);
    if (!raw) return emptyHistory;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyHistory;

    const stored = parsed as Partial<StoredGraphHistory>;
    if (
      stored.workspaceId !== workspaceId ||
      !Array.isArray(stored.pastGraphStates) ||
      !Array.isArray(stored.futureGraphStates)
    ) {
      return emptyHistory;
    }

    return {
      pastGraphStates: stored.pastGraphStates.filter(isGraphSnapshot).slice(-MAX_GRAPH_HISTORY).map(asGraphSnapshot),
      futureGraphStates: stored.futureGraphStates.filter(isGraphSnapshot).slice(0, MAX_GRAPH_HISTORY).map(asGraphSnapshot),
    };
  } catch {
    return emptyHistory;
  }
}

function persistGraphHistory(
  workspaceId: string,
  pastGraphStates: GraphSnapshot[],
  futureGraphStates: GraphSnapshot[],
) {
  if (typeof window === "undefined") return;

  try {
    const stored: StoredGraphHistory = { workspaceId, pastGraphStates, futureGraphStates };
    window.localStorage.setItem(GRAPH_HISTORY_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Keep editing usable if storage is disabled or has reached its quota.
  }
}

function snapshotGraph(workspace: Workspace): GraphSnapshot {
  return {
    nodes: workspace.graph.nodes,
    edges: workspace.graph.edges,
    strokes: workspace.graph.strokes,
  };
}

function recordGraphMutation(state: WorkspaceState, graph: CanvasGraph) {
  return {
    workspace: { ...state.workspace, graph },
    pastGraphStates: [...state.pastGraphStates, snapshotGraph(state.workspace)].slice(-MAX_GRAPH_HISTORY),
    futureGraphStates: [],
  };
}

interface WorkspaceState {
  workspace: Workspace;
  // Graph history is transient and browser-session-only. The workspace itself
  // remains persisted locally through the existing subscription below.
  pastGraphStates: GraphSnapshot[];
  futureGraphStates: GraphSnapshot[];
  undoGraph: () => void;
  redoGraph: () => void;

  // Graph mutations
  addNode: (node: CanvasNode) => void;
  updateNode: (id: NodeId, patch: Partial<CanvasNode>) => void;
  removeNode: (id: NodeId) => void;
  removeNodes: (ids: NodeId[]) => void;
  addEdge: (edge: CanvasEdge) => void;
  updateEdge: (edgeId: EdgeId, patch: Partial<CanvasEdge>) => void;
  removeEdge: (edgeId: string) => void;
  removeEdges: (ids: EdgeId[]) => void;
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  setStrokes: (strokes: Stroke[]) => void;
  addStroke: (stroke: Stroke) => void;
  removeStrokes: (ids: string[]) => void;
  /** Atomically swap a non-architecture node into an architecture component. */
  convertNode: (id: NodeId, kind: ComponentKind) => void;
  /** Replace the whole canvas graph in a single undoable step (for templates). */
  replaceGraph: (graph: CanvasGraph) => void;
  /**
   * Create a brand-new blank workspace and switch to it.
   * The old workspace is written to localStorage under its own key first so
   * existing work is never lost. The new workspace gets a unique ID so it
   * is a genuinely independent canvas — not a view of the old one.
   */
  createNewWorkspace: () => void;

  // Query mutations
  addQuery: (query: Omit<Query, "id" | "createdAt" | "thread" | "status">) => void;
  updateQueryStatus: (queryId: string, status: Query["status"]) => void;
  addReply: (queryId: string, reply: Omit<Reply, "id" | "createdAt">) => void;

  // Timeline
  addTimelineEvent: (event: Omit<TimelineEvent, "id" | "timestamp">) => void;
}

const initialWorkspace = loadInitialWorkspace();
const initialGraphHistory = loadGraphHistory(initialWorkspace.id);

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: initialWorkspace,
  pastGraphStates: initialGraphHistory.pastGraphStates,
  futureGraphStates: initialGraphHistory.futureGraphStates,

  undoGraph: () =>
    set((s) => {
      if (s.pastGraphStates.length === 0) return s;
      const previous = s.pastGraphStates[s.pastGraphStates.length - 1];
      const current = snapshotGraph(s.workspace);
      return {
        workspace: {
          ...s.workspace,
          graph: {
            nodes: previous.nodes,
            edges: previous.edges,
            strokes: previous.strokes,
          },
        },
        pastGraphStates: s.pastGraphStates.slice(0, -1),
        futureGraphStates: [current, ...s.futureGraphStates].slice(0, MAX_GRAPH_HISTORY),
      };
    }),

  redoGraph: () =>
    set((s) => {
      if (s.futureGraphStates.length === 0) return s;
      const next = s.futureGraphStates[0];
      const current = snapshotGraph(s.workspace);
      return {
        workspace: {
          ...s.workspace,
          graph: { nodes: next.nodes, edges: next.edges, strokes: next.strokes },
        },
        pastGraphStates: [...s.pastGraphStates, current].slice(-MAX_GRAPH_HISTORY),
        futureGraphStates: s.futureGraphStates.slice(1),
      };
    }),

  // ── Graph ──────────────────────────────────────────────────────────────
  setNodes: (nodes) =>
    set((s) => {
      if (nodes === s.workspace.graph.nodes) return s;
      return recordGraphMutation(s, { ...s.workspace.graph, nodes });
    }),

  setEdges: (edges) =>
    set((s) => {
      if (edges === s.workspace.graph.edges) return s;
      return recordGraphMutation(s, { ...s.workspace.graph, edges });
    }),

  setStrokes: (strokes) =>
    set((s) => {
      if (strokes === s.workspace.graph.strokes) return s;
      return recordGraphMutation(s, { ...s.workspace.graph, strokes });
    }),

  addNode: (node) =>
    set((s) => recordGraphMutation(s, {
      ...s.workspace.graph,
      nodes: [...s.workspace.graph.nodes, node],
    })),

  updateNode: (id, patch) =>
    set((s) => {
      if (!s.workspace.graph.nodes.some((node) => node.id === id)) return s;
      return recordGraphMutation(s, {
        ...s.workspace.graph,
        nodes: s.workspace.graph.nodes.map((n) =>
          n.id === id ? ({ ...n, ...patch } as CanvasNode) : n,
        ),
      });
    }),

  removeNode: (id) =>
    set((s) => {
      if (!s.workspace.graph.nodes.some((node) => node.id === id)) return s;
      return recordGraphMutation(s, {
        nodes: s.workspace.graph.nodes.filter((n) => n.id !== id),
        edges: s.workspace.graph.edges.filter((e) => e.source !== id && e.target !== id),
        strokes: s.workspace.graph.strokes,
      });
    }),

  removeNodes: (ids) =>
    set((s) => {
      if (ids.length === 0) return s;
      const idSet = new Set(ids);
      return recordGraphMutation(s, {
        nodes: s.workspace.graph.nodes.filter((n) => !idSet.has(n.id)),
        edges: s.workspace.graph.edges.filter((e) => !idSet.has(e.source) && !idSet.has(e.target)),
        strokes: s.workspace.graph.strokes,
      });
    }),

  addEdge: (edge) =>
    set((s) => recordGraphMutation(s, {
      ...s.workspace.graph,
      edges: [...s.workspace.graph.edges, edge],
    })),

  updateEdge: (edgeId, patch) =>
    set((s) => {
      if (!s.workspace.graph.edges.some((e) => e.id === edgeId)) return s;
      return recordGraphMutation(s, {
        ...s.workspace.graph,
        edges: s.workspace.graph.edges.map((e) =>
          e.id === edgeId ? ({ ...e, ...patch } as CanvasEdge) : e,
        ),
      });
    }),

  removeEdge: (edgeId) =>
    set((s) => {
      if (!s.workspace.graph.edges.some((e) => e.id === edgeId)) return s;
      return recordGraphMutation(s, {
        ...s.workspace.graph,
        edges: s.workspace.graph.edges.filter((e) => e.id !== edgeId),
        strokes: s.workspace.graph.strokes,
      });
    }),

  removeEdges: (ids) =>
    set((s) => {
      if (ids.length === 0) return s;
      const idSet = new Set(ids);
      return recordGraphMutation(s, {
        ...s.workspace.graph,
        edges: s.workspace.graph.edges.filter((e) => !idSet.has(e.id)),
        strokes: s.workspace.graph.strokes,
      });
    }),

  addStroke: (stroke) =>
    set((s) => recordGraphMutation(s, {
      ...s.workspace.graph,
      strokes: [...s.workspace.graph.strokes, stroke],
    })),

  removeStrokes: (ids) =>
    set((s) => {
      if (ids.length === 0) return s;
      const idSet = new Set(ids);
      return recordGraphMutation(s, {
        ...s.workspace.graph,
        strokes: s.workspace.graph.strokes.filter((st) => !idSet.has(st.id)),
      });
    }),

  convertNode: (id, kind) =>
    set((s) => {
      const n = s.workspace.graph.nodes.find((x) => x.id === id);
      if (!n || n.type === "architecture") return s;
      const label =
        n.type === "sticky" ? (n.text || "Component")
        : n.type === "text" ? (n.content || "Component")
        : (n.label ?? n.title ?? "Component");
      const arch: ArchitectureNode = {
        id, type: "architecture", kind, label, status: "healthy",
        position: n.position, width: n.width, height: n.height,
      };
      return recordGraphMutation(s, {
        ...s.workspace.graph,
        nodes: s.workspace.graph.nodes.map((x) => (x.id === id ? arch : x)),
      });
    }),

  replaceGraph: (graph) => set((s) => recordGraphMutation(s, graph)),

  createNewWorkspace: () =>
    set((s) => {
      // Persist the current workspace before abandoning it.
      persistWorkspace(s.workspace);
      const now = Date.now();
      const fresh: Workspace = {
        id: generateId("ws"),
        name: "New Workspace",
        description: "Blank canvas",
        createdAt: now,
        updatedAt: now,
        mode: "brainstorm",
        graph: { nodes: [], edges: [], strokes: [] },
        queries: [],
        timeline: [{ id: generateId("t"), kind: "workspace-created", description: "Workspace created", author: "You", timestamp: now }],
        collaborators: [],
        scenarios: [],
      };
      return {
        workspace: fresh,
        pastGraphStates: [],
        futureGraphStates: [],
      };
    }),

  // ── Queries ────────────────────────────────────────────────────────────
  addQuery: (partial) =>
    set((s) => {
      const query: Query = {
        ...partial,
        id: generateId("q"),
        status: "open",
        createdAt: Date.now(),
        thread: [],
      };
      return {
        workspace: { ...s.workspace, queries: [...s.workspace.queries, query] },
      };
    }),

  updateQueryStatus: (queryId, status) =>
    set((s) => ({
      workspace: {
        ...s.workspace,
        queries: s.workspace.queries.map((q) =>
          q.id === queryId
            ? { ...q, status, resolvedAt: status === "resolved" ? Date.now() : q.resolvedAt }
            : q,
        ),
      },
    })),

  addReply: (queryId, replyPartial) =>
    set((s) => {
      const reply: Reply = { ...replyPartial, id: generateId("r"), createdAt: Date.now() };
      return {
        workspace: {
          ...s.workspace,
          queries: s.workspace.queries.map((q) =>
            q.id === queryId ? { ...q, thread: [...q.thread, reply] } : q,
          ),
        },
      };
    }),

  // ── Timeline ────────────────────────────────────────────────────────────
  addTimelineEvent: (event) =>
    set((s) => ({
      workspace: {
        ...s.workspace,
        timeline: [
          ...s.workspace.timeline,
          { ...event, id: generateId("t"), timestamp: Date.now() },
        ],
      },
    })),
}));

// ── Persistence subscriptions ─────────────────────────────────────────────────
useWorkspaceStore.subscribe((state, prev) => {
  if (state.workspace !== prev.workspace) {
    persistWorkspace(state.workspace);
  }
  if (
    state.pastGraphStates !== prev.pastGraphStates ||
    state.futureGraphStates !== prev.futureGraphStates
  ) {
    persistGraphHistory(state.workspace.id, state.pastGraphStates, state.futureGraphStates);
  }
});
