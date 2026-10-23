import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ComponentKind, NodeStatus } from "@/domain/types";
import { NodeIcon } from "@/components/ui/NodeIcon";
import { kindColor, statusColor } from "@/lib/tokens";
import { useSimulationStore } from "@/store/simulationStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";

export interface SystemNodeData {
  kind: ComponentKind;
  label: string;
  status: NodeStatus;
  meta?: { metric?: string; detail?: string };
  queryCount?: number;
  [key: string]: unknown;
}

export const SystemNode = memo(function SystemNode({ id, data, selected }: NodeProps) {
  const { kind, label, meta, queryCount } = data as SystemNodeData;
  const [hovered, setHovered] = useState(false);

  // Live status: simulation overrides workspace status
  const simPhase = useSimulationStore((s) => s.phase);
  const simStatuses = useSimulationStore((s) => s.statuses);
  const wsNode = useWorkspaceStore((s) => s.workspace.graph.nodes.find((n) => n.id === id));
  const status: NodeStatus = (simPhase !== "idle" ? simStatuses[id] : undefined) ?? wsNode?.status ?? "healthy";

  const openQuery = useUIStore((s) => s.openRaiseQuery);

  const accent = kindColor(kind);
  const sColor = statusColor(status);
  const isDown = status === "down";
  const isDegraded = status === "degraded" || status === "overloaded";

  // Border logic: selected > status-alarm > hover > default
  const borderColor = selected
    ? "var(--accent-violet)"
    : isDown || isDegraded
    ? sColor
    : hovered
    ? "var(--border-strong)"
    : "var(--border)";

  const boxShadow = selected
    ? "var(--shadow-md), var(--glow-violet)"
    : isDown
    ? `0 0 0 3px rgba(214,48,49,.14), var(--shadow-sm)`
    : isDegraded
    ? `0 0 0 3px rgba(225,112,85,.12), var(--shadow-sm)`
    : hovered
    ? "var(--shadow-md)"
    : "var(--shadow-xs)";

  return (
    <div
      className="bit-node"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={() => openQuery(id)}
      aria-label={`${label} — ${status}`}
      style={{
        width: 180,
        background: "var(--surface-0)",
        border: `1.5px solid ${borderColor}`,
        borderRadius: "var(--r-lg)",
        boxShadow,
        transition: "border-color var(--t-base), box-shadow var(--t-base)",
        cursor: "default",
        userSelect: "none",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ left: -5, background: "var(--surface-0)", borderColor: "var(--border-strong)" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ right: -5, background: "var(--surface-0)", borderColor: "var(--border-strong)" }}
      />

      {/* Query badge */}
      {(queryCount ?? 0) > 0 && (
        <div
          aria-label={`${queryCount} open queries`}
          style={{
            position: "absolute", top: -7, right: -7,
            minWidth: 16, height: 16,
            borderRadius: "var(--r-full)",
            background: "var(--accent-pink)",
            color: "#fff",
            fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px",
            border: "1.5px solid var(--surface-0)",
            fontFamily: "var(--font-mono)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          {queryCount}
        </div>
      )}

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px 8px",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "var(--r-sm)",
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <NodeIcon kind={kind} size={15} color={accent} />
        </div>

        {/* Label + type */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="truncate"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.3,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
              marginTop: 1,
            }}
          >
            {kind.replace(/-/g, " ").toUpperCase()}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "0 12px" }} />

      {/* Metrics + status */}
      <div style={{ padding: "7px 12px 9px", display: "flex", flexDirection: "column", gap: 3 }}>
        {meta?.metric && (
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: accent,
              fontWeight: 500,
            }}
          >
            {meta.metric}
          </div>
        )}
        {meta?.detail && (
          <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
            {meta.detail}
          </div>
        )}

        {/* Status pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 3,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: sColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: sColor,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            {status.toUpperCase()}
          </span>

          {/* Failure marker */}
          {isDown && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 8,
                background: "rgba(214,48,49,.1)",
                color: "var(--status-down)",
                borderRadius: "var(--r-xs)",
                padding: "1px 4px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                border: "1px solid rgba(214,48,49,.2)",
              }}
            >
              ✕ DOWN
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
