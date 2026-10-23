import {
  Server, Link2, MessageCircle, CheckCircle2,
  Zap, Camera, TrendingUp, PlusCircle, Trash2,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Avatar } from "@/components/ui/Avatar";
import { formatTime } from "@/lib/id";
import type { TimelineEventKind } from "@/domain/types";

const AUTHOR_COLORS: Record<string, string> = {
  Aanya: "#6c5ce7",
  Rohan: "#00b894",
  You:   "#0984e3",
};

interface KindMeta {
  icon: React.ReactNode;
  color: string;
  label: string;
}

const KIND_META: Record<TimelineEventKind, KindMeta> = {
  "workspace-created":    { icon: <Server size={10} />,       color: "var(--accent-violet)", label: "Created"     },
  "node-added":           { icon: <PlusCircle size={10} />,   color: "var(--accent-blue)",   label: "Added"       },
  "node-removed":         { icon: <Trash2 size={10} />,       color: "var(--accent-red)",    label: "Removed"     },
  "edge-added":           { icon: <Link2 size={10} />,        color: "var(--accent-cyan)",   label: "Connected"   },
  "edge-removed":         { icon: <Link2 size={10} />,        color: "var(--accent-red)",    label: "Disconnected"},
  "query-raised":         { icon: <MessageCircle size={10} />,color: "var(--accent-amber)",  label: "Query"       },
  "query-resolved":       { icon: <CheckCircle2 size={10} />, color: "var(--accent-green)",  label: "Resolved"    },
  "simulation-started":   { icon: <Zap size={10} />,          color: "var(--accent-red)",    label: "Simulation"  },
  "simulation-complete":  { icon: <Zap size={10} />,          color: "var(--accent-green)",  label: "Complete"    },
  "snapshot-saved":       { icon: <Camera size={10} />,       color: "var(--accent-violet)", label: "Snapshot"    },
  "architecture-improved":{ icon: <TrendingUp size={10} />,   color: "var(--accent-green)",  label: "Improved"    },
};

export function TimelinePanel() {
  const timeline = useWorkspaceStore((s) => s.workspace.timeline);

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {timeline.length === 0 ? (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            color: "var(--text-tertiary)",
            fontSize: 12,
          }}
        >
          No events yet.
        </div>
      ) : (
        <div style={{ padding: "6px 0", position: "relative" }}>
          {/* Vertical spine */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 27,
              top: 14,
              bottom: 14,
              width: 1,
              background: "var(--border)",
            }}
          />

          {timeline.map((event) => {
            const meta        = KIND_META[event.kind];
            const authorColor = AUTHOR_COLORS[event.author] ?? "#7c849a";

            return (
              <div
                key={event.id}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "6px 12px",
                  position: "relative",
                }}
              >
                {/* Dot */}
                <div
                  aria-hidden
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                    border: `1.5px solid color-mix(in srgb, ${meta.color} 40%, transparent)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: meta.color,
                    flexShrink: 0,
                    zIndex: 1,
                    position: "relative",
                  }}
                >
                  {meta.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-primary)",
                      lineHeight: 1.4,
                      marginBottom: 3,
                    }}
                  >
                    {event.description}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Avatar
                      name={event.author}
                      color={authorColor}
                      initials={event.author.slice(0, 2).toUpperCase()}
                      size={12}
                      showTooltip={false}
                    />
                    <span
                      style={{
                        fontSize: 9,
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {event.author}
                    </span>
                    <span style={{ fontSize: 9, color: "var(--border-strong)" }}>·</span>
                    <span
                      style={{
                        fontSize: 9,
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {formatTime(event.timestamp)}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 8,
                        color: meta.color,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {meta.label.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
