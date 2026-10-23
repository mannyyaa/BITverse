import { useState, useEffect } from "react";
import type { ComponentKind } from "@/domain/types";

interface PreviewNode {
  id: string;
  kind: ComponentKind;
  label: string;
  x: number;
  y: number;
  color: string;
  metric: string;
  warning?: boolean;
}



const NODES: PreviewNode[] = [
  { id: "client",   kind: "web-client",    label: "Web Client",     x: 20,  y: 130, color: "#55E6FF", metric: "8k users" },
  { id: "gateway",  kind: "api-gateway",   label: "API Gateway",    x: 155, y: 130, color: "#55E6FF", metric: "1.2k req/s" },
  { id: "svc-a",    kind: "service",       label: "Product Svc",    x: 290, y: 60,  color: "#A78BFA", metric: "340 req/s" },
  { id: "svc-b",    kind: "service",       label: "Order Svc",      x: 290, y: 140, color: "#A78BFA", metric: "180 req/s" },
  { id: "svc-c",    kind: "service",       label: "Payment Svc",    x: 290, y: 220, color: "#A78BFA", metric: "95 req/s" },
  { id: "db",       kind: "database",      label: "PostgreSQL",     x: 420, y: 130, color: "#57E3A0", metric: "68% cap", warning: true },
  { id: "cache",    kind: "cache",         label: "Redis Cache",    x: 420, y: 50,  color: "#57E3A0", metric: "92% hit" },
  { id: "queue",    kind: "message-queue", label: "Message Queue",  x: 420, y: 220, color: "#FFBF69", metric: "1.2k/s" },
  { id: "worker",   kind: "worker",        label: "Worker",         x: 540, y: 220, color: "#A78BFA", metric: "3 inst." },
];

const NODE_W = 120;
const NODE_H = 52;

function edgePath(from: PreviewNode, to: PreviewNode) {
  const x1 = from.x + NODE_W;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_H / 2;
  const cp = (x2 - x1) * 0.4;
  return `M${x1},${y1} C${x1 + cp},${y1} ${x2 - cp},${y2} ${x2},${y2}`;
}

const EDGE_PAIRS: [string, string][] = [
  ["client", "gateway"],
  ["gateway", "svc-a"],
  ["gateway", "svc-b"],
  ["gateway", "svc-c"],
  ["svc-a", "cache"],
  ["svc-a", "db"],
  ["svc-b", "db"],
  ["svc-c", "db"],
  ["svc-b", "queue"],
  ["queue", "worker"],
];

export function ArchPreview() {
  const [selected, setSelected] = useState<string | null>("gateway");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 3), 1800);
    return () => clearInterval(t);
  }, []);

  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: 0,
      overflow: "hidden",
      boxShadow: "0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(85,230,255,.06)",
      position: "relative",
    }}>
      {/* Window chrome */}
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)",
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF667D" }} />
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FFBF69" }} />
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#57E3A0" }} />
        </div>
        <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", flex: 1, textAlign: "center" }}>
          Pulse Commerce — Live Architecture
        </div>
        {/* Presence */}
        <div style={{ display: "flex", gap: -4 }}>
          {[{ name: "AA", color: "#A78BFA" }, { name: "RO", color: "#57E3A0" }, { name: "YO", color: "#55E6FF" }].map((c, i) => (
            <div key={i} style={{
              width: 18, height: 18, borderRadius: "50%",
              background: `${c.color}20`, border: `1.5px solid ${c.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 7, fontWeight: 700, color: c.color,
              marginLeft: i > 0 ? -5 : 0, zIndex: 3 - i,
            }}>
              {c.name}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div style={{ padding: "16px 16px 12px", position: "relative" }}>
        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.4,
          backgroundImage: "radial-gradient(circle, #283349 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />

        <svg
          width={680}
          height={300}
          style={{ position: "relative", zIndex: 1, display: "block" }}
          viewBox="0 0 680 300"
        >
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#283349" />
            </marker>
            <marker id="arr-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#55E6FF" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGE_PAIRS.map(([fromId, toId]) => {
            const from = nodeMap[fromId];
            const to = nodeMap[toId];
            if (!from || !to) return null;
            const isActive = pulse % 3 === EDGE_PAIRS.indexOf([fromId, toId]) % 3;
            return (
              <g key={`${fromId}-${toId}`}>
                <path
                  d={edgePath(from, to)}
                  stroke={isActive ? "#55E6FF" : "#283349"}
                  strokeWidth={isActive ? 1.5 : 1}
                  fill="none"
                  opacity={isActive ? 0.8 : 0.5}
                  markerEnd={`url(#${isActive ? "arr-active" : "arr"})`}
                  style={{ transition: "stroke .3s, stroke-width .3s" }}
                />
                {isActive && (
                  <circle r="3" fill="#55E6FF" opacity="0.9">
                    <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath(from, to)} />
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
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelected(node.id === selected ? null : node.id)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={7}
                  fill={isSel ? `${node.color}10` : "#111827"}
                  stroke={isSel ? node.color : "#283349"}
                  strokeWidth={isSel ? 1.5 : 1}
                />
                {isSel && (
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={7}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={1.5}
                    opacity={0.4}
                    style={{ filter: `drop-shadow(0 0 6px ${node.color})` }}
                  />
                )}
                {/* Icon bg */}
                <rect x={8} y={8} width={26} height={26} rx={5} fill={`${node.color}15`} stroke={`${node.color}25`} />
                {/* Icon - use text approximation */}
                <text x={17} y={25} fontSize={12} fill={node.color} textAnchor="middle" fontWeight={700}>
                  {node.kind === "web-client" ? "◻" : node.kind === "api-gateway" ? "◈" : node.kind === "service" ? "▣" : node.kind === "database" ? "⬡" : node.kind === "cache" ? "⊞" : node.kind === "message-queue" ? "≡" : node.kind === "worker" ? "⊙" : "◻"}
                </text>
                <text x={40} y={22} fontSize={9} fill="#F4F7FF" fontWeight={600}>{node.label}</text>
                <text x={40} y={34} fontSize={8} fill={node.color} fontFamily="monospace">{node.metric}</text>
                {/* Healthy dot */}
                <circle cx={NODE_W - 8} cy={8} r={3} fill="#57E3A0" />
                {/* Warning */}
                {node.warning && (
                  <text x={NODE_W - 16} y={NODE_H - 6} fontSize={9} fill="#FFBF69" textAnchor="middle">⚠</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected node tooltip */}
        {selected && (() => {
          const n = nodeMap[selected];
          if (!n) return null;
          return (
            <div style={{
              position: "absolute", bottom: 12, left: 16,
              background: "var(--surface-2)", border: `1px solid ${n.color}40`,
              borderRadius: 7, padding: "6px 10px",
              boxShadow: `0 4px 16px rgba(0,0,0,.4)`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: n.color }}>{n.label}</div>
              <div style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{n.metric} · Healthy</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
