interface Props {
  name: string;
  color: string;
  initials: string;
  online?: boolean;
  size?: number;
  showTooltip?: boolean;
}

export function Avatar({ name, color, initials, online = false, size = 28, showTooltip = true }: Props) {
  return (
    <div
      title={showTooltip ? name : undefined}
      style={{
        position: "relative", display: "inline-flex",
        width: size, height: size, borderRadius: "50%",
        background: `${color}22`, border: `1.5px solid ${color}66`,
        alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 600, color,
        fontFamily: "var(--font-ui)", letterSpacing: "-.02em",
        flexShrink: 0,
      }}
      aria-label={name}
    >
      {initials}
      {online && (
        <span style={{
          position: "absolute", bottom: 0, right: 0,
          width: size * 0.3, height: size * 0.3, borderRadius: "50%",
          background: "#57E3A0", border: "1.5px solid var(--bg)",
        }} />
      )}
    </div>
  );
}
