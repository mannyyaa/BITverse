import { useEffect, useMemo, useState } from "react";
import {
  MousePointer2, Hand, StickyNote, Type, Pen, Highlighter, Eraser,
  Shapes, Frame, Spline, MessageSquarePlus, Boxes,
  RotateCcw, RotateCw, Users, FlaskConical, ShieldCheck, X,
  type LucideIcon,
} from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import { ComponentLibrary } from "@/components/canvas/ComponentLibrary";
import { Inspector } from "@/components/inspector/Inspector";
import { QueryPanel } from "@/components/queries/QueryPanel";
import { TimelinePanel } from "@/components/timeline/TimelinePanel";
import { FailureLabPanel } from "@/components/failure-lab/FailureLabPanel";
import { ArchitectureHealthPanel } from "@/components/health/ArchitectureHealthPanel";
import { analyzeArchitecture } from "@/engine/health/architectureHealth";
import { RaiseQueryDialog } from "@/components/queries/RaiseQueryDialog";
import { InviteDialog } from "@/components/workspaces/InviteDialog";
import { Avatar } from "@/components/ui/Avatar";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore, type ActivePanel, type ActiveTool, type ShapeToolKind } from "@/store/uiStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceSync } from "@/lib/useWorkspaceSync";
import { startCollabSession } from "@/collaboration/index";
import { AuthModal } from "@/components/auth/AuthModal";
import { SHAPES } from "@/lib/canvas";
import type { WorkspaceMode } from "@/domain/types";

interface ToolDef {
  id: ActiveTool;
  icon: LucideIcon;
  name: string;
  shortcut: string;
  what: string;
  when: string;
}

const TOOL_GROUPS: { label: string; tools: ToolDef[] }[] = [
  {
    label: "Navigate",
    tools: [
      { id: "select", icon: MousePointer2, name: "Select", shortcut: "V", what: "Select, move, and resize objects. Drag empty canvas to marquee-select.", when: "Use this to arrange your canvas." },
      { id: "hand", icon: Hand, name: "Hand", shortcut: "H", what: "Pan around the infinite canvas.", when: "Use when navigating a large board." },
    ],
  },
  {
    label: "Create",
    tools: [
      { id: "sticky", icon: StickyNote, name: "Sticky Note", shortcut: "N", what: "Capture an idea, assumption, or question.", when: "Use this before committing to an architecture." },
      { id: "text", icon: Type, name: "Text", shortcut: "T", what: "Place a free heading or label.", when: "Use to title a section or add context." },
      { id: "shape", icon: Shapes, name: "Shapes", shortcut: "S", what: "Add rectangles, circles, and diamonds.", when: "Use to map out areas or flow." },
      { id: "frame", icon: Frame, name: "Frame", shortcut: "F", what: "Group related work into named sections.", when: "Use to organise Frontend, Backend, Data Layer." },
    ],
  },
  {
    label: "Draw",
    tools: [
      { id: "pen", icon: Pen, name: "Pen", shortcut: "P", what: "Sketch freely to explore an idea.", when: "Use before turning ideas into structured components." },
      { id: "highlighter", icon: Highlighter, name: "Highlighter", shortcut: "U", what: "Mark important areas with translucent strokes.", when: "Use to emphasise risks or decisions." },
      { id: "eraser", icon: Eraser, name: "Eraser", shortcut: "E", what: "Remove freehand strokes.", when: "Use to clean up sketches." },
    ],
  },
  {
    label: "Connect",
    tools: [
      { id: "connector", icon: Spline, name: "Connector", shortcut: "C", what: "Draw arrows between any objects.", when: "Use to show how two components or ideas relate." },
      { id: "comment", icon: MessageSquarePlus, name: "Comment", shortcut: "M", what: "Attach a discussion to a component.", when: "Use to raise a question on a specific node." },
    ],
  },
  {
    label: "Architecture",
    tools: [
      { id: "components", icon: Boxes, name: "Components", shortcut: "A", what: "Add services, databases, caches, and queues.", when: "Use to build the real system architecture." },
    ],
  },
];

const SHORTCUT_TO_TOOL: Record<string, ActiveTool> = {
  v: "select", h: "hand", n: "sticky", t: "text", s: "shape", f: "frame",
  p: "pen", u: "highlighter", e: "eraser", c: "connector", m: "comment", a: "components",
};

export function WorkspaceView() {
  const { remoteId } = useWorkspaceSync();
  const { isAuthenticated, user: authUser, serverStatus } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Start Yjs collaboration when authenticated and we have a remote workspace ID
  useEffect(() => {
    if (!isAuthenticated || !remoteId) return;
    return startCollabSession(remoteId);
  }, [isAuthenticated, remoteId]);

  const workspace = useWorkspaceStore((s) => s.workspace);
  const undoGraph = useWorkspaceStore((s) => s.undoGraph);
  const redoGraph = useWorkspaceStore((s) => s.redoGraph);
  const canUndo = useWorkspaceStore((s) => s.pastGraphStates.length > 0);
  const canRedo = useWorkspaceStore((s) => s.futureGraphStates.length > 0);

  const {
    activeTool, setActiveTool, shapeKind, setShapeKind,
    activePanel, setActivePanel, mode, setMode,
    isComponentLibraryOpen, setComponentLibraryOpen,
    setInviteDialogOpen, setFailureLabOpen,
  } = useUIStore();

  const simPhase = useSimulationStore((s) => s.phase);
  const [isHealthCheckOpen, setHealthCheckOpen] = useState(false);
  const healthFindings = useMemo(
    () => analyzeArchitecture(workspace.graph.nodes, workspace.graph.edges),
    [workspace.graph.nodes, workspace.graph.edges],
  );
  const [hovered, setHovered] = useState<{ id: ActiveTool; top: number } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target;
      const isTyping =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement || (target instanceof HTMLElement && target.isContentEditable);
      if (isTyping) return;

      const key = e.key.toLowerCase();
      if (e.metaKey || e.ctrlKey) {
        if (key === "z") { e.preventDefault(); e.shiftKey ? redoGraph() : undoGraph(); return; }
        if (key === "y") { e.preventDefault(); redoGraph(); return; }
      }
      if (key === "escape") { setActiveTool("select"); return; }
      const tool = SHORTCUT_TO_TOOL[key];
      if (tool && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (tool === "components") setComponentLibraryOpen(true);
        setActiveTool(tool);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setActiveTool, setComponentLibraryOpen, undoGraph, redoGraph]);

  const isSimActive = simPhase !== "idle";
  const openQCount = workspace.queries.filter((q) => q.status !== "resolved").length;

  const pickTool = (id: ActiveTool) => {
    if (id === "components") setComponentLibraryOpen(true);
    setActiveTool(id);
  };

  const sidebarPanels: { id: ActivePanel; icon: LucideIcon; label: string; badge?: number }[] = [
    { id: "queries", icon: MessageSquarePlus, label: "Queries", badge: openQCount || undefined },
    { id: "timeline", icon: RotateCcw, label: "Timeline" },
  ];

  return (
    <div className="bv-workspace" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--canvas-bg)", overflow: "hidden" }}>
      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="bv-workspace-header" style={{ height: 48, display: "flex", alignItems: "center", padding: "0 10px", gap: 8, background: "var(--surface-0)", borderBottom: "1px solid var(--border)", flexShrink: 0, zIndex: 100 }}>
        <BITverseLogo />
        <Divider />

        {/* Mode switch */}
        <ModeSwitch mode={mode} setMode={setMode} />

        <Divider />

        <div className="bv-workspace-breadcrumb" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, minWidth: 0 }}>
          <span style={{ color: "var(--accent-violet)", fontWeight: 700, fontFamily: "var(--font-head)" }}>{workspace.name}</span>
          <span style={{ color: "var(--text-tertiary)" }}>·</span>
          <span className="bv-workspace-description" style={{ color: "var(--text-secondary)" }}>{workspace.description}</span>
        </div>

        <SavedBadge />

        <div style={{ flex: 1 }} />

        <TopBtn icon={<RotateCcw size={14} />} label="Undo (⌘Z)" disabled={!canUndo} onClick={undoGraph} />
        <TopBtn icon={<RotateCw size={14} />} label="Redo (⌘⇧Z)" disabled={!canRedo} onClick={redoGraph} />
        <Divider />

        <div className="bv-collaborator-list" style={{ display: "flex", alignItems: "center" }}>
          {workspace.collaborators.map((c, i) => (
            <div key={c.id} style={{ marginLeft: i === 0 ? 0 : -6, zIndex: workspace.collaborators.length - i }}>
              <Avatar name={c.name} color={c.color} initials={c.initials} size={24} online={c.online} />
            </div>
          ))}
        </div>
        <button className="bv-invite-btn" onClick={() => setInviteDialogOpen(true)} title="Invite collaborators (local demo — multiplayer is upcoming)" style={inviteBtnStyle}>
          <Users size={12} /> Invite
        </button>
        {/* Auth button — sign in for cloud sync + real-time collab */}
        {isAuthenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", background: "var(--surface-2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: serverStatus === "online" ? "var(--accent-green)" : "var(--status-degraded)", flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "var(--font-ui)" }}>{authUser?.name}</span>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            title="Sign in to enable cloud sync and real-time collaboration"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-ui)" }}
          >
            Sign in
          </button>
        )}
        <Divider />
        <button
          className="bv-health-check-btn"
          onClick={() => setHealthCheckOpen(true)}
          title="Run structural checks on architecture components and data-flow edges"
          aria-label={`Open Architecture Health Check, ${healthFindings.length} findings`}
          aria-expanded={isHealthCheckOpen}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 10px",
            background: "color-mix(in srgb, var(--accent-violet) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent-violet) 28%, transparent)",
            borderRadius: "var(--r-full)", color: "var(--accent-violet)",
            fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-ui)",
            whiteSpace: "nowrap", transition: "all var(--t-base)",
          }}
        >
          <ShieldCheck size={13} />
          <span>Health Check</span>
          <span style={{
            minWidth: 16, height: 16, padding: "0 4px", display: "inline-flex",
            alignItems: "center", justifyContent: "center", borderRadius: "var(--r-full)",
            background: healthFindings.some((f) => f.severity === "critical")
              ? "var(--accent-red)"
              : healthFindings.some((f) => f.severity === "warning")
              ? "var(--accent-amber)" : "var(--surface-3)",
            color: healthFindings.some((f) => f.severity === "critical" || f.severity === "warning")
              ? "#fff" : "var(--text-secondary)",
            fontSize: 9, fontFamily: "var(--font-mono)",
          }}>{healthFindings.length}</span>
        </button>
                <button
          className="bv-failure-lab-btn"
          onClick={() => setFailureLabOpen(true)}
          title="Open the Failure Lab — run what-if scenarios on your architecture"
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
            background: isSimActive ? "var(--accent-red)" : "color-mix(in srgb, var(--accent-violet) 10%, transparent)",
            border: `1px solid ${isSimActive ? "var(--accent-red)" : "color-mix(in srgb, var(--accent-violet) 28%, transparent)"}`,
            borderRadius: "var(--r-full)", color: isSimActive ? "#fff" : "var(--accent-violet)",
            fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-ui)", transition: "all var(--t-base)",
          }}
        >
          <FlaskConical size={13} />
          {isSimActive ? "Simulation Active" : "Failure Lab"}
        </button>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="bv-workspace-body" style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Left toolbar */}
        <div style={{ width: 50, flexShrink: 0, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 4px", background: "var(--surface-0)", borderRight: "1px solid var(--border)", zIndex: 12 }}>
          {TOOL_GROUPS.map((group, gi) => (
            <div key={group.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              {gi > 0 && <div aria-hidden style={{ height: 1, width: 22, background: "var(--border)", margin: "4px 0" }} />}
              {group.tools.map((t) => {
                const Icon = t.icon;
                const active = activeTool === t.id || (t.id === "shape" && activeTool === "frame");
                return (
                  <button
                    key={t.id}
                    onClick={() => pickTool(t.id)}
                    onMouseEnter={(e) => setHovered({ id: t.id, top: (e.currentTarget as HTMLButtonElement).offsetTop })}
                    onMouseLeave={() => setHovered(null)}
                    aria-label={t.name}
                    aria-pressed={active}
                    style={{
                      position: "relative", width: 36, height: 36, borderRadius: "var(--r-md)",
                      background: active ? "var(--accent-violet)" : "transparent",
                      border: "none", color: active ? "#fff" : "var(--text-secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      boxShadow: active ? "var(--glow-violet)" : "none",
                      transition: "background var(--t-base), color var(--t-base)",
                    }}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          ))}

          <div aria-hidden style={{ height: 1, width: 22, background: "var(--border)", margin: "4px 0" }} />
          {sidebarPanels.map((p) => {
            const Icon = p.icon;
            const active = activePanel === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePanel(p.id)}
                aria-label={p.label}
                aria-pressed={active}
                style={{ position: "relative", width: 36, height: 36, borderRadius: "var(--r-md)", background: active ? "var(--accent-violet)" : "transparent", border: "none", color: active ? "#fff" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background var(--t-base), color var(--t-base)" }}
              >
                <Icon size={16} />
                {p.badge !== undefined && (
                  <span style={{ position: "absolute", top: 3, right: 3, minWidth: 14, height: 14, borderRadius: "var(--r-full)", background: "var(--accent-pink)", color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "1.5px solid var(--surface-0)" }}>{p.badge}</span>
                )}
              </button>
            );
          })}

          {hovered && <Tooltip tool={TOOL_GROUPS.flatMap((g) => g.tools).find((t) => t.id === hovered.id)!} top={hovered.top} />}
        </div>

        {isComponentLibraryOpen && <ComponentLibrary />}

        {/* Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <ReactFlowProvider>
            <CanvasStage />
          </ReactFlowProvider>

          {/* Drawing settings overlay (pen / highlighter) */}
          {(activeTool === "pen" || activeTool === "highlighter") && (
            <DrawSettings />
          )}
          {(activeTool === "shape" || activeTool === "frame") && (
            <div className="bv-shape-picker" style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, padding: "6px", background: "var(--surface-0)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-md)", zIndex: 20 }}>
              {SHAPES.map((s) => {
                const active = s.kind === "frame" ? activeTool === "frame" : activeTool === "shape" && shapeKind === (s.kind as ShapeToolKind);
                return (
                  <button
                    key={s.kind}
                    onClick={() => {
                      if (s.kind === "frame") setActiveTool("frame");
                      else { setShapeKind(s.kind as ShapeToolKind); setActiveTool("shape"); }
                    }}
                    title={s.label}
                    aria-pressed={active}
                    style={shapeBtnStyle(active)}
                  >
                    <ShapeGlyph kind={s.kind} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Mode hint */}
          <div className="bv-mode-hint" style={{ position: "absolute", bottom: 12, left: 12, fontSize: 10, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", background: "color-mix(in srgb, var(--surface-0) 80%, transparent)", padding: "3px 8px", borderRadius: "var(--r-full)", border: "1px solid var(--border)", pointerEvents: "none" }}>
            {mode === "brainstorm" ? "Brainstorm mode — connections are freeform arrows" : "Architecture mode — connections are data-flow edges"}
          </div>
        </div>

        <RightArea />
      </div>

      <FailureLabPanel />
      {isHealthCheckOpen && <ArchitectureHealthPanel onClose={() => setHealthCheckOpen(false)} />}
      <RaiseQueryDialog />
      <InviteDialog />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

/* ── Right area ────────────────────────────────────────────────────────────── */
function RightArea() {
  const activePanel = useUIStore((s) => s.activePanel);
  const selectedId = useUIStore((s) => s.selectedNodeId);
  const selectedEdgeId = useUIStore((s) => s.selectedEdgeId);
  const setPanel = useUIStore((s) => s.setActivePanel);
  const openQCount = useWorkspaceStore((s) => s.workspace.queries.filter((q) => q.status !== "resolved").length);

  const hasSelection = !!selectedId || !!selectedEdgeId;
  if (!activePanel && !hasSelection) return null;

  const panelTitles: Partial<Record<NonNullable<ActivePanel>, string>> = { queries: "Queries", timeline: "Timeline" };

  return (
    <div className="bv-workspace-right-area" style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {hasSelection && <Inspector />}
      {activePanel && (
        <div className="bv-workspace-side-panel" style={{ width: 290, height: "100%", background: "var(--surface-0)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "9px 12px 8px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 5 }}>
              {panelTitles[activePanel] ?? activePanel}
              {activePanel === "queries" && openQCount > 0 && (
                <span style={{ fontSize: 9, background: "var(--accent-pink)", color: "#fff", borderRadius: "var(--r-full)", padding: "1px 5px", fontWeight: 700 }}>{openQCount}</span>
              )}
            </span>
            <button onClick={() => setPanel(null)} aria-label="Close panel" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", padding: 2 }}>
              <X size={13} />
            </button>
          </div>
          {activePanel === "queries" && <QueryPanel />}
          {activePanel === "timeline" && <TimelinePanel />}
        </div>
      )}
    </div>
  );
}

/* ── Tooltip ───────────────────────────────────────────────────────────────── */
function Tooltip({ tool, top }: { tool: ToolDef; top: number }) {
  return (
    <div
      role="tooltip"
      style={{
        position: "absolute", left: "calc(100% + 8px)", top: top - 6, zIndex: 200,
        width: 230, padding: "9px 11px", background: "var(--text-primary)", color: "var(--surface-0)",
        borderRadius: "var(--r-md)", boxShadow: "var(--shadow-lg)", pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-head)" }}>{tool.name}</span>
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", opacity: 0.6 }}>{tool.shortcut.toUpperCase()}</span>
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.45, opacity: 0.95 }}>{tool.what}</div>
      <div style={{ fontSize: 10, lineHeight: 1.4, opacity: 0.62, marginTop: 4, fontStyle: "italic" }}>{tool.when}</div>
    </div>
  );
}

/* ── Mode switch ───────────────────────────────────────────────────────────── */
function ModeSwitch({ mode, setMode }: { mode: WorkspaceMode; setMode: (m: WorkspaceMode) => void }) {
  const opts: { id: WorkspaceMode; label: string; tip: string }[] = [
    { id: "brainstorm", label: "Brainstorm", tip: "Sketch ideas, notes, and questions before adding structure." },
    { id: "architecture", label: "Architecture", tip: "Add structured services, databases, and real data-flow edges." },
  ];
  return (
    <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: "var(--r-full)", padding: 2 }}>
      {opts.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setMode(o.id)}
            title={o.tip}
            aria-pressed={active}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
              borderRadius: "var(--r-full)", border: "none", cursor: "pointer",
              background: active ? "var(--surface-0)" : "transparent",
              color: active ? "var(--accent-violet)" : "var(--text-tertiary)",
              fontSize: 11, fontWeight: 700, fontFamily: "var(--font-ui)",
              boxShadow: active ? "var(--shadow-xs)" : "none",
              transition: "all var(--t-base)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Shape glyphs ──────────────────────────────────────────────────────────── */
function ShapeGlyph({ kind }: { kind: string }) {
  const common = { width: 16, height: 16, stroke: "currentColor", strokeWidth: 1.75, fill: "none" } as const;
  switch (kind) {
    case "rect": return <svg {...common}><rect x="2" y="3" width="12" height="10" rx="1" /></svg>;
    case "rect-rounded": return <svg {...common}><rect x="2" y="3" width="12" height="10" rx="4" /></svg>;
    case "ellipse": return <svg {...common}><circle cx="8" cy="8" r="6" /></svg>;
    case "diamond": return <svg {...common}><path d="M8 2 L14 8 L8 14 L2 8 Z" /></svg>;
    case "frame": return <svg {...common}><rect x="2" y="4" width="12" height="10" rx="1" strokeDasharray="3 2" /><path d="M2 7 H14" /></svg>;
    default: return null;
  }
}

/* ── Logo + primitives ────────────────────────────────────────────────────── */
function BITverseLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0, userSelect: "none" }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="var(--accent-violet)" strokeWidth="1.5" fill="none" />
        <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" stroke="var(--accent-cyan)" strokeWidth="1" fill="rgba(108,92,231,.08)" />
        <circle cx="11" cy="11" r="2" fill="var(--accent-violet)" />
      </svg>
      <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--font-head)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
        <span style={{ color: "var(--accent-violet)" }}>BIT</span>verse
      </span>
    </div>
  );
}

function Divider() { return <div aria-hidden style={{ width: 1, height: 20, background: "var(--border)", margin: "0 2px", flexShrink: 0 }} />; }

function TopBtn({ icon, label, onClick, disabled = false }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button className="bv-top-btn" onClick={onClick} title={label} aria-label={label} disabled={disabled} aria-disabled={disabled}
      style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", background: "none", border: "none", color: "var(--text-tertiary)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.38 : 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "color var(--t-base)" }}>
      {icon}
    </button>
  );
}

function SavedBadge() {
  return (
    <span className="bv-saved-badge" title="Automatically saved in this browser only — not synced to other collaborators yet." aria-label="Saved locally"
      style={{ fontSize: 10, color: "var(--accent-green)", fontFamily: "var(--font-mono)", marginLeft: 6, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
      <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent-green) 12%, transparent)" }} />
      Saved locally
    </span>
  );
}

const inviteBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, padding: "5px 11px",
  background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-full)",
  color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-ui)",
};

function shapeBtnStyle(active: boolean): React.CSSProperties {
  return {
    width: 32, height: 32, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center",
    background: active ? "color-mix(in srgb, var(--accent-violet) 14%, transparent)" : "transparent",
    color: active ? "var(--accent-violet)" : "var(--text-secondary)",
    border: `1px solid ${active ? "color-mix(in srgb, var(--accent-violet) 35%, transparent)" : "transparent"}`,
    cursor: "pointer", transition: "all var(--t-fast)",
  };
}

/* ── Drawing settings bubble ────────────────────────────────────────────── */
const STROKE_COLORS = [
  "#292c35", "#cf737a", "#8270cf", "#66977b", "#d69a6f",
  "#6099bb", "#c77fa4", "#ffffff",
];
const STROKE_WIDTHS = [1.5, 2.5, 4, 7];

function DrawSettings() {
  const { strokeColor, setStrokeColor, strokeWidth, setStrokeWidth } = useUIStore();
  return (
    <div style={{
      position: "absolute", top: 12, left: 12, zIndex: 20,
      background: "var(--surface-0)", border: "1px solid var(--border)",
      borderRadius: "var(--r-md)", boxShadow: "var(--shadow-md)", padding: "8px 10px",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Stroke</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 140 }}>
        {STROKE_COLORS.map((c) => (
          <button
            key={c} onClick={() => setStrokeColor(c)} title={c}
            aria-label={`Stroke colour ${c}`} aria-pressed={strokeColor === c}
            style={{
              width: 18, height: 18, borderRadius: "var(--r-full)",
              background: c, cursor: "pointer", padding: 0,
              border: strokeColor === c
                ? "2px solid var(--accent-violet)"
                : c === "#ffffff" ? "1px solid var(--border-strong)" : "1px solid rgba(0,0,0,.15)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        {STROKE_WIDTHS.map((w) => (
          <button
            key={w} onClick={() => setStrokeWidth(w)} title={`${w}px`}
            aria-pressed={strokeWidth === w}
            style={{
              width: 28, height: 28, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center",
              background: strokeWidth === w ? "color-mix(in srgb, var(--accent-violet) 14%, transparent)" : "var(--surface-1)",
              border: strokeWidth === w ? "1px solid color-mix(in srgb, var(--accent-violet) 35%, transparent)" : "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <div style={{ width: w * 1.6, height: w * 1.6, maxWidth: 16, maxHeight: 16, borderRadius: "50%", background: strokeColor || "var(--text-primary)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
