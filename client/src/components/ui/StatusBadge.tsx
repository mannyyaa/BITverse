import type { NodeStatus } from "@/domain/types";

interface Props {
  status: NodeStatus;
  size?: "xs" | "sm";
}

const CFG: Record<NodeStatus, { label: string; bg: string; text: string; dot: string }> = {
  healthy:    { label: "Healthy",    bg: "rgba(0,184,148,.10)",  text: "var(--status-healthy)",    dot: "var(--status-healthy)"    },
  degraded:   { label: "Degraded",   bg: "rgba(225,112,85,.10)", text: "var(--status-degraded)",   dot: "var(--status-degraded)"   },
  overloaded: { label: "Overloaded", bg: "rgba(214,48,49,.10)",  text: "var(--status-overloaded)", dot: "var(--status-overloaded)" },
  down:       { label: "Down",       bg: "rgba(214,48,49,.12)",  text: "var(--status-down)",       dot: "var(--status-down)"       },
};

export function StatusBadge({ status, size = "sm" }: Props) {
  const c = CFG[status];
  const isXs = size === "xs";

  return (
    <span
      role="status"
      aria-label={`Status: ${c.label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isXs ? 4 : 5,
        padding: isXs ? "2px 6px" : "3px 7px",
        borderRadius: "var(--r-full)",
        background: c.bg,
        color: c.text,
        fontSize: isXs ? 10 : 11,
        fontWeight: 500,
        fontFamily: "var(--font-ui)",
        letterSpacing: "0.01em",
        lineHeight: 1,
        border: `1px solid ${c.dot}30`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: isXs ? 4 : 5,
          height: isXs ? 4 : 5,
          borderRadius: "50%",
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {c.label}
    </span>
  );
}
