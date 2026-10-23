import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  MarkerType,
  ConnectionMode,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { SystemNode } from "@/components/nodes/SystemNode";
import { StickyNoteNode } from "@/components/nodes/StickyNoteNode";
import { TextNode } from "@/components/nodes/TextNode";
import { ShapeNode } from "@/components/nodes/ShapeNode";
import { DrawLayer } from "@/components/canvas/DrawLayer";

import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { useSimulationStore } from "@/store/simulationStore";
import { generateId } from "@/lib/id";
import { SHAPE_DEFAULT_SIZE, STICKY_DEFAULT_SIZE } from "@/lib/canvas";
import type {
  CanvasEdge,
  CanvasNode,
  GraphEdge,
  GraphNode,
} from "@/domain/types";

const nodeTypes = {
  system: SystemNode,
  sticky: StickyNoteNode,
  text: TextNode,
  shape: ShapeNode,
};

const CREATE_TOOLS = new Set(["sticky", "text", "shape", "frame"]);

function nodeToRF(
  n: CanvasNode,
  selectedId: string | null,
  queryCountMap: Record<string, number>,
  simStatuses: Record<string, string>,
): Node {
  const base = {
    id: n.id,
    position: n.position,
    selected: n.id === selectedId,
    hidden: n.hidden,
    draggable: n.locked ? false : undefined,
    data: {} as Record<string, unknown>,
  };

  switch (n.type) {
    case "architecture":
      return {
        ...base,
        type: "system",
        data: {
          kind: n.kind,
          label: n.label,
          status: simStatuses[n.id] ?? n.status,
          meta: n.meta,
          queryCount: queryCountMap[n.id] ?? 0,
        },
      };
    case "sticky":
      return {
        ...base,
        type: "sticky",
        style: { width: n.width ?? STICKY_DEFAULT_SIZE.width, height: n.height ?? STICKY_DEFAULT_SIZE.height },
        data: { text: n.text, color: n.color, template: n.template, align: n.align },
      };
    case "text":
      return {
        ...base,
        type: "text",
        style: { width: n.width ?? 200 },
        data: { content: n.content, size: n.size },
      };
    case "shape":
      return {
        ...base,
        type: "shape",
        style: {
          width: n.width ?? SHAPE_DEFAULT_SIZE[n.shape].width,
          height: n.height ?? SHAPE_DEFAULT_SIZE[n.shape].height,
        },
        data: { shape: n.shape, label: n.label, fill: n.fill, border: n.border, title: n.title },
      };
  }
}

function edgeToRF(e: CanvasEdge, selectedId: string | null, simPhase: string): Edge {
  const isDataflow = e.kind === "dataflow";
  const isDegraded = e.status === "degraded" || e.status === "severed";
  const isSevered = e.status === "severed";
  const simActive = simPhase !== "idle";

  const stroke = isDegraded
    ? "var(--accent-red)"
    : isDataflow
    ? simActive
      ? "var(--accent-violet)"
      : "var(--border-strong)"
    : "var(--accent-cyan)";

  return {
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    selected: e.id === selectedId,
    type: isDataflow ? "smoothstep" : e.style === "straight" ? "straight" : "default",
    animated: e.animated && !isDegraded && isDataflow,
    style: {
      stroke,
      strokeWidth: isDataflow ? 1.75 : 2,
      strokeDasharray: isSevered ? "5,4" : isDataflow ? undefined : "6,5",
      opacity: isDataflow ? 0.85 : 0.8,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: stroke,
      width: isDataflow ? 16 : 18,
      height: isDataflow ? 16 : 18,
    },
    labelStyle: { fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "var(--font-mono)" },
    labelBgStyle: { fill: "var(--surface-0)", fillOpacity: 0.95 },
    labelBgPadding: [4, 4] as [number, number],
    labelBgBorderRadius: 4,
  };
}

export function CanvasStage() {
  const graphNodes = useWorkspaceStore((s) => s.workspace.graph.nodes);
  const graphEdges = useWorkspaceStore((s) => s.workspace.graph.edges);
  const queries = useWorkspaceStore((s) => s.workspace.queries);
  const setNodes = useWorkspaceStore((s) => s.setNodes);
  const addNode = useWorkspaceStore((s) => s.addNode);
  const updateNode = useWorkspaceStore((s) => s.updateNode);
  const removeNodes = useWorkspaceStore((s) => s.removeNodes);
  const removeEdges = useWorkspaceStore((s) => s.removeEdges);
  const addEdgeStore = useWorkspaceStore((s) => s.addEdge);
  const addTimeline = useWorkspaceStore((s) => s.addTimelineEvent);

  const simPhase = useSimulationStore((s) => s.phase);
  const simStatuses = useSimulationStore((s) => s.statuses);

  const {
    activeTool, selectNode, selectEdge, setActivePanel, openRaiseQuery,
    selectedNodeId, selectedEdgeId, mode, stickyColor, shapeKind,
  } = useUIStore();

  const { screenToFlowPosition } = useReactFlow();

  const queryCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    queries.forEach((q) => {
      if (q.target.kind === "node" && q.status !== "resolved") {
        map[q.target.id] = (map[q.target.id] ?? 0) + 1;
      }
    });
    return map;
  }, [queries]);

  const rfNodes = useMemo(
    () => graphNodes.map((n) => nodeToRF(n, selectedNodeId, queryCountMap, simStatuses)),
    [graphNodes, selectedNodeId, queryCountMap, simStatuses],
  );
  const rfEdges = useMemo(
    () => graphEdges.map((e) => edgeToRF(e, selectedEdgeId, simPhase)),
    [graphEdges, selectedEdgeId, simPhase],
  );

  const [nodes, setRFNodes, onNodesChangeInternal] = useNodesState(rfNodes);
  const [edges, setRFEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => { setRFNodes(rfNodes); }, [rfNodes, setRFNodes]);
  useEffect(() => { setRFEdges(rfEdges); }, [rfEdges, setRFEdges]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeInternal(changes);
    for (const c of changes) {
      if (c.type === "dimensions" && c.resizing === false && c.dimensions) {
        updateNode(c.id, { width: c.dimensions.width, height: c.dimensions.height });
      }
    }
  }, [onNodesChangeInternal, updateNode]);

  const onNodeDragStop = useCallback(() => {
    // Persist positions for all nodes (supports multi-drag) from RF state.
    setNodes(
      graphNodes.map((n) => {
        const rf = nodes.find((r) => r.id === n.id);
        return rf ? { ...n, position: rf.position } : n;
      }),
    );
  }, [graphNodes, nodes, setNodes]);

  const onConnect = useCallback((params: Connection) => {
    const newEdge: CanvasEdge = {
      id: generateId("e"),
      source: params.source!,
      target: params.target!,
      kind: mode === "architecture" ? "dataflow" : "brainstorm",
      style: "curved",
      animated: mode === "architecture",
    };
    addEdgeStore(newEdge);
    addTimeline({
      kind: "edge-added",
      description: `${mode === "architecture" ? "Data-flow" : "Connection"} added`,
      author: "You",
      nodeId: params.source ?? undefined,
    });
  }, [addEdgeStore, addTimeline, mode]);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    removeNodes(deleted.map((n) => n.id));
  }, [removeNodes]);

  const onEdgesDelete = useCallback((deleted: Edge[]) => {
    removeEdges(deleted.map((e) => e.id));
  }, [removeEdges]);

  const makeNodeAt = useCallback((pos: { x: number; y: number }): CanvasNode | null => {
    switch (activeTool) {
      case "sticky":
        return {
          id: generateId("note"), type: "sticky", position: pos,
          width: STICKY_DEFAULT_SIZE.width, height: STICKY_DEFAULT_SIZE.height,
          text: "", color: stickyColor, align: "left",
        };
      case "text":
        return { id: generateId("txt"), type: "text", position: pos, content: "", size: "md" };
      case "shape": {
        const size = SHAPE_DEFAULT_SIZE[shapeKind];
        return { id: generateId("sh"), type: "shape", position: pos, shape: shapeKind, ...size };
      }
      case "frame":
        return {
          id: generateId("frm"), type: "shape", position: pos, shape: "frame",
          width: SHAPE_DEFAULT_SIZE.frame.width, height: SHAPE_DEFAULT_SIZE.frame.height,
          title: "Section",
        };
      default:
        return null;
    }
  }, [activeTool, stickyColor, shapeKind]);

  const onPaneClick = useCallback((evt: React.MouseEvent) => {
    if (CREATE_TOOLS.has(activeTool)) {
      const pos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
      const node = makeNodeAt(pos);
      if (node) {
        addNode(node);
        selectNode(node.id);
        addTimeline({ kind: "node-added", description: "Added canvas object", author: "You", nodeId: node.id });
      }
      return;
    }
    selectNode(null);
    selectEdge(null);
  }, [activeTool, screenToFlowPosition, makeNodeAt, addNode, selectNode, addTimeline]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (activeTool === "comment") {
      openRaiseQuery(node.id);
      return;
    }
    selectNode(node.id);
    setActivePanel("queries");
  }, [activeTool, openRaiseQuery, selectNode, setActivePanel]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    selectEdge(edge.id);
  }, [selectEdge]);

  const isDraw = activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser";
  const likeSelect = activeTool === "select" || activeTool === "components" || activeTool === "comment";

  const panOnDrag = activeTool === "hand";
  const selectionOnDrag = likeSelect;
  const nodesDraggable = likeSelect;
  const nodesConnectable = likeSelect || activeTool === "connector";
  const elementsSelectable = !isDraw;
  const connectionMode = activeTool === "connector" ? ConnectionMode.Loose : ConnectionMode.Strict;

  return (
    <div className="bv-canvas" style={{ width: "100%", height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        panOnDrag={panOnDrag}
        selectionOnDrag={selectionOnDrag}
        nodesDraggable={nodesDraggable}
        nodesConnectable={nodesConnectable}
        elementsSelectable={elementsSelectable}
        connectionMode={connectionMode}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
        minZoom={0.12}
        maxZoom={2.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="var(--canvas-dot)" />
        <Controls position="bottom-right" style={{ bottom: 90 }} showInteractive={false} />
        <MiniMap
          position="bottom-right"
          style={{ bottom: 20 }}
          nodeColor={(n) => {
            const t = n.type;
            if (t === "sticky") return "var(--accent-amber)";
            if (t === "text") return "var(--accent-cyan)";
            if (t === "shape") return "var(--border-strong)";
            const s = (n.data as { status?: string }).status;
            if (s === "down" || s === "overloaded") return "var(--accent-red)";
            if (s === "degraded") return "var(--accent-amber)";
            return "var(--accent-violet)";
          }}
          maskColor="rgba(247,248,250,.7)"
        />

        {simPhase !== "idle" && (
          <Panel position="top-center">
            <div className="bv-sim-banner" style={{
              background: "var(--surface-0)", border: `1.5px solid var(--accent-red)`,
              borderRadius: 8, padding: "5px 16px", display: "flex", alignItems: "center", gap: 8,
              color: "var(--accent-red)", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
              boxShadow: "var(--shadow-md)", letterSpacing: "0.05em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-red)", animation: "blink 1.2s steps(1) infinite" }} />
              FAILURE SIMULATION — {simPhase.toUpperCase()}
              <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            </div>
          </Panel>
        )}
      </ReactFlow>

      <DrawLayer />
    </div>
  );
}

// Re-export the architecture projection type for the engine seam (kept narrow).
export type { GraphNode, GraphEdge };
