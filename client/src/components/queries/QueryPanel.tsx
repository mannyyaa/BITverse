import { useState } from "react";
import { ChevronDown, Check, RotateCcw, Send, MapPin } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { Avatar } from "@/components/ui/Avatar";
import { formatTime } from "@/lib/id";
import { priorityColor, PRIORITY_LABEL } from "@/lib/tokens";
import type { Query, QueryStatus, QueryType } from "@/domain/types";

const AUTHOR_COLORS: Record<string, string> = {
  Aanya: "#6c5ce7",
  Rohan: "#00b894",
  You:   "#0984e3",
};

const TYPE_META: Record<QueryType, { label: string; color: string }> = {
  question:    { label: "Question",    color: "var(--accent-blue)"  },
  issue:       { label: "Issue",       color: "var(--accent-red)"   },
  improvement: { label: "Improvement", color: "var(--accent-green)" },
};

const STATUS_META: Record<QueryStatus, { label: string; color: string }> = {
  open:            { label: "Open",        color: "var(--accent-violet)" },
  "in-discussion": { label: "Active",      color: "var(--accent-amber)"  },
  resolved:        { label: "Resolved",    color: "var(--accent-green)"  },
};

export function QueryPanel() {
  const queries       = useWorkspaceStore((s) => s.workspace.queries);
  const updateStatus  = useWorkspaceStore((s) => s.updateQueryStatus);
  const addReply      = useWorkspaceStore((s) => s.addReply);
  const addTimeline   = useWorkspaceStore((s) => s.addTimelineEvent);
  const selectNode    = useUIStore((s) => s.selectNode);

  const [filter, setFilter] = useState<QueryStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(queries[0]?.id ?? null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const visible = queries.filter((q) => filter === "all" || q.status === filter);

  const counts = {
    open:            queries.filter((q) => q.status === "open").length,
    "in-discussion": queries.filter((q) => q.status === "in-discussion").length,
    resolved:        queries.filter((q) => q.status === "resolved").length,
  };

  const resolve = (id: string) => {
    updateStatus(id, "resolved");
    addTimeline({
      kind: "query-resolved",
      description: `Query resolved: "${queries.find((q) => q.id === id)?.title}"`,
      author: "You",
      queryId: id,
    });
  };

  const reply = (id: string) => {
    const text = (replyTexts[id] ?? "").trim();
    if (!text) return;
    addReply(id, { author: "You", body: text });
    updateStatus(id, "in-discussion");
    setReplyTexts((s) => ({ ...s, [id]: "" }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Filter chips */}
      <div
        style={{
          padding: "7px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: 4,
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {(["all", "open", "in-discussion", "resolved"] as const).map((s) => {
          const label =
            s === "all" ? `All (${queries.length})`
            : s === "open" ? `Open (${counts.open})`
            : s === "in-discussion" ? `Active (${counts["in-discussion"]})`
            : `Done (${counts.resolved})`;
          return (
            <FilterChip
              key={s}
              label={label}
              active={filter === s}
              onClick={() => setFilter(s)}
            />
          );
        })}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {visible.length === 0 && (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "var(--text-tertiary)",
              fontSize: 12,
            }}
          >
            No queries match this filter.
          </div>
        )}
        {visible.map((q) => (
          <QueryCard
            key={q.id}
            query={q}
            expanded={expandedId === q.id}
            onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
            onFocus={() => q.target.kind === "node" && selectNode(q.target.id)}
            onResolve={() => resolve(q.id)}
            onReopen={() => updateStatus(q.id, "open")}
            replyText={replyTexts[q.id] ?? ""}
            onReplyChange={(t) => setReplyTexts((s) => ({ ...s, [q.id]: t }))}
            onReply={() => reply(q.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── card ───────────────────────────────────────────────────────────────── */

interface CardProps {
  query: Query;
  expanded: boolean;
  onToggle: () => void;
  onFocus: () => void;
  onResolve: () => void;
  onReopen: () => void;
  replyText: string;
  onReplyChange: (t: string) => void;
  onReply: () => void;
}

function QueryCard({
  query: q,
  expanded,
  onToggle,
  onFocus,
  onResolve,
  onReopen,
  replyText,
  onReplyChange,
  onReply,
}: CardProps) {
  const authorColor = AUTHOR_COLORS[q.author] ?? "#7c849a";
  const typeMeta    = TYPE_META[q.type];
  const statusMeta  = STATUS_META[q.status];
  const isResolved  = q.status === "resolved";

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        opacity: isResolved ? 0.72 : 1,
        transition: "opacity var(--t-base)",
      }}
    >
      {/* Summary */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "9px 12px",
          textAlign: "left",
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <Avatar
          name={q.author}
          color={authorColor}
          initials={q.author.slice(0, 2).toUpperCase()}
          size={22}
          showTooltip={false}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 4,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-primary)",
                flex: 1,
                lineHeight: 1.4,
              }}
            >
              {q.title}
            </span>
            <ChevronDown
              size={12}
              color="var(--text-tertiary)"
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform var(--t-base)",
                flexShrink: 0,
                marginTop: 2,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
            <Pill color={typeMeta.color}>{typeMeta.label}</Pill>
            <Pill color={priorityColor(q.priority)}>{PRIORITY_LABEL[q.priority]}</Pill>
            <Pill color={statusMeta.color}>{statusMeta.label}</Pill>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 9,
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatTime(q.createdAt)}
            </span>
          </div>
        </div>
      </button>

      {/* Thread */}
      {expanded && (
        <div style={{ padding: "0 12px 10px" }}>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: 8,
            }}
          >
            {q.body}
          </p>

          {/* Jump to canvas */}
          {q.target.kind === "node" && (
            <button
              onClick={onFocus}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 10,
                color: "var(--accent-violet)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 8,
                padding: 0,
                fontFamily: "var(--font-ui)",
              }}
            >
              <MapPin size={10} />
              Focus on canvas
            </button>
          )}

          {/* Replies */}
          {q.thread.map((r) => {
            const rc = AUTHOR_COLORS[r.author] ?? "#7c849a";
            return (
              <div
                key={r.id}
                style={{ display: "flex", gap: 7, marginBottom: 7 }}
              >
                <Avatar
                  name={r.author}
                  color={rc}
                  initials={r.author.slice(0, 2).toUpperCase()}
                  size={18}
                  showTooltip={false}
                />
                <div
                  style={{
                    flex: 1,
                    background: "var(--surface-1)",
                    borderRadius: "var(--r-sm)",
                    padding: "5px 8px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: rc,
                      }}
                    >
                      {r.author}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {formatTime(r.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {r.body}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Reply input */}
          {!isResolved && (
            <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
              <textarea
                value={replyText}
                onChange={(e) => onReplyChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onReply();
                }}
                placeholder="Reply… (⌘↵ to send)"
                rows={2}
                style={{
                  flex: 1,
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  color: "var(--text-primary)",
                  fontSize: 11,
                  padding: "5px 8px",
                  fontFamily: "var(--font-ui)",
                  resize: "none",
                  outline: "none",
                }}
              />
              <button
                onClick={onReply}
                aria-label="Send reply"
                style={{
                  background: "var(--accent-violet)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  padding: "0 8px",
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Send size={12} />
              </button>
            </div>
          )}

          {/* Resolve / Reopen */}
          <div style={{ marginTop: 7 }}>
            {isResolved ? (
              <SmallBtn
                icon={<RotateCcw size={10} />}
                label="Reopen"
                color="var(--accent-amber)"
                onClick={onReopen}
              />
            ) : (
              <SmallBtn
                icon={<Check size={10} />}
                label="Mark Resolved"
                color="var(--accent-green)"
                onClick={onResolve}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── tiny helpers ───────────────────────────────────────────────────────── */

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "3px 8px",
        borderRadius: "var(--r-full)",
        background: active ? "var(--accent-violet)" : "var(--surface-2)",
        color: active ? "#fff" : "var(--text-secondary)",
        border: active ? "none" : "1px solid var(--border)",
        fontSize: 10,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
        transition: "all var(--t-base)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        fontSize: 9,
        color,
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        letterSpacing: "0.03em",
      }}
    >
      {String(children).toUpperCase()}
    </span>
  );
}

function SmallBtn({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 9px",
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
        borderRadius: "var(--r-sm)",
        color,
        fontSize: 10,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
