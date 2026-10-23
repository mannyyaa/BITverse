import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SystemNode } from "@/components/nodes/SystemNode";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { useSimulationStore } from "@/store/simulationStore";
import { generateId } from "@/lib/id";
import type { GraphNode, GraphEdge } from "@/domain/types";

const nodeTypes = { system: SystemNode };

function graphNodeToRF(
  n: GraphNode,
  queryCountMap: Record<string, number>,
  simStatuses: Record<string, string>,
): Node {
  return {
    id: n.id,
    type: "system",
    position: n.position,
    data: {
      kind: n.kind,
      label: n.label,
      status: simStatuses[n.id] ?? n.status,
      meta: n.meta,
      queryCount: queryCountMap[n.id] ?? 0,
    },
  };
}

function graphEdgeToRF(e: GraphEdge, simPhase: string): Edge {
  const isDegraded = e.status === "degraded" || e.status === "severed";
  const isSevered  = e.status === "severed";
  const isSimActive = simPhase !== "idle";

  return {
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.animated && !isDegraded,
    type: "smoothstep",
    style: {
      stroke: isDegraded
        ? "var(--accent-red, #d63031)"
        : isSimActive
        ? "var(--accent-violet, #6c5ce7)"
        : "var(--border-strong, #c8cdd9)",
      strokeWidth: 1.5,
      strokeDasharray: isSevered ? "5,4" : undefined,
      opacity: isDegraded ? 0.9 : 0.7,
    },
    labelStyle: {
      fill: "var(--text-tertiary)",
      fontSize: 10,
      fontFamily: "var(--font-mono)",
    },
    labelBgStyle: {
      fill: "var(--surface-0)",
      fillOpacity: 0.95,
    },
    labelBgPadding: [4, 4] as [number, number],
    labelBgBorderRadius: 4,
  };
}

export function CanvasStage() {
  const graphNodes      = useWorkspaceStore((s) => s.workspace.graph.nodes);
  const graphEdges      = useWorkspaceStore((s) => s.workspace.graph.edges);
  const queries         = useWorkspaceStore((s) => s.workspace.queries);
  const setNodes        = useWorkspaceStore((s) => s.setNodes);
  const addEdgeStore    = useWorkspaceStore((s) => s.addEdge);
  const addTimeline     = useWorkspaceStore((s) => s.addTimelineEvent);

  const simPhase    = useSimulationStore((s) => s.phase);
  const simStatuses = useSimulationStore((s) => s.statuses);

  const selectNode    = useUIStore((s) => s.selectNode);
  const selectEdge    = useUIStore((s) => s.selectEdge);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const activeTool    = useUIStore((s) => s.activeTool);

  /* open-query badge counts */
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
    () => graphNodes.map((n) => graphNodeToRF(n, queryCountMap, simStatuses)),
    [graphNodes, queryCountMap, simStatuses],
  );
  const rfEdges = useMemo(
    () => graphEdges.map((e) => graphEdgeToRF(e, simPhase)),
    [graphEdges, simPhase],
  );

  const [nodes, setRFNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setRFEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => { setRFNodes(rfNodes); }, [rfNodes, setRFNodes]);
  useEffect(() => { setRFEdges(rfEdges); }, [rfEdges, setRFEdges]);

  const onNodeDragStop = useCallback(
    (_evt: unknown, node: Node) => {
      setNodes(graphNodes.map((n) => (n.id === node.id ? { ...n, position: node.position } : n)));
    },
    [graphNodes, setNodes],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: GraphEdge = {
        id: generateId("e"),
        source: params.source,
        target: params.target,
        animated: true,
      };
      addEdgeStore(newEdge);
      addTimeline({
        kind: "edge-added",
        description: `Connection added: ${params.source} → ${params.target}`,
        author: "You",
        nodeId: params.source,
      });
    },
    [addEdgeStore, addTimeline],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
      setActivePanel("queries");
    },
    [selectNode, setActivePanel],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => { selectEdge(edge.id); },
    [selectEdge],
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        panOnDrag={activeTool === "pan" || activeTool === "select"}
        panOnScroll={false}
        zoomOnScroll
        selectionOnDrag={activeTool === "select"}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        defaultEdgeOptions={{ type: "smoothstep", animated: true }}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
        minZoom={0.15}
        maxZoom={2.5}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--canvas-dot, #dde1e9)"
        />

        <Controls position="bottom-right" style={{ bottom: 90 }} />

        <MiniMap
          position="bottom-right"
          style={{ bottom: 20 }}
          nodeColor={(n) => {
            const s = (n.data as { status?: string }).status;
            if (s === "down" || s === "overloaded") return "#d63031";
            if (s === "degraded") return "#e17055";
            return "#c8cdd9";
          }}
          maskColor="rgba(247,248,250,.7)"
        />

        {/* Simulation banner */}
        {simPhase !== "idle" && (
          <Panel position="top-center">
            <div
              style={{
                background: "#fff",
                border: "1.5px solid var(--accent-red, #d63031)",
                borderRadius: 8,
                padding: "5px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--accent-red, #d63031)",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                boxShadow: "var(--shadow-md)",
                letterSpacing: "0.05em",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent-red, #d63031)",
                  flexShrink: 0,
                  animation: "blink 1.2s steps(1) infinite",
                }}
              />
              FAILURE SIMULATION — {simPhase.toUpperCase()}
              <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
