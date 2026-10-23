import { useState } from "react";
import { X, Pencil, Check, MessageCircle, Zap } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { NodeIcon } from "@/components/ui/NodeIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { kindColor, priorityColor, PRIORITY_LABEL } from "@/lib/tokens";

export function Inspector() {
  const selectedNodeId  = useUIStore((s) => s.selectedNodeId);
  const selectNode      = useUIStore((s) => s.selectNode);
  const openRaiseQuery  = useUIStore((s) => s.openRaiseQuery);
  const setFailureLab   = useUIStore((s) => s.setFailureLabOpen);

  const node   = useWorkspaceStore((s) =>
    selectedNodeId ? s.workspace.graph.nodes.find((n) => n.id === selectedNodeId) : null,
  );
  const queries = useWorkspaceStore((s) =>
    selectedNodeId
      ? s.workspace.queries.filter(
          (q) => q.target.kind === "node" && q.target.id === selectedNodeId,
        )
      : [],
  );
  const updateNode = useWorkspaceStore((s) => s.updateNode);

  const [editLabel, setEditLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");

  if (!selectedNodeId || !node) return null;

  const accent = kindColor(node.kind);
  const openQueries = queries.filter((q) => q.status !== "resolved");

  const commitLabel = () => {
    if (labelDraft.trim()) updateNode(node.id, { label: labelDraft.trim() });
    setEditLabel(false);
  };

  return (
    <div
      style={{
        width: 252,
        height: "100%",
        background: "var(--surface-0)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px 8px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Inspector
        </span>
        <button
          onClick={() => selectNode(null)}
          aria-label="Close inspector"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-tertiary)",
            display: "flex",
            padding: 2,
          }}
        >
          <X size={13} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {/* Identity card */}
        <div
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "10px 12px",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--r-sm)",
                background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <NodeIcon kind={node.kind} size={17} color={accent} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {editLabel ? (
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input
                    value={labelDraft}
                    onChange={(e) => setLabelDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitLabel();
                      if (e.key === "Escape") setEditLabel(false);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      background: "var(--surface-0)",
                      border: "1.5px solid var(--accent-violet)",
                      borderRadius: "var(--r-sm)",
                      color: "var(--text-primary)",
                      fontSize: 12,
                      padding: "3px 6px",
                      fontFamily: "var(--font-ui)",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={commitLabel}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-green)", display: "flex" }}
                  >
                    <Check size={13} />
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {node.label}
                  </span>
                  <button
                    onClick={() => { setLabelDraft(node.label); setEditLabel(true); }}
                    aria-label="Edit label"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", padding: 0 }}
                  >
                    <Pencil size={10} />
                  </button>
                </div>
              )}
              <div
                style={{
                  fontSize: 9,
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                  marginTop: 1,
                }}
              >
                {node.kind.replace(/-/g, " ").toUpperCase()}
              </div>
            </div>
          </div>

          <StatusBadge status={node.status} size="xs" />
        </div>

        {/* Metrics */}
        {node.meta && (
          <Section title="Metrics">
            {node.meta.metric && (
              <MetricRow label="Throughput" value={node.meta.metric} valueColor={accent} mono />
            )}
            {node.meta.detail && (
              <MetricRow label="Detail" value={node.meta.detail} />
            )}
            <MetricRow label="ID" value={node.id} mono />
          </Section>
        )}

        {/* Open queries */}
        {openQueries.length > 0 && (
          <Section title={`Open Queries (${openQueries.length})`}>
            {openQueries.map((q) => (
              <div
                key={q.id}
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  padding: "7px 9px",
                  marginBottom: 5,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-primary)",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    marginBottom: 4,
                  }}
                >
                  {q.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: priorityColor(q.priority),
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      color: priorityColor(q.priority),
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                    }}
                  >
                    {PRIORITY_LABEL[q.priority].toUpperCase()}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 9,
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {q.thread.length} replies
                  </span>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
          <ActionBtn
            icon={<MessageCircle size={12} />}
            label="Raise Query"
            accent="var(--accent-pink)"
            onClick={() => openRaiseQuery(node.id)}
          />
          <ActionBtn
            icon={<Zap size={12} />}
            label="Simulate Failure"
            accent="var(--accent-red)"
            onClick={() => setFailureLab(true)}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function MetricRow({
  label,
  value,
  valueColor,
  mono,
}: {
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
      }}
    >
      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{label}</span>
      <span
        style={{
          fontSize: 11,
          color: valueColor ?? "var(--text-primary)",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)",
          fontWeight: 500,
          maxWidth: 130,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        background: `color-mix(in srgb, ${accent} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
        borderRadius: "var(--r-sm)",
        color: accent,
        fontSize: 11,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
        transition: "background var(--t-fast)",
        width: "100%",
        textAlign: "left",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
