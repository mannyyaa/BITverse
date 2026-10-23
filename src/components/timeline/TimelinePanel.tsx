import { Server, Link2, MessageCircle, Check, Zap, Camera, TrendingUp } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Avatar } from "@/components/ui/Avatar";
import { formatTime } from "@/lib/id";
import type { TimelineEventKind } from "@/domain/types";

const COLLABORATOR_COLORS: Record<string, string> = {
  Aanya: "#A78BFA", Rohan: "#57E3A0", You: "#55E6FF",
};

const KIND_META: Record<TimelineEventKind, { icon: React.ReactNode; color: string; label: string }> = {
  "workspace-created":  { icon: <Server size={11} />,      color: "#55E6FF", label: "Created" },
  "node-added":         { icon: <Server size={11} />,      color: "#A78BFA", label: "Added" },
  "node-removed":       { icon: <Server size={11} />,      color: "#FF667D", label: "Removed" },
  "edge-added":         { icon: <Link2 size={11} />,       color: "#55E6FF", label: "Connected" },
  "edge-removed":       { icon: <Link2 size={11} />,       color: "#FF667D", label: "Disconnected" },
  "query-raised":       { icon: <MessageCircle size={11} />, color: "#FFBF69", label: "Query" },
  "query-resolved":     { icon: <Check size={11} />,       color: "#57E3A0", label: "Resolved" },
  "simulation-started": { icon: <Zap size={11} />,         color: "#FF667D", label: "Simulation" },
  "simulation-complete":{ icon: <Zap size={11} />,         color: "#57E3A0", label: "Complete" },
  "snapshot-saved":     { icon: <Camera size={11} />,      color: "#A78BFA", label: "Snapshot" },
  "architecture-improved": { icon: <TrendingUp size={11} />, color: "#57E3A0", label: "Improved" },
};

export function TimelinePanel() {
  const timeline = useWorkspaceStore((s) => s.workspace.timeline);

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {timeline.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
          No events yet.
        </div>
      ) : (
        <div style={{ padding: "8px 0", position: "relative" }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute", left: 29, top: 12, bottom: 12,
            width: 1, background: "var(--border)",
          }} />

          {timeline.map((event) => {
            const meta = KIND_META[event.kind];
            const avatarColor = COLLABORATOR_COLORS[event.author] ?? "#98A6BD";

            return (
              <div key={event.id} style={{ display: "flex", gap: 10, padding: "6px 14px", position: "relative" }}>
                {/* Timeline dot */}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: `${meta.color}15`, border: `1.5px solid ${meta.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: meta.color, flexShrink: 0, zIndex: 1,
                  position: "relative",
                }}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.4, flex: 1 }}>
                      {event.description}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                    <Avatar
                      name={event.author}
                      color={avatarColor}
                      initials={event.author.slice(0, 2).toUpperCase()}
                      size={14}
                      showTooltip={false}
                    />
                    <span style={{ fontSize: 9, color: "var(--text-3)" }}>{event.author}</span>
                    <span style={{ fontSize: 9, color: "var(--text-3)" }}>·</span>
                    <span style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                      {formatTime(event.timestamp)}
                    </span>
                    <span style={{
                      marginLeft: "auto", fontSize: 8, color: meta.color,
                      fontFamily: "var(--font-mono)", fontWeight: 600,
                    }}>
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
