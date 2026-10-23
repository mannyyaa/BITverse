import { useState, useEffect } from "react";
import type { ComponentKind } from "@/domain/types";

interface PNode {
  id: string;
  kind: ComponentKind;
  label: string;
  x: number;
  y: number;
  color: string;
  metric: string;
  warning?: boolean;
}

const NODES: PNode[] = [
  { id: "client",  kind: "web-client",    label: "Web Client",    x: 16,  y: 130, color: "var(--cat-application)", metric: "8k users" },
  { id: "gateway", kind: "api-gateway",   label: "API Gateway",   x: 155, y: 130, color: "var(--cat-application)", metric: "1.2k req/s" },
  { id: "svc-a",   kind: "service",       label: "Product Svc",   x: 294, y: 58,  color: "var(--cat-compute)",     metric: "340 req/s" },
  { id: "svc-b",   kind: "service",       label: "Order Svc",     x: 294, y: 138, color: "var(--cat-compute)",     metric: "180 req/s" },
  { id: "svc-c",   kind: "service",       label: "Payment Svc",   x: 294, y: 218, color: "var(--cat-compute)",     metric: "95 req/s"  },
  { id: "db",      kind: "database",      label: "PostgreSQL",    x: 430, y: 130, color: "var(--cat-data)",        metric: "68% cap",  warning: true },
  { id: "cache",   kind: "cache",         label: "Redis Cache",   x: 430, y: 48,  color: "var(--cat-data)",        metric: "92% hit"   },
  { id: "queue",   kind: "message-queue", label: "Msg Queue",     x: 430, y: 218, color: "var(--cat-messaging)",   metric: "1.2k/s"    },
  { id: "worker",  kind: "worker",        label: "Worker",        x: 548, y: 218, color: "var(--cat-compute)",     metric: "3 inst."   },
];

const NW = 116;
const NH = 48;
const EDGES: [string, string][] = [
  ["client", "gateway"], ["gateway", "svc-a"], ["gateway", "svc-b"], ["gateway", "svc-c"],
  ["svc-a", "cache"], ["svc-a", "db"], ["svc-b", "db"], ["svc-c", "db"],
  ["svc-b", "queue"], ["queue", "worker"],
];

function curvePath(a: PNode, b: PNode) {
  const x1 = a.x + NW, y1 = a.y + NH / 2;
  const x2 = b.x,       y2 = b.y + NH / 2;
  const cp = (x2 - x1) * 0.4;
  return `M${x1},${y1} C${x1 + cp},${y1} ${x2 - cp},${y2} ${x2},${y2}`;
}

export function ArchPreview() {
  const [selected, setSelected] = useState<string | null>("gateway");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % EDGES.length), 1000);
    return () => clearInterval(t);
  }, []);

  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div
      style={{
        background: "var(--surface-0)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)",
        overflow: "hidden",
        boxShadow: "var(--shadow-xl)",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          padding: "9px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-1)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 10,
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Pulse Commerce — Architecture Preview
        </div>
        {/* Presence */}
        <div style={{ display: "flex" }}>
          {[
            { i: "AA", c: "#6c5ce7" },
            { i: "RO", c: "#00b894" },
            { i: "YO", c: "#0984e3" },
          ].map((p, idx) => (
            <div
              key={idx}
              style={{
                width: 18, height: 18, borderRadius: "50%",
                background: `${p.c}22`, border: `1.5px solid ${p.c}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 7, fontWeight: 700, color: p.c,
                marginLeft: idx > 0 ? -5 : 0,
                zIndex: 3 - idx,
              }}
            >
              {p.i}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ padding: "14px 14px 10px", position: "relative" }}>
        {/* dot grid */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, opacity: 0.6,
            backgroundImage: "radial-gradient(var(--canvas-dot) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <svg
          width="100%"
          viewBox="0 0 676 290"
          style={{ position: "relative", zIndex: 1, display: "block", height: "auto", aspectRatio: "676 / 290", maxWidth: "100%" }}
        >
          <defs>
            <marker id="arr-lt" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L0,5 L5,2.5 z" fill="var(--border-strong)" />
            </marker>
            <marker id="arr-lt-act" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L0,5 L5,2.5 z" fill="var(--accent-violet)" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map(([fromId, toId], i) => {
            const from = nodeMap[fromId];
            const to   = nodeMap[toId];
            if (!from || !to) return null;
            const isActive = i === pulse;
            return (
              <g key={`${fromId}-${toId}`}>
                <path
                  d={curvePath(from, to)}
                  stroke={isActive ? "var(--accent-violet)" : "var(--border-strong)"}
                  strokeWidth={isActive ? 1.5 : 1}
                  fill="none"
                  opacity={isActive ? 0.9 : 0.5}
                  markerEnd={`url(#arr-lt${isActive ? "-act" : ""})`}
                  style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                />
                {isActive && (
                  <circle r="3" fill="var(--accent-violet)" opacity="0.85">
                    <animateMotion dur="0.9s" repeatCount="1" path={curvePath(from, to)} />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const isSel = selected === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                onClick={() => setSelected(node.id === selected ? null : node.id)}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(node.id === selected ? null : node.id);
                  }
                }}
                aria-label={`${node.label}, ${node.metric}${node.warning ? ", capacity warning" : ""}`}
              >
                <rect
                  width={NW}
                  height={NH}
                  rx={7}
                  fill="white"
                  stroke={isSel ? "var(--accent-violet)" : "var(--border)"}
                  strokeWidth={isSel ? 1.5 : 1}
                  filter={isSel ? "drop-shadow(0 2px 8px rgba(108,92,231,.2))" : "none"}
                />
                {/* color stripe */}
                <rect width={3} height={NH} rx={1} fill={node.color} opacity="0.7" />
                {/* label */}
                <text x={12} y={19} fontSize={9.5} fill="var(--text-primary)" fontWeight={600}>{node.label}</text>
                {/* metric */}
                <text x={12} y={33} fontSize={9} fill={node.color} fontFamily="monospace" fontWeight={500}>{node.metric}</text>
                {/* status dot */}
                <circle cx={NW - 8} cy={8} r={3} fill="var(--status-healthy)" />
                {/* warning */}
                {node.warning && (
                  <text x={NW - 14} y={NH - 5} fontSize={9} fill="var(--accent-amber)">⚠</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {selected && (() => {
          const n = nodeMap[selected];
          if (!n) return null;
          return (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 14,
                background: "var(--surface-0)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                padding: "6px 10px",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: n.color }}>{n.label}</div>
              <div style={{ fontSize: 9, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                {n.metric} · Healthy
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
