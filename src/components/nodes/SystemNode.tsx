import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ComponentKind, NodeStatus } from "@/domain/types";
import { NodeIcon } from "@/components/ui/NodeIcon";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { useSimulationStore } from "@/store/simulationStore";

export interface SystemNodeData {
  kind: ComponentKind;
  label: string;
  status: NodeStatus;
  meta?: { metric?: string; detail?: string };
  queryCount?: number;
  [key: string]: unknown;
}

const KIND_COLORS: Record<ComponentKind, string> = {
  "web-client":     "#55E6FF",
  "mobile-client":  "#55E6FF",
  "api-gateway":    "#55E6FF",
  "load-balancer":  "#55E6FF",
  "service":        "#A78BFA",
  "worker":         "#A78BFA",
  "serverless":     "#A78BFA",
  "database":       "#57E3A0",
  "cache":          "#57E3A0",
  "object-storage": "#57E3A0",
  "message-queue":  "#FFBF69",
  "event-stream":   "#FFBF69",
  "cdn":            "#98A6BD",
  "external-api":   "#98A6BD",
  "firewall":       "#98A6BD",
};

const STATUS_BORDER: Record<NodeStatus, string> = {
  healthy:    "#283349",
  degraded:   "#FFBF69",
  overloaded: "#FF667D",
  down:       "#FF667D",
};

const STATUS_BG: Record<NodeStatus, string> = {
  healthy:    "rgba(17,24,39,0.95)",
  degraded:   "rgba(255,191,105,0.05)",
  overloaded: "rgba(255,102,125,0.08)",
  down:       "rgba(255,102,125,0.12)",
};

export const SystemNode = memo(function SystemNode({ id, data, selected }: NodeProps) {
  const { kind, label, meta, queryCount } = data as SystemNodeData;
  const [hovered, setHovered] = useState(false);
  const nodeStatus = useSimulationStore((s) => s.phase !== "idle" ? s.statuses[id] : null);
  const wsNode = useWorkspaceStore((s) => s.workspace.graph.nodes.find((n) => n.id === id));
  const status: NodeStatus = nodeStatus ?? wsNode?.status ?? "healthy";

  const accentColor = KIND_COLORS[kind] ?? "#55E6FF";
  const borderColor = selected ? "#55E6FF" : hovered ? accentColor + "88" : STATUS_BORDER[status];
  const bgColor = STATUS_BG[status];

  const isDown = status === "down";
  const isDegraded = status === "degraded" || status === "overloaded";

  const openQuery = useUIStore((s) => s.openRaiseQuery);

  return (
    <div
      className="bit-node"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={() => openQuery(id)}
      style={{
        width: 180,
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: "10px 12px",
        fontFamily: "var(--font-ui)",
        position: "relative",
        boxShadow: selected
          ? `0 0 0 2px #55E6FF44, var(--shadow-md)`
          : isDown
          ? `0 0 16px rgba(255,102,125,.2)`
          : isDegraded
          ? `0 0 12px rgba(255,191,105,.15)`
          : hovered
          ? `0 0 12px ${accentColor}22, var(--shadow-sm)`
          : "var(--shadow-sm)",
        transition: "all .15s ease",
        opacity: isDown ? 0.9 : 1,
        cursor: "default",
      }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Left} style={{ left: -5 }} />
      <Handle type="source" position={Position.Right} style={{ right: -5 }} />

      {/* Query badge */}
      {(queryCount ?? 0) > 0 && (
        <div style={{
          position: "absolute", top: -6, right: -6,
          width: 16, height: 16, borderRadius: "50%",
          background: "#FFBF69", color: "#090D16",
          fontSize: 9, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1.5px solid var(--bg)",
          fontFamily: "var(--font-mono)",
        }}>
          {queryCount}
        </div>
      )}

      {/* Failure indicator */}
      {isDown && (
        <div style={{
          position: "absolute", top: -6, left: -6,
          width: 14, height: 14, borderRadius: "50%",
          background: "#FF667D", border: "1.5px solid var(--bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, color: "white",
        }}>
          ✕
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 7,
          background: `${accentColor}15`,
          border: `1px solid ${accentColor}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accentColor, flexShrink: 0,
        }}>
          <NodeIcon kind={kind} size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: "var(--text)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}>
            {label}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
            {kind.replace(/-/g, " ").toUpperCase()}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "0 0 8px" }} />

      {/* Meta */}
      {meta && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {meta.metric && (
            <div style={{ fontSize: 11, color: accentColor, fontFamily: "var(--font-mono)", fontWeight: 500 }}>
              {meta.metric}
            </div>
          )}
          {meta.detail && (
            <div style={{ fontSize: 10, color: "var(--text-3)" }}>
              {meta.detail}
            </div>
          )}
        </div>
      )}

      {/* Status indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: status === "healthy" ? "#57E3A0" : status === "degraded" ? "#FFBF69" : "#FF667D",
          boxShadow: `0 0 4px ${status === "healthy" ? "#57E3A0" : status === "degraded" ? "#FFBF69" : "#FF667D"}`,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          {status.toUpperCase()}
        </span>
      </div>
    </div>
  );
});
