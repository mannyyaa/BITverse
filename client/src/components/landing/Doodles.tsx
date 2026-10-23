/**
 * Decorative doodle elements for the landing page.
 * All purely decorative — pointer-events:none, aria-hidden.
 * Respects prefers-reduced-motion via a CSS class on the root.
 */

import "./Doodles.css";

/* ── Primitives ─────────────────────────────────────────────────────────── */

interface DoodleProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Squiggly arrow curving right-downward */
export function SquiggleArrow({ className = "", style }: DoodleProps) {
  return (
    <svg
      width="68" height="52" viewBox="0 0 68 52" fill="none"
      className={`bv-doodle ${className}`} style={style} aria-hidden="true"
    >
      <path
        d="M4 8 C10 3, 18 16, 14 22 C10 28, 22 28, 28 22 C34 16, 44 32, 52 26 C58 22, 62 28, 63 34"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="3 2"
      />
      <path d="M60 30 L65 36 L56 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Small 5-pointed star with a slightly wobbly character */
export function StarDoodle({ className = "", style }: DoodleProps) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 22 22" fill="none"
      className={`bv-doodle ${className}`} style={style} aria-hidden="true"
    >
      <path
        d="M11 2 L12.8 8.2 L19.2 8.2 L14 12.2 L15.8 18.4 L11 14.4 L6.2 18.4 L8 12.2 L2.8 8.2 L9.2 8.2 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

/** Rough hand-drawn circle */
export function CircleDoodle({ className = "", style }: DoodleProps) {
  return (
    <svg
      width="38" height="36" viewBox="0 0 38 36" fill="none"
      className={`bv-doodle ${className}`} style={style} aria-hidden="true"
    >
      <path
        d="M19 4 C28 3, 35 9, 34 18 C33 27, 26 33, 17 32 C8 31, 2 25, 3 16 C4 8, 11 4, 19 4 Z"
        stroke="currentColor" strokeWidth="1.8" fill="none"
      />
    </svg>
  );
}

/** Wobbly underline stroke */
export function WobblyUnderline({ className = "", style }: DoodleProps) {
  return (
    <svg
      width="120" height="12" viewBox="0 0 120 12" fill="none"
      className={`bv-doodle ${className}`} style={style} aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M2 7 C18 3, 36 11, 54 6 C72 1, 90 9, 108 5 C116 3, 119 6, 120 8"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

/** Simple sparkle / burst (4-point star) */
export function SparkDoodle({ className = "", style }: DoodleProps) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      className={`bv-doodle ${className}`} style={style} aria-hidden="true"
    >
      <path d="M8 1 L9 6.5 L14.5 8 L9 9.5 L8 15 L7 9.5 L1.5 8 L7 6.5 Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Curved connector line (left-to-right arc) */
export function CurvedConnector({ className = "", style }: DoodleProps) {
  return (
    <svg
      width="90" height="44" viewBox="0 0 90 44" fill="none"
      className={`bv-doodle ${className}`} style={style} aria-hidden="true"
    >
      <path
        d="M6 38 C20 38, 22 8, 44 7 C66 6, 68 38, 84 36"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" strokeDasharray="4 3"
      />
      <path d="M82 32 L86 37 L79 38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Short marker-style bracket underline (for section headings) */
export function MarkerUnderline({ className = "", style }: DoodleProps) {
  return (
    <svg
      width="72" height="9" viewBox="0 0 72 9" fill="none"
      className={`bv-doodle ${className}`} style={style} aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M1 6 C14 2, 28 8, 42 5 C54 2, 66 7, 71 4"
        stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.45"
      />
    </svg>
  );
}

/** Diagonal arrow pointing top-right */
export function ArrowDiagonal({ className = "", style }: DoodleProps) {
  return (
    <svg
      width="42" height="42" viewBox="0 0 42 42" fill="none"
      className={`bv-doodle ${className}`} style={style} aria-hidden="true"
    >
      <path d="M8 34 C14 28, 22 18, 34 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M26 8 L34 8 L34 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Three small dots in a loose diagonal cluster */
export function DotCluster({ className = "", style }: DoodleProps) {
  return (
    <svg
      width="24" height="20" viewBox="0 0 24 20" fill="none"
      className={`bv-doodle ${className}`} style={style} aria-hidden="true"
    >
      <circle cx="4"  cy="14" r="2.2" fill="currentColor" opacity="0.7" />
      <circle cx="12" cy="6"  r="2.6" fill="currentColor" opacity="0.55" />
      <circle cx="20" cy="16" r="1.8" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/* ── Floating sticky note ────────────────────────────────────────────────── */

const STICKY_STYLES: Record<string, { bg: string; border: string; rotate: string }> = {
  yellow: { bg: "#fdf6b8", border: "#ecc86a", rotate: "-2.5deg" },
  mint:   { bg: "#cfe9da", border: "#9bd3b8", rotate: "2deg" },
  lavender: { bg: "#e4dcf6", border: "#c3b0e8", rotate: "-1.2deg" },
  coral:  { bg: "#fcdaca", border: "#f0ae93", rotate: "1.8deg" },
};

interface FloatyStickyProps {
  text: string;
  color?: keyof typeof STICKY_STYLES;
  className?: string;
  style?: React.CSSProperties;
  emoji?: string;
}

export function FloatySticky({ text, color = "yellow", className = "", style, emoji }: FloatyStickyProps) {
  const s = STICKY_STYLES[color];
  return (
    <div
      className={`bv-floaty-sticky bv-doodle ${className}`}
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 4,
        padding: "8px 11px",
        maxWidth: 148,
        transform: `rotate(${s.rotate})`,
        boxShadow: "1px 3px 8px rgba(0,0,0,.09)",
        ...style,
      }}
      aria-hidden="true"
    >
      {emoji && <span style={{ fontSize: 13, display: "block", marginBottom: 3 }}>{emoji}</span>}
      <p style={{ margin: 0, fontFamily: "'Segoe UI', ui-sans-serif, sans-serif", fontSize: 11, lineHeight: 1.45, color: "#3c3a32" }}>{text}</p>
    </div>
  );
}

/* ── Small annotation label ─────────────────────────────────────────────── */

export function AnnotationLabel({ text, style, className = "" }: { text: string; style?: React.CSSProperties; className?: string }) {
  return (
    <span
      className={`bv-annotation bv-doodle ${className}`}
      style={{
        display: "inline-block",
        fontFamily: "'Segoe UI', ui-sans-serif, sans-serif",
        fontSize: 10,
        fontWeight: 700,
        color: "#8270cf",
        background: "rgba(130,112,207,.08)",
        border: "1px dashed rgba(130,112,207,.3)",
        borderRadius: 4,
        padding: "2px 6px",
        transform: "rotate(-1.5deg)",
        whiteSpace: "nowrap",
        ...style,
      }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
