import { useState } from "react";
import {
  X, Pencil, Check, MessageCircle, Zap, Eye, Lock, Unlock, Trash2, StickyNote, Wrench,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { NodeIcon } from "@/components/ui/NodeIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { kindColor, priorityColor, PRIORITY_LABEL } from "@/lib/tokens";
import {
  STICKY_COLORS, STICKY_COLOR_VAR, STICKY_BORDER_VAR, STICKY_TEMPLATES, stickyTemplateMeta,
} from "@/lib/canvas";
import type {
  CanvasEdge, CanvasNode, ComponentKind, EdgeKind, TextSize,
} from "@/domain/types";

export function Inspector() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const selectedEdgeId = useUIStore((s) => s.selectedEdgeId);
  const selectNode = useUIStore((s) => s.selectNode);
  const selectEdge = useUIStore((s) => s.selectEdge);

  const node = useWorkspaceStore((s) =>
    selectedNodeId ? s.workspace.graph.nodes.find((n) => n.id === selectedNodeId) : undefined,
  );
  const edge = useWorkspaceStore((s) =>
    selectedEdgeId ? s.workspace.graph.edges.find((e) => e.id === selectedEdgeId) : undefined,
  );

  const hasSelection = !!node || !!edge;

  return (
    <div className="bv-inspector" style={inspectorStyle}>
      <div style={headerStyle}>
        <span style={headerLabelStyle}>{edge ? "Connector" : "Inspector"}</span>
        <button onClick={() => { selectNode(null); selectEdge(null); }} aria-label="Close inspector" style={iconBtnStyle}>
          <X size={13} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {!hasSelection && <EmptyState />}
        {edge && <EdgeInspector edge={edge} />}
        {node && node.type === "architecture" && <ArchInspector node={node} />}
        {node && node.type === "sticky" && <StickyInspector node={node} />}
        {node && node.type === "text" && <TextInspector node={node} />}
        {node && node.type === "shape" && <ShapeInspector node={node} />}

        <LayersPanel />
      </div>
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────────────────────── */
function EmptyState() {
  const setActiveTool = useUIStore((s) => s.setActiveTool);
  const setComponentLibraryOpen = useUIStore((s) => s.setComponentLibraryOpen);
  const setFailureLab = useUIStore((s) => s.setFailureLabOpen);

  const tips: { k: string; v: string }[] = [
    { k: "N", v: "Drop a sticky note" },
    { k: "P", v: "Sketch an idea" },
    { k: "A", v: "Open components" },
    { k: "C", v: "Connect two things" },
    { k: "F", v: "Group a section" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-head)", marginBottom: 3 }}>Think it. Sketch it. Stress-test it.</div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Select anything on the canvas to edit it here. Or start with a tool:
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {tips.map((t) => (
          <div key={t.k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
            <kbd style={kbdStyle}>{t.k}</kbd>
            <span style={{ color: "var(--text-secondary)" }}>{t.v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
        <ActionBtn icon={<StickyNote size={12} />} label="Add a sticky note" accent="var(--accent-amber)" onClick={() => setActiveTool("sticky")} />
        <ActionBtn icon={<MessageCircle size={12} />} label="Open component library" accent="var(--accent-violet)" onClick={() => { setComponentLibraryOpen(true); setActiveTool("components"); }} />
        <ActionBtn icon={<Zap size={12} />} label="Open Failure Lab" accent="var(--accent-cyan)" onClick={() => setFailureLab(true)} />
      </div>
    </div>
  );
}

/* ── Architecture ──────────────────────────────────────────────────────────── */
function ArchInspector({ node }: { node: Extract<CanvasNode, { type: "architecture" }> }) {
  const updateNode = useWorkspaceStore((s) => s.updateNode);
  const removeNode = useWorkspaceStore((s) => s.removeNode);
  const openRaiseQuery = useUIStore((s) => s.openRaiseQuery);
  const setFailureLab = useUIStore((s) => s.setFailureLabOpen);
  const workspaceQueries = useWorkspaceStore((s) => s.workspace.queries);
  const queries = workspaceQueries.filter((q) => q.target.kind === "node" && q.target.id === node.id);
  const openQueries = queries.filter((q) => q.status !== "resolved");

  const [editLabel, setEditLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");
  const [editDesc, setEditDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  const accent = kindColor(node.kind);
  const commitLabel = () => { if (labelDraft.trim()) updateNode(node.id, { label: labelDraft.trim() }); setEditLabel(false); };

  return (
    <>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ ...iconBoxStyle, background: `color-mix(in srgb, ${accent} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)` }}>
            <NodeIcon kind={node.kind} size={17} color={accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editLabel ? (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input value={labelDraft} onChange={(e) => setLabelDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitLabel(); if (e.key === "Escape") setEditLabel(false); }} autoFocus style={inputStyle} />
                <button onClick={commitLabel} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-green)", display: "flex" }}><Check size={13} /></button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</span>
                <button onClick={() => { setLabelDraft(node.label); setEditLabel(true); }} aria-label="Edit label" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", padding: 0 }}><Pencil size={10} /></button>
              </div>
            )}
            <div style={{ fontSize: 9, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", marginTop: 1 }}>{node.kind.replace(/-/g, " ").toUpperCase()}</div>
          </div>
        </div>
        <StatusBadge status={node.status} size="xs" />
      </div>

      <Section title="Description">
        {editDesc ? (
          <div>
            <textarea value={descDraft} onChange={(e) => setDescDraft(e.target.value)} rows={3} autoFocus style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-ui)" }} />
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <SmallBtn onClick={() => { updateNode(node.id, { description: descDraft.trim() }); setEditDesc(false); }}>Save</SmallBtn>
              <SmallBtn onClick={() => setEditDesc(false)}>Cancel</SmallBtn>
            </div>
          </div>
        ) : (
          <div onDoubleClick={() => { setDescDraft(node.description ?? ""); setEditDesc(true); }} style={{ fontSize: 11, color: node.description ? "var(--text-secondary)" : "var(--text-tertiary)", lineHeight: 1.5, cursor: "text" }}>
            {node.description || "Double-click to add a description…"}
          </div>
        )}
      </Section>

      {node.meta && (
        <Section title="Metrics">
          {node.meta.metric && <MetricRow label="Throughput" value={node.meta.metric} valueColor={accent} mono />}
          {node.meta.detail && <MetricRow label="Detail" value={node.meta.detail} />}
          <MetricRow label="ID" value={node.id} mono />
        </Section>
      )}

      {openQueries.length > 0 && (
        <Section title={`Open Queries (${openQueries.length})`}>
          {openQueries.map((q) => (
            <div key={q.id} style={queryCardStyle}>
              <div style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{q.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: priorityColor(q.priority) }} />
                <span style={{ fontSize: 9, color: priorityColor(q.priority), fontFamily: "var(--font-mono)", fontWeight: 600 }}>{PRIORITY_LABEL[q.priority].toUpperCase()}</span>
                <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--text-tertiary)" }}>{q.thread.length} replies</span>
              </div>
            </div>
          ))}
        </Section>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
        <ActionBtn icon={<MessageCircle size={12} />} label="Raise Query" accent="var(--accent-pink)" onClick={() => openRaiseQuery(node.id)} />
        <ActionBtn icon={<Zap size={12} />} label="Simulate Failure" accent="var(--accent-cyan)" onClick={() => setFailureLab(true)} />
        <ActionBtn icon={<Trash2 size={12} />} label="Delete component" accent="var(--accent-red)" onClick={() => { removeNode(node.id); useUIStore.getState().selectNode(null); }} />
      </div>
    </>
  );
}

/* ── Sticky ────────────────────────────────────────────────────────────────── */
function StickyInspector({ node }: { node: Extract<CanvasNode, { type: "sticky" }> }) {
  const updateNode = useWorkspaceStore((s) => s.updateNode);
  const removeNode = useWorkspaceStore((s) => s.removeNode);

  return (
    <>
      <SectionLabel>Sticky Note</SectionLabel>
      <div style={cardStyle}>
        <textarea value={node.text} onChange={(e) => updateNode(node.id, { text: e.target.value })} rows={4} placeholder="Write your note…" style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-ui)", minHeight: 60 }} />
      </div>

      <Section title="Colour">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STICKY_COLORS.map((c) => (
            <button key={c} onClick={() => updateNode(node.id, { color: c })} title={c} aria-label={`Colour ${c}`} style={{ width: 22, height: 22, borderRadius: "var(--r-sm)", background: STICKY_COLOR_VAR[c], border: c === node.color ? "2px solid var(--accent-violet)" : `1px solid ${STICKY_BORDER_VAR[c]}`, cursor: "pointer", padding: 0 }} />
          ))}
        </div>
      </Section>

      <Section title="Template">
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {STICKY_TEMPLATES.map((t) => {
            const active = node.template === t.id;
            return (
              <button key={t.id} onClick={() => updateNode(node.id, { template: active ? undefined : t.id })} style={{ fontSize: 10, padding: "4px 8px", borderRadius: "var(--r-full)", background: active ? "var(--accent-violet)" : "var(--surface-2)", color: active ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer" }}>
                {t.emoji} {t.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Alignment">
        <div style={{ display: "flex", gap: 6 }}>
          {(["left", "center"] as const).map((a) => (
            <button key={a} onClick={() => updateNode(node.id, { align: a })} style={{ fontSize: 11, padding: "4px 10px", borderRadius: "var(--r-sm)", background: node.align === a ? "var(--accent-violet)" : "var(--surface-2)", color: node.align === a ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer", textTransform: "capitalize" }}>{a}</button>
          ))}
        </div>
      </Section>

      <div style={{ marginTop: 6 }}>
        <ActionBtn icon={<Trash2 size={12} />} label="Delete note" accent="var(--accent-red)" onClick={() => { removeNode(node.id); useUIStore.getState().selectNode(null); }} />
        <ConvertToArchBtn nodeId={node.id} />
      </div>
    </>
  );
}

/* ── Text ──────────────────────────────────────────────────────────────────── */
function TextInspector({ node }: { node: Extract<CanvasNode, { type: "text" }> }) {
  const updateNode = useWorkspaceStore((s) => s.updateNode);
  const removeNode = useWorkspaceStore((s) => s.removeNode);
  return (
    <>
      <SectionLabel>Text</SectionLabel>
      <div style={cardStyle}>
        <textarea value={node.content} onChange={(e) => updateNode(node.id, { content: e.target.value })} rows={3} placeholder="Heading or label…" style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-head)", fontWeight: 600 }} />
      </div>
      <Section title="Size">
        <div style={{ display: "flex", gap: 6 }}>
          {(["sm", "md", "lg"] as TextSize[]).map((sz) => (
            <button key={sz} onClick={() => updateNode(node.id, { size: sz })} style={{ fontSize: 11, padding: "4px 10px", borderRadius: "var(--r-sm)", background: (node.size ?? "md") === sz ? "var(--accent-violet)" : "var(--surface-2)", color: (node.size ?? "md") === sz ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer", textTransform: "uppercase" }}>{sz}</button>
          ))}
        </div>
      </Section>
      <div style={{ marginTop: 6 }}>
        <ActionBtn icon={<Trash2 size={12} />} label="Delete text" accent="var(--accent-red)" onClick={() => { removeNode(node.id); useUIStore.getState().selectNode(null); }} />
        <ConvertToArchBtn nodeId={node.id} />
      </div>
    </>
  );
}

/* ── Shape ─────────────────────────────────────────────────────────────────── */
function ShapeInspector({ node }: { node: Extract<CanvasNode, { type: "shape" }> }) {
  const updateNode = useWorkspaceStore((s) => s.updateNode);
  const removeNode = useWorkspaceStore((s) => s.removeNode);
  const isFrame = node.shape === "frame";
  return (
    <>
      <SectionLabel>{isFrame ? "Frame" : "Shape"}</SectionLabel>
      {isFrame && (
        <Section title="Section name">
          <input value={node.title ?? ""} onChange={(e) => updateNode(node.id, { title: e.target.value })} placeholder="e.g. Frontend" style={inputStyle} />
        </Section>
      )}
      {!isFrame && (
        <Section title="Label">
          <input value={node.label ?? ""} onChange={(e) => updateNode(node.id, { label: e.target.value })} placeholder="Label (optional)" style={inputStyle} />
        </Section>
      )}
      {!isFrame && (
        <>
          <Section title="Fill">
            <input type="color" value={node.fill ?? "#f0eee8"} onChange={(e) => updateNode(node.id, { fill: e.target.value })} style={{ width: 32, height: 26, border: "1px solid var(--border)", borderRadius: "var(--r-sm)", cursor: "pointer", padding: 0, background: "none" }} />
          </Section>
          <Section title="Border">
            <input type="color" value={node.border ?? "#c8c5bc"} onChange={(e) => updateNode(node.id, { border: e.target.value })} style={{ width: 32, height: 26, border: "1px solid var(--border)", borderRadius: "var(--r-sm)", cursor: "pointer", padding: 0, background: "none" }} />
          </Section>
        </>
      )}
      <div style={{ marginTop: 6 }}>
        <ActionBtn icon={<Trash2 size={12} />} label={`Delete ${isFrame ? "frame" : "shape"}`} accent="var(--accent-red)" onClick={() => { removeNode(node.id); useUIStore.getState().selectNode(null); }} />
        {!isFrame && <ConvertToArchBtn nodeId={node.id} />}
      </div>
    </>
  );
}

/* ── Edge / Connector ─────────────────────────────────────────────────────── */
function EdgeInspector({ edge }: { edge: CanvasEdge }) {
  const updateEdge = useWorkspaceStore((s) => s.updateEdge);
  const removeEdge = useWorkspaceStore((s) => s.removeEdge);
  const selectEdge = useUIStore((s) => s.selectEdge);
  const nodes = useWorkspaceStore((s) => s.workspace.graph.nodes);
  const src = nodes.find((n) => n.id === edge.source);
  const tgt = nodes.find((n) => n.id === edge.target);
  const nameOf = (n?: CanvasNode) => n ? ("label" in n ? n.label : "content" in n ? n.content || "Text" : n.type) : "?";

  const convert = (kind: EdgeKind) => updateEdge(edge.id, { kind });

  return (
    <>
      <SectionLabel>{edge.kind === "dataflow" ? "Data-flow edge" : "Brainstorm arrow"}</SectionLabel>
      <div style={cardStyle}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{nameOf(src)}</span>
          <span style={{ color: "var(--accent-violet)" }}>→</span>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{nameOf(tgt)}</span>
        </div>
      </div>

      <Section title="Edge type">
        <div style={{ display: "flex", gap: 6 }}>
          {(["brainstorm", "dataflow"] as EdgeKind[]).map((k) => (
            <button key={k} onClick={() => convert(k)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: "var(--r-sm)", background: edge.kind === k ? "var(--accent-violet)" : "var(--surface-2)", color: edge.kind === k ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer", textTransform: "capitalize" }}>
              {k === "dataflow" ? "Data-flow" : "Brainstorm"}
            </button>
          ))}
        </div>
        {edge.kind === "dataflow" && (
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 6, lineHeight: 1.4 }}>
            Data-flow edges participate in failure simulation. Brainstorm arrows are decorative only.
          </div>
        )}
      </Section>

      {edge.kind === "brainstorm" && (
        <Section title="Style">
          <div style={{ display: "flex", gap: 6 }}>
            {(["curved", "straight"] as const).map((st) => (
              <button key={st} onClick={() => updateEdge(edge.id, { style: st })} style={{ fontSize: 11, padding: "5px 10px", borderRadius: "var(--r-sm)", background: (edge.style ?? "curved") === st ? "var(--accent-violet)" : "var(--surface-2)", color: (edge.style ?? "curved") === st ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer", textTransform: "capitalize" }}>{st}</button>
            ))}
          </div>
        </Section>
      )}

      <Section title="Label">
        <input value={edge.label ?? ""} onChange={(e) => updateEdge(edge.id, { label: e.target.value })} placeholder="Label (optional)" style={inputStyle} />
      </Section>

      <div style={{ marginTop: 6 }}>
        <ActionBtn icon={<Trash2 size={12} />} label="Delete connector" accent="var(--accent-red)" onClick={() => { removeEdge(edge.id); selectEdge(null); }} />
      </div>
    </>
  );
}

/* ── Layers panel ──────────────────────────────────────────────────────────── */
function LayersPanel() {
  const nodes = useWorkspaceStore((s) => s.workspace.graph.nodes);
  const updateNode = useWorkspaceStore((s) => s.updateNode);
  const selectNode = useUIStore((s) => s.selectNode);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);

  const labelOf = (n: CanvasNode): string =>
    n.type === "architecture" ? n.label : n.type === "sticky" ? (stickyTemplateMeta(n.template)?.label ?? "Note") : n.type === "text" ? (n.content || "Text") : n.type === "shape" ? (n.shape === "frame" ? (n.title || "Frame") : "Shape") : "Object";

  return (
    <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
      <div style={headerLabelStyle}>Layers · {nodes.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 200, overflowY: "auto", marginTop: 6 }}>
        {nodes.map((n) => (
          <div key={n.id} onClick={() => selectNode(n.id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 6px", borderRadius: "var(--r-sm)", background: selectedNodeId === n.id ? "var(--surface-3)" : "transparent", cursor: "pointer" }}>
            <span style={{ flex: 1, fontSize: 11, color: n.hidden ? "var(--text-tertiary)" : "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: n.hidden ? "line-through" : "none" }}>{labelOf(n)}</span>
            <button onClick={(e) => { e.stopPropagation(); updateNode(n.id, { hidden: !n.hidden }); }} title={n.hidden ? "Show" : "Hide"} style={iconBtnStyle}><Eye size={12} style={{ opacity: n.hidden ? 0.4 : 1 }} /></button>
            <button onClick={(e) => { e.stopPropagation(); updateNode(n.id, { locked: !n.locked }); }} title={n.locked ? "Unlock" : "Lock"} style={iconBtnStyle}>{n.locked ? <Lock size={12} /> : <Unlock size={12} />}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared helpers ────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-head)", marginBottom: 10 }}>{children}</div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
}
function MetricRow({ label, value, valueColor, mono }: { label: string; value: string; valueColor?: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontSize: 11, color: valueColor ?? "var(--text-primary)", fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)", fontWeight: 500, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}
function ActionBtn({ icon, label, accent, onClick }: { icon: React.ReactNode; label: string; accent: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: `color-mix(in srgb, ${accent} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`, borderRadius: "var(--r-sm)", color: accent, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-ui)", transition: "background var(--t-fast)", width: "100%", textAlign: "left" }}>
      {icon}{label}
    </button>
  );
}
function SmallBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} style={{ fontSize: 11, padding: "3px 9px", borderRadius: "var(--r-sm)", background: "var(--accent-violet)", color: "#fff", border: "none", cursor: "pointer" }}>{children}</button>;
}

/** Inline picker that converts a brainstorm object into an architecture node. */
function ConvertToArchBtn({ nodeId }: { nodeId: string }) {
  const [open, setOpen] = useState(false);
  const convertNode = useWorkspaceStore((s) => s.convertNode);
  const setMode = useUIStore((s) => s.setMode);

  const QUICK_KINDS: { kind: ComponentKind; label: string }[] = [
    { kind: "service", label: "Service" },
    { kind: "database", label: "Database" },
    { kind: "cache", label: "Cache" },
    { kind: "message-queue", label: "Queue" },
    { kind: "api-gateway", label: "API Gateway" },
    { kind: "worker", label: "Worker" },
  ];

  const doConvert = (kind: ComponentKind) => {
    convertNode(nodeId, kind);
    setMode("architecture");
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", marginTop: 8 }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "color-mix(in srgb, var(--accent-violet) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent-violet) 28%, transparent)", borderRadius: "var(--r-sm)", color: "var(--accent-violet)", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-ui)", width: "100%", textAlign: "left" }}
      >
        <Wrench size={12} />
        Convert to architecture component
      </button>
      {open && (
        <div style={{ position: "absolute", left: 0, top: "calc(100% + 4px)", zIndex: 300, background: "var(--surface-0)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-lg)", padding: 8, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {QUICK_KINDS.map((k) => (
            <button key={k.kind} onClick={() => doConvert(k.kind)} style={{ fontSize: 11, padding: "5px 8px", borderRadius: "var(--r-sm)", background: "var(--surface-1)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-primary)" }}>
              {k.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const inspectorStyle: React.CSSProperties = { width: 268, height: "100%", background: "var(--surface-0)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 };
const headerStyle: React.CSSProperties = { padding: "10px 12px 8px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 };
const headerLabelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" };
const iconBtnStyle: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", padding: 2, borderRadius: "var(--r-xs)" };
const cardStyle: React.CSSProperties = { background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "10px 12px", marginBottom: 12 };
const iconBoxStyle: React.CSSProperties = { width: 34, height: 34, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const inputStyle: React.CSSProperties = { width: "100%", background: "var(--surface-0)", border: "1.5px solid var(--border-strong)", borderRadius: "var(--r-sm)", color: "var(--text-primary)", fontSize: 12, padding: "4px 7px", fontFamily: "var(--font-ui)", outline: "none" };
const queryCardStyle: React.CSSProperties = { background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "7px 9px", marginBottom: 5 };
const kbdStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 20, padding: "0 6px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--border)", borderBottomWidth: 2, color: "var(--text-secondary)", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600 };
