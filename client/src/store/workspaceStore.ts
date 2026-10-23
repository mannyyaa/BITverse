import { create } from "zustand";
import type {
  Workspace,
  GraphNode,
  GraphEdge,
  Query,
  Reply,
  TimelineEvent,
  NodeId,
  QueryStatus,
} from "@/domain/types";
import { demoWorkspace } from "@/data/demoWorkspace";
import { generateId } from "@/lib/id";

/**
 * Local-first persistence for the current workspace.
 * This is intentionally browser-local; it is not cloud sync or multiplayer.
 */
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
    if (isWorkspaceSnapshot(parsed)) return parsed;

    // A stale/corrupt snapshot should never prevent the app from opening.
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private/restricted browsing contexts.
    // Keep the demo usable for the current session in that case.
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
  nodes: GraphNode[];
  edges: GraphEdge[];
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
    Boolean(node && typeof node === "object" && typeof (node as GraphNode).id === "string"),
  );
  const hasValidEdges = Array.isArray(candidate.edges) && candidate.edges.every((edge) =>
    Boolean(
      edge && typeof edge === "object" &&
      typeof (edge as GraphEdge).id === "string" &&
      typeof (edge as GraphEdge).source === "string" &&
      typeof (edge as GraphEdge).target === "string",
    ),
  );

  return hasValidNodes && hasValidEdges;
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
      pastGraphStates: stored.pastGraphStates.filter(isGraphSnapshot).slice(-MAX_GRAPH_HISTORY),
      futureGraphStates: stored.futureGraphStates.filter(isGraphSnapshot).slice(0, MAX_GRAPH_HISTORY),
    };
  } catch {
    // Corrupt or inaccessible history must not stop the workspace from loading.
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
  return { nodes: workspace.graph.nodes, edges: workspace.graph.edges };
}

function recordGraphMutation(state: WorkspaceState, graph: Workspace["graph"]) {
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
  addNode: (node: GraphNode) => void;
  updateNode: (id: NodeId, patch: Partial<GraphNode>) => void;
  removeNode: (id: NodeId) => void;
  addEdge: (edge: GraphEdge) => void;
  removeEdge: (edgeId: string) => void;
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;

  // Query mutations
  addQuery: (query: Omit<Query, "id" | "createdAt" | "thread" | "status">) => void;
  updateQueryStatus: (queryId: string, status: QueryStatus) => void;
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
          graph: { ...s.workspace.graph, nodes: previous.nodes, edges: previous.edges },
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
          graph: { ...s.workspace.graph, nodes: next.nodes, edges: next.edges },
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
          n.id === id ? { ...n, ...patch } : n,
        ),
      });
    }),

  removeNode: (id) =>
    set((s) => {
      if (!s.workspace.graph.nodes.some((node) => node.id === id)) return s;
      return recordGraphMutation(s, {
        nodes: s.workspace.graph.nodes.filter((n) => n.id !== id),
        edges: s.workspace.graph.edges.filter(
          (e) => e.source !== id && e.target !== id,
        ),
      });
    }),

  addEdge: (edge) =>
    set((s) => recordGraphMutation(s, {
      ...s.workspace.graph,
      edges: [...s.workspace.graph.edges, edge],
    })),

  removeEdge: (edgeId) =>
    set((s) => {
      if (!s.workspace.graph.edges.some((edge) => edge.id === edgeId)) return s;
      return recordGraphMutation(s, {
        ...s.workspace.graph,
        edges: s.workspace.graph.edges.filter((e) => e.id !== edgeId),
      });
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
        workspace: {
          ...s.workspace,
          queries: [...s.workspace.queries, query],
        },
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
      const reply: Reply = {
        ...replyPartial,
        id: generateId("r"),
        createdAt: Date.now(),
      };
      return {
        workspace: {
          ...s.workspace,
          queries: s.workspace.queries.map((q) =>
            q.id === queryId ? { ...q, thread: [...q.thread, reply] } : q,
          ),
        },
      };
    }),

  // ── Timeline ───────────────────────────────────────────────────────────
  addTimelineEvent: (partial) =>
    set((s) => {
      const event: TimelineEvent = {
        ...partial,
        id: generateId("t"),
        timestamp: Date.now(),
      };
      return {
        workspace: {
          ...s.workspace,
          timeline: [event, ...s.workspace.timeline],
        },
      };
    }),
}));


// Persist workspace content and graph history locally; UI-only state stays ephemeral.
if (typeof window !== "undefined") {
  useWorkspaceStore.subscribe((state, previousState) => {
    if (state.workspace !== previousState.workspace) {
      persistWorkspace(state.workspace);
    }

    if (
      state.pastGraphStates !== previousState.pastGraphStates ||
      state.futureGraphStates !== previousState.futureGraphStates
    ) {
      persistGraphHistory(state.workspace.id, state.pastGraphStates, state.futureGraphStates);
    }
  });
}
