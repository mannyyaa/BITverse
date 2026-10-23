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

interface WorkspaceState {
  workspace: Workspace;

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

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: demoWorkspace,

  // ── Graph ──────────────────────────────────────────────────────────────
  setNodes: (nodes) =>
    set((s) => ({
      workspace: { ...s.workspace, graph: { ...s.workspace.graph, nodes } },
    })),

  setEdges: (edges) =>
    set((s) => ({
      workspace: { ...s.workspace, graph: { ...s.workspace.graph, edges } },
    })),

  addNode: (node) =>
    set((s) => {
      const next: Workspace = {
        ...s.workspace,
        graph: { ...s.workspace.graph, nodes: [...s.workspace.graph.nodes, node] },
      };
      return { workspace: next };
    }),

  updateNode: (id, patch) =>
    set((s) => ({
      workspace: {
        ...s.workspace,
        graph: {
          ...s.workspace.graph,
          nodes: s.workspace.graph.nodes.map((n) =>
            n.id === id ? { ...n, ...patch } : n,
          ),
        },
      },
    })),

  removeNode: (id) =>
    set((s) => ({
      workspace: {
        ...s.workspace,
        graph: {
          nodes: s.workspace.graph.nodes.filter((n) => n.id !== id),
          edges: s.workspace.graph.edges.filter(
            (e) => e.source !== id && e.target !== id,
          ),
        },
      },
    })),

  addEdge: (edge) =>
    set((s) => ({
      workspace: {
        ...s.workspace,
        graph: { ...s.workspace.graph, edges: [...s.workspace.graph.edges, edge] },
      },
    })),

  removeEdge: (edgeId) =>
    set((s) => ({
      workspace: {
        ...s.workspace,
        graph: {
          ...s.workspace.graph,
          edges: s.workspace.graph.edges.filter((e) => e.id !== edgeId),
        },
      },
    })),

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
