import { useState } from "react";
import { X, MessageCircle, Zap, Pencil, Check } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { NodeIcon } from "@/components/ui/NodeIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ComponentKind } from "@/domain/types";

const KIND_COLORS: Partial<Record<ComponentKind, string>> = {
  "web-client": "#55E6FF", "mobile-client": "#55E6FF", "api-gateway": "#55E6FF", "load-balancer": "#55E6FF",
  "service": "#A78BFA", "worker": "#A78BFA", "serverless": "#A78BFA",
  "database": "#57E3A0", "cache": "#57E3A0", "object-storage": "#57E3A0",
  "message-queue": "#FFBF69", "event-stream": "#FFBF69",
  "cdn": "#98A6BD", "external-api": "#98A6BD", "firewall": "#98A6BD",
};

export function Inspector() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const selectNode = useUIStore((s) => s.selectNode);
  const openRaiseQuery = useUIStore((s) => s.openRaiseQuery);
  const setFailureLabOpen = useUIStore((s) => s.setFailureLabOpen);

  const node = useWorkspaceStore((s) =>
    selectedNodeId ? s.workspace.graph.nodes.find((n) => n.id === selectedNodeId) : null,
  );
  const queries = useWorkspaceStore((s) =>
    selectedNodeId
      ? s.workspace.queries.filter((q) => q.target.kind === "node" && q.target.id === selectedNodeId)
      : [],
  );
  const updateNode = useWorkspaceStore((s) => s.updateNode);

  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");

  if (!selectedNodeId || !node) return null;

  const color = KIND_COLORS[node.kind] ?? "#98A6BD";

  const startEdit = () => {
    setLabelDraft(node.label);
    setEditingLabel(true);
  };
  const commitEdit = () => {
    if (labelDraft.trim()) updateNode(node.id, { label: labelDraft.trim() });
    setEditingLabel(false);
  };

  const openQueries = queries.filter((q) => q.status !== "resolved");

  return (
    <div style={{
      width: 260, height: "100%",
      background: "var(--surface)",
      borderLeft: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", letterSpacing: ".06em", textTransform: "uppercase" }}>
          Inspector
        </span>
        <button
          onClick={() => selectNode(null)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 2 }}
          aria-label="Close inspector"
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Component identity */}
        <div style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 8, padding: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: `${color}18`, border: `1px solid ${color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color, flexShrink: 0,
            }}>
              <NodeIcon kind={node.kind} size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingLabel ? (
                <div style={{ display: "flex", gap: 4 }}>
                  <input
                    value={labelDraft}
                    onChange={(e) => setLabelDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingLabel(false); }}
                    autoFocus
                    style={{
                      flex: 1, background: "var(--bg)", border: "1px solid var(--cyan)",
                      borderRadius: 4, color: "var(--text)", fontSize: 12, padding: "2px 6px",
                      fontFamily: "var(--font-ui)", outline: "none",
                    }}
                  />
                  <button onClick={commitEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#57E3A0" }}>
                    <Check size={13} />
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{node.label}</span>
                  <button
                    onClick={startEdit}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0 }}
                    aria-label="Edit label"
                  >
                    <Pencil size={11} />
                  </button>
                </div>
              )}
              <div style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                {node.kind.replace(/-/g, " ").toUpperCase()}
              </div>
            </div>
          </div>
          <StatusBadge status={node.status} size="sm" />
        </div>

        {/* Metrics */}
        {node.meta && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
              Metrics
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {node.meta.metric && (
                <MetricRow label="Throughput" value={node.meta.metric} color={color} />
              )}
              {node.meta.detail && (
                <MetricRow label="Status" value={node.meta.detail} />
              )}
              <MetricRow label="Node ID" value={node.id} mono />
            </div>
          </div>
        )}

        {/* Open queries */}
        {openQueries.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
              Open Queries ({openQueries.length})
            </div>
            {openQueries.map((q) => (
              <div key={q.id} style={{
                padding: "8px 10px", background: "var(--surface-2)",
                border: "1px solid var(--border)", borderRadius: 6,
                marginBottom: 6,
              }}>
                <div style={{ fontSize: 11, color: "var(--text)", fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>
                  {q.title}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <PriorityDot priority={q.priority} />
                  <span style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                    {q.priority.toUpperCase()}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--text-3)" }}>
                    {q.thread.length} replies
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ActionBtn
            icon={<MessageCircle size={13} />}
            label="Raise Query"
            color="#FFBF69"
            onClick={() => openRaiseQuery(node.id)}
          />
          <ActionBtn
            icon={<Zap size={13} />}
            label="Simulate Failure"
            color="#FF667D"
            onClick={() => setFailureLabOpen(true)}
          />
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color, mono }: { label: string; value: string; color?: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 10, color: "var(--text-3)" }}>{label}</span>
      <span style={{
        fontSize: 10,
        color: color ?? "var(--text-2)",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)",
        fontWeight: 500,
      }}>
        {value}
      </span>
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = { low: "#57E3A0", medium: "#55E6FF", high: "#FFBF69", critical: "#FF667D" };
  return <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors[priority] ?? "#98A6BD", flexShrink: 0 }} />;
}

function ActionBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "7px 12px", background: `${color}10`,
        border: `1px solid ${color}25`, borderRadius: 6,
        color, fontSize: 11, fontWeight: 500,
        cursor: "pointer", fontFamily: "var(--font-ui)",
        transition: "background .15s",
        width: "100%",
      }}
    >
      {icon} {label}
    </button>
  );
}
