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

function graphNodeToRF(n: GraphNode, queryCountMap: Record<string, number>, simStatuses: Record<string, string>): Node {
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
  const isActive = simPhase !== "idle";
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.animated && !isDegraded,
    type: "smoothstep",
    style: {
      stroke: isDegraded ? "#FF667D" : isActive ? "#55E6FF44" : "#283349",
      strokeWidth: 1.5,
      strokeDasharray: e.status === "severed" ? "5,5" : undefined,
    },
    labelStyle: { fill: "#98A6BD", fontSize: 10, fontFamily: "var(--font-mono)" },
    labelBgStyle: { fill: "#111827", fillOpacity: 0.9 },
  };
}

export function CanvasStage() {
  const graphNodes = useWorkspaceStore((s) => s.workspace.graph.nodes);
  const graphEdges = useWorkspaceStore((s) => s.workspace.graph.edges);
  const queries = useWorkspaceStore((s) => s.workspace.queries);
  const setNodes = useWorkspaceStore((s) => s.setNodes);
  const addEdgeStore = useWorkspaceStore((s) => s.addEdge);
  const addTimelineEvent = useWorkspaceStore((s) => s.addTimelineEvent);

  const simPhase = useSimulationStore((s) => s.phase);
  const simStatuses = useSimulationStore((s) => s.statuses);

  const selectNode = useUIStore((s) => s.selectNode);
  const selectEdge = useUIStore((s) => s.selectEdge);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const activeTool = useUIStore((s) => s.activeTool);

  // Query count per node
  const queryCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    queries.forEach((q) => {
      if (q.target.kind === "node" && q.status !== "resolved") {
        map[q.target.id] = (map[q.target.id] ?? 0) + 1;
      }
    });
    return map;
  }, [queries]);

  const rfNodes = useMemo(() =>
    graphNodes.map((n) => graphNodeToRF(n, queryCountMap, simStatuses)),
    [graphNodes, queryCountMap, simStatuses]
  );

  const rfEdges = useMemo(() =>
    graphEdges.map((e) => graphEdgeToRF(e, simPhase)),
    [graphEdges, simPhase]
  );

  const [nodes, setRFNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setRFEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Keep RF in sync with store
  useEffect(() => { setRFNodes(rfNodes); }, [rfNodes, setRFNodes]);
  useEffect(() => { setRFEdges(rfEdges); }, [rfEdges, setRFEdges]);

  // Persist node positions back to store
  const onNodeDragStop = useCallback((_evt: unknown, node: Node) => {
    setNodes(
      graphNodes.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n,
      ),
    );
  }, [graphNodes, setNodes]);

  const onConnect = useCallback((params: Connection) => {
    const newEdge: GraphEdge = {
      id: generateId("e"),
      source: params.source,
      target: params.target,
      animated: true,
    };
    addEdgeStore(newEdge);
    addTimelineEvent({
      kind: "edge-added",
      description: `Connection added: ${params.source} → ${params.target}`,
      author: "You",
      nodeId: params.source,
    });
  }, [addEdgeStore, addTimelineEvent]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
    setActivePanel("queries");
  }, [selectNode, setActivePanel]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    selectEdge(edge.id);
  }, [selectEdge]);

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
        zoomOnScroll={true}
        selectionOnDrag={activeTool === "select"}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        defaultEdgeOptions={{ type: "smoothstep", animated: true }}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
        minZoom={0.2}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#283349"
        />
        <Controls
          position="bottom-right"
          style={{ bottom: 80 }}
        />
        <MiniMap
          position="bottom-right"
          nodeColor={(n) => {
            const s = (n.data as { status?: string }).status;
            if (s === "down" || s === "overloaded") return "#FF667D";
            if (s === "degraded") return "#FFBF69";
            return "#283349";
          }}
          maskColor="rgba(9,13,22,.7)"
          style={{ bottom: 24 }}
        />

        {/* Simulation overlay banner */}
        {simPhase !== "idle" && (
          <Panel position="top-center">
            <div style={{
              background: "rgba(255,102,125,.12)",
              border: "1px solid #FF667D",
              borderRadius: 8, padding: "6px 16px",
              display: "flex", alignItems: "center", gap: 8,
              color: "#FF667D", fontSize: 12, fontWeight: 600,
              fontFamily: "var(--font-mono)",
              backdropFilter: "blur(8px)",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF667D", boxShadow: "0 0 6px #FF667D", animation: "pulse-dot 1.5s ease-in-out infinite", flexShrink: 0 }} />
              FAILURE SIMULATION ACTIVE — {simPhase.toUpperCase()}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
