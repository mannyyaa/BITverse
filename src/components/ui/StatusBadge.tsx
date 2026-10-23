import type { NodeStatus } from "@/domain/types";

interface Props {
  status: NodeStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<NodeStatus, { label: string; dot: string; text: string; bg: string }> = {
  healthy:    { label: "Healthy",    dot: "#57E3A0", text: "#57E3A0", bg: "rgba(87,227,160,.1)" },
  degraded:   { label: "Degraded",   dot: "#FFBF69", text: "#FFBF69", bg: "rgba(255,191,105,.1)" },
  overloaded: { label: "Overloaded", dot: "#FF667D", text: "#FF667D", bg: "rgba(255,102,125,.1)" },
  down:       { label: "Down",       dot: "#FF667D", text: "#FF667D", bg: "rgba(255,102,125,.15)" },
};

export function StatusBadge({ status, size = "sm" }: Props) {
  const cfg = STATUS_CONFIG[status];
  const px = size === "sm" ? "4px 8px" : "5px 10px";
  const fs = size === "sm" ? "10px" : "11px";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: px, borderRadius: 20,
      background: cfg.bg,
      color: cfg.text, fontSize: fs, fontFamily: "var(--font-mono)",
      fontWeight: 500, letterSpacing: ".02em", lineHeight: 1,
      border: `1px solid ${cfg.dot}22`,
    }}>
      <span style={{
        width: size === "sm" ? 5 : 6, height: size === "sm" ? 5 : 6,
        borderRadius: "50%", background: cfg.dot,
        boxShadow: `0 0 4px ${cfg.dot}`,
        flexShrink: 0,
        animation: status !== "healthy" ? "pulse-dot 2s ease-in-out infinite" : "none",
      }} />
      {cfg.label}
      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </span>
  );
}
