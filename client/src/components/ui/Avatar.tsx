interface Props {
  name: string;
  color: string;
  initials: string;
  online?: boolean;
  size?: number;
  showTooltip?: boolean;
}

export function Avatar({
  name,
  color,
  initials,
  online = false,
  size = 26,
  showTooltip = true,
}: Props) {
  return (
    <div
      title={showTooltip ? name : undefined}
      aria-label={name}
      style={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}20`,
        border: `1.5px solid ${color}60`,
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.35),
        fontWeight: 600,
        color,
        fontFamily: "var(--font-ui)",
        letterSpacing: "-0.01em",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
      {online && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: Math.round(size * 0.28),
            height: Math.round(size * 0.28),
            borderRadius: "50%",
            background: "var(--status-healthy)",
            border: "1.5px solid var(--surface-0)",
          }}
        />
      )}
    </div>
  );
}
