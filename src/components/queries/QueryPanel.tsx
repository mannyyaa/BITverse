import { useState } from "react";
import { ChevronDown, Check, RotateCcw, Send } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { Avatar } from "@/components/ui/Avatar";
import { formatTime } from "@/lib/id";
import type { Query, QueryStatus, Priority, QueryType } from "@/domain/types";

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#57E3A0", medium: "#55E6FF", high: "#FFBF69", critical: "#FF667D",
};

const TYPE_LABELS: Record<QueryType, string> = {
  question: "Question", issue: "Potential Issue", improvement: "Improvement",
};

const COLLABORATOR_COLORS: Record<string, string> = {
  Aanya: "#A78BFA", Rohan: "#57E3A0", You: "#55E6FF",
};

export function QueryPanel() {
  const queries = useWorkspaceStore((s) => s.workspace.queries);
  const updateStatus = useWorkspaceStore((s) => s.updateQueryStatus);
  const addReply = useWorkspaceStore((s) => s.addReply);
  const addTimelineEvent = useWorkspaceStore((s) => s.addTimelineEvent);
  const selectNode = useUIStore((s) => s.selectNode);

  const [filterStatus, setFilterStatus] = useState<QueryStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(queries[0]?.id ?? null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const filtered = queries.filter((q) => filterStatus === "all" || q.status === filterStatus);

  const handleResolve = (queryId: string) => {
    updateStatus(queryId, "resolved");
    addTimelineEvent({
      kind: "query-resolved",
      description: `Query resolved: ${queries.find((q) => q.id === queryId)?.title}`,
      author: "You",
      queryId,
    });
  };

  const handleReopen = (queryId: string) => updateStatus(queryId, "open");

  const handleReply = (queryId: string) => {
    const text = replyTexts[queryId]?.trim();
    if (!text) return;
    addReply(queryId, { author: "You", body: text });
    updateStatus(queryId, "in-discussion");
    setReplyTexts((s) => ({ ...s, [queryId]: "" }));
  };

  const focusNode = (q: Query) => {
    if (q.target.kind === "node") selectNode(q.target.id);
  };

  const counts = {
    open: queries.filter((q) => q.status === "open").length,
    "in-discussion": queries.filter((q) => q.status === "in-discussion").length,
    resolved: queries.filter((q) => q.status === "resolved").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Filters */}
      <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)", display: "flex", gap: 4 }}>
        {(["all", "open", "in-discussion", "resolved"] as const).map((s) => (
          <FilterChip
            key={s}
            label={s === "all" ? `All (${queries.length})` : s === "open" ? `Open (${counts.open})` : s === "in-discussion" ? `Active (${counts["in-discussion"]})` : `Resolved (${counts.resolved})`}
            active={filterStatus === s}
            onClick={() => setFilterStatus(s)}
          />
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
            No queries in this filter.
          </div>
        ) : (
          filtered.map((q) => (
            <QueryCard
              key={q.id}
              query={q}
              expanded={expandedId === q.id}
              onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
              onFocusNode={() => focusNode(q)}
              onResolve={() => handleResolve(q.id)}
              onReopen={() => handleReopen(q.id)}
              replyText={replyTexts[q.id] ?? ""}
              onReplyChange={(t) => setReplyTexts((s) => ({ ...s, [q.id]: t }))}
              onReply={() => handleReply(q.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CardProps {
  query: Query;
  expanded: boolean;
  onToggle: () => void;
  onFocusNode: () => void;
  onResolve: () => void;
  onReopen: () => void;
  replyText: string;
  onReplyChange: (t: string) => void;
  onReply: () => void;
}

function QueryCard({ query: q, expanded, onToggle, onFocusNode, onResolve, onReopen, replyText, onReplyChange, onReply }: CardProps) {
  const color = COLLABORATOR_COLORS[q.author] ?? "#98A6BD";
  const prColor = PRIORITY_COLORS[q.priority];
  const isResolved = q.status === "resolved";

  return (
    <div style={{
      borderBottom: "1px solid var(--border-subtle)",
      opacity: isResolved ? 0.7 : 1,
    }}>
      {/* Summary row */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "10px 14px", textAlign: "left",
          display: "flex", gap: 8, alignItems: "flex-start",
        }}
      >
        <Avatar name={q.author} color={color} initials={q.author.slice(0, 2).toUpperCase()} size={24} showTooltip={false} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", flex: 1, lineHeight: 1.4 }}>
              {q.title}
            </span>
            <ChevronDown size={12} color="var(--text-3)" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0, marginTop: 2 }} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
            <TypeBadge type={q.type} />
            <span style={{ fontSize: 9, color: prColor, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              {q.priority.toUpperCase()}
            </span>
            <StatusPill status={q.status} />
            <span style={{ fontSize: 9, color: "var(--text-3)", marginLeft: "auto" }}>{formatTime(q.createdAt)}</span>
          </div>
        </div>
      </button>

      {/* Expanded thread */}
      {expanded && (
        <div style={{ padding: "0 14px 12px" }}>
          <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 10 }}>{q.body}</p>

          <button
            onClick={onFocusNode}
            style={{ fontSize: 10, color: "var(--cyan)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 8 }}
          >
            → Focus component on canvas
          </button>

          {/* Thread */}
          {q.thread.map((r) => {
            const rc = COLLABORATOR_COLORS[r.author] ?? "#98A6BD";
            return (
              <div key={r.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Avatar name={r.author} color={rc} initials={r.author.slice(0, 2).toUpperCase()} size={20} showTooltip={false} />
                <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: 6, padding: "6px 9px" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: rc }}>{r.author}</span>
                    <span style={{ fontSize: 9, color: "var(--text-3)" }}>{formatTime(r.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>{r.body}</p>
                </div>
              </div>
            );
          })}

          {/* Reply input */}
          {!isResolved && (
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <textarea
                value={replyText}
                onChange={(e) => onReplyChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onReply(); }}
                placeholder="Add a reply... (⌘Enter to send)"
                rows={2}
                style={{
                  flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 6, color: "var(--text)", fontSize: 11, padding: "6px 8px",
                  fontFamily: "var(--font-ui)", resize: "none", outline: "none",
                }}
              />
              <button
                onClick={onReply}
                style={{ background: "var(--cyan)", border: "none", borderRadius: 6, padding: "0 10px", cursor: "pointer", color: "var(--bg)", display: "flex", alignItems: "center" }}
                aria-label="Send reply"
              >
                <Send size={12} />
              </button>
            </div>
          )}

          {/* Resolve/Reopen */}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {isResolved ? (
              <ActionButton icon={<RotateCcw size={11} />} label="Reopen" color="#FFBF69" onClick={onReopen} />
            ) : (
              <ActionButton icon={<Check size={11} />} label="Resolve" color="#57E3A0" onClick={onResolve} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "3px 8px", borderRadius: 20,
        background: active ? "var(--cyan)" : "var(--surface-2)",
        color: active ? "var(--bg)" : "var(--text-2)",
        border: active ? "none" : "1px solid var(--border)",
        fontSize: 10, fontWeight: active ? 700 : 400,
        cursor: "pointer", fontFamily: "var(--font-ui)",
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}

function TypeBadge({ type }: { type: QueryType }) {
  const colors: Record<QueryType, string> = { question: "#55E6FF", issue: "#FF667D", improvement: "#57E3A0" };
  return (
    <span style={{ fontSize: 9, color: colors[type], fontFamily: "var(--font-mono)", fontWeight: 600 }}>
      {TYPE_LABELS[type].toUpperCase()}
    </span>
  );
}

function StatusPill({ status }: { status: QueryStatus }) {
  const colors: Record<QueryStatus, string> = { open: "#55E6FF", "in-discussion": "#FFBF69", resolved: "#57E3A0" };
  return (
    <span style={{ fontSize: 9, color: colors[status], fontFamily: "var(--font-mono)" }}>
      {status.toUpperCase().replace("-", " ")}
    </span>
  );
}

function ActionButton({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
        background: `${color}15`, border: `1px solid ${color}30`,
        borderRadius: 5, color, fontSize: 10, fontWeight: 600,
        cursor: "pointer", fontFamily: "var(--font-ui)",
      }}
    >
      {icon}{label}
    </button>
  );
}
