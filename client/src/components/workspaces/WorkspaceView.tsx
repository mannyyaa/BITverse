import { useEffect } from "react";
import {
  MousePointer2, Hand, Link2, MessageSquarePlus, Zap,
  RotateCcw, RotateCw, Users, Clock, MessageCircle, PanelLeft, X,
} from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import { CanvasStage }      from "@/components/canvas/CanvasStage";
import { ComponentLibrary } from "@/components/canvas/ComponentLibrary";
import { Inspector }        from "@/components/inspector/Inspector";
import { QueryPanel }       from "@/components/queries/QueryPanel";
import { TimelinePanel }    from "@/components/timeline/TimelinePanel";
import { FailureLabPanel }  from "@/components/failure-lab/FailureLabPanel";
import { RaiseQueryDialog } from "@/components/queries/RaiseQueryDialog";
import { InviteDialog }     from "@/components/workspaces/InviteDialog";
import { Avatar }           from "@/components/ui/Avatar";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore, type ActivePanel, type ActiveTool } from "@/store/uiStore";
import { useSimulationStore } from "@/store/simulationStore";

export function WorkspaceView() {
  const workspace     = useWorkspaceStore((s) => s.workspace);
  const undoGraph     = useWorkspaceStore((s) => s.undoGraph);
  const redoGraph     = useWorkspaceStore((s) => s.redoGraph);
  const canUndo       = useWorkspaceStore((s) => s.pastGraphStates.length > 0);
  const canRedo       = useWorkspaceStore((s) => s.futureGraphStates.length > 0);
  const {
    activeTool, setActiveTool,
    activePanel, setActivePanel,
    isComponentLibraryOpen, setComponentLibraryOpen,
    setInviteDialogOpen,
    setFailureLabOpen,
  } = useUIStore();

  const simPhase = useSimulationStore((s) => s.phase);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isTyping) return;

      const key = e.key.toLowerCase();
      const hasCommandModifier = e.metaKey || e.ctrlKey;
      if (hasCommandModifier && key === "z") {
        e.preventDefault();
        if (e.shiftKey) redoGraph();
        else undoGraph();
        return;
      }
      if (hasCommandModifier && key === "y") {
        e.preventDefault();
        redoGraph();
        return;
      }

      if (key === "v") setActiveTool("select");
      if (key === "h") setActiveTool("pan");
      if (key === "c") setActiveTool("connect");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setActiveTool, undoGraph, redoGraph]);

  const tools: { id: ActiveTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: "select",   icon: <MousePointer2 size={15} />, label: "Select & Move", shortcut: "V" },
    { id: "pan",      icon: <Hand size={15} />,          label: "Pan canvas",    shortcut: "H" },
    { id: "connect",  icon: <Link2 size={15} />,         label: "Connect nodes", shortcut: "C" },
    { id: "annotate", icon: <MessageSquarePlus size={15} />, label: "Annotate",  shortcut: "A" },
  ];

  const sidebarPanels: { id: ActivePanel; icon: React.ReactNode; label: string }[] = [
    { id: "queries",  icon: <MessageCircle size={15} />, label: "Queries"  },
    { id: "timeline", icon: <Clock size={15} />,         label: "Timeline" },
  ];

  const isSimActive = simPhase !== "idle";
  const openQCount  = workspace.queries.filter((q) => q.status !== "resolved").length;

  return (
    <div
      className="bv-workspace"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--canvas-bg)",
        overflow: "hidden",
      }}
    >
      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <header
        className="bv-workspace-header"
        style={{
          height: 46,
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 6,
          background: "var(--surface-0)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <BITverseLogo />

        <Divider />

        {/* Workspace breadcrumb */}
        <div className="bv-workspace-breadcrumb" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, minWidth: 0 }}>
          <span
            style={{
              color: "var(--accent-violet)",
              fontWeight: 600,
              fontFamily: "var(--font-ui)",
            }}
          >
            {workspace.name}
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>·</span>
          <span className="bv-workspace-description" style={{ color: "var(--text-secondary)" }}>{workspace.description}</span>
        </div>

        {/* Saved indicator */}
        <SavedBadge />

        <div style={{ flex: 1 }} />

        {/* Undo / Redo */}
        <TopBtn icon={<RotateCcw size={13} />} label="Undo (⌘Z)" disabled={!canUndo} onClick={undoGraph} />
        <TopBtn icon={<RotateCw  size={13} />} label="Redo (⌘⇧Z)" disabled={!canRedo} onClick={redoGraph} />

        <Divider />

        {/* Collaborator avatars */}
        <div className="bv-collaborator-list" style={{ display: "flex", alignItems: "center" }}>
          {workspace.collaborators.map((c, i) => (
            <div key={c.id} style={{ marginLeft: i === 0 ? 0 : -6, zIndex: workspace.collaborators.length - i }}>
              <Avatar name={c.name} color={c.color} initials={c.initials} size={24} online={c.online} />
            </div>
          ))}
        </div>

        <button
          className="bv-invite-btn"
          onClick={() => setInviteDialogOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-sm)",
            color: "var(--text-secondary)",
            fontSize: 11, cursor: "pointer",
            fontFamily: "var(--font-ui)",
          }}
        >
          <Users size={11} /> Invite
        </button>

        <Divider />

        {/* Break the System */}
        <button
          className="bv-failure-lab-btn"
          onClick={() => setFailureLabOpen(true)}
          aria-label="Open Failure Lab"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px",
            background: isSimActive
              ? "var(--accent-red)"
              : "rgba(214,48,49,.07)",
            border: `1px solid ${isSimActive ? "var(--accent-red)" : "rgba(214,48,49,.3)"}`,
            borderRadius: "var(--r-sm)",
            color: isSimActive ? "#fff" : "var(--accent-red)",
            fontSize: 11, fontWeight: 700,
            cursor: "pointer", fontFamily: "var(--font-ui)",
            transition: "all var(--t-base)",
          }}
        >
          <Zap size={11} />
          {isSimActive ? "Simulation Active" : "Break the System"}
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="bv-workspace-body" style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* ── Left toolbar ────────────────────────────────────────────── */}
        <div
          style={{
            width: 42,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "8px 3px",
            background: "var(--surface-0)",
            borderRight: "1px solid var(--border)",
            zIndex: 10,
          }}
        >
          {/* Toggle library */}
          <ToolBtn
            icon={<PanelLeft size={15} />}
            label="Toggle component library"
            active={isComponentLibraryOpen}
            onClick={() => setComponentLibraryOpen(!isComponentLibraryOpen)}
          />
          <HRule />

          {/* Drawing tools */}
          {tools.map((t) => (
            <ToolBtn
              key={t.id}
              icon={t.icon}
              label={`${t.label} (${t.shortcut})`}
              active={activeTool === t.id}
              onClick={() => setActiveTool(t.id)}
            />
          ))}
          <HRule />

          {/* Panel toggles */}
          {sidebarPanels.map((p) => (
            <ToolBtn
              key={p.id ?? "null"}
              icon={p.icon}
              label={p.label}
              active={activePanel === p.id}
              badge={p.id === "queries" && openQCount > 0 ? openQCount : undefined}
              onClick={() => setActivePanel(p.id)}
            />
          ))}
        </div>

        {/* ── Component library ───────────────────────────────────────── */}
        {isComponentLibraryOpen && <ComponentLibrary />}

        {/* ── Canvas ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <ReactFlowProvider>
            <CanvasStage />
          </ReactFlowProvider>
        </div>

        {/* ── Right side: Inspector + Panel ───────────────────────────── */}
        <RightArea />
      </div>

      {/* Dialogs */}
      <FailureLabPanel />
      <RaiseQueryDialog />
      <InviteDialog />
    </div>
  );
}

/* ── Right area (Inspector + side panel) ──────────────────────────────────── */
function RightArea() {
  const activePanel  = useUIStore((s) => s.activePanel);
  const selectedId   = useUIStore((s) => s.selectedNodeId);
  const setPanel     = useUIStore((s) => s.setActivePanel);
  const openQCount   = useWorkspaceStore((s) =>
    s.workspace.queries.filter((q) => q.status !== "resolved").length,
  );

  if (!activePanel && !selectedId) return null;

  const panelTitles: Partial<Record<NonNullable<ActivePanel>, string>> = {
    queries:  "Queries",
    timeline: "Timeline",
  };

  return (
    <div className="bv-workspace-right-area" style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {selectedId && <Inspector />}

      {activePanel && (
        <div
          className="bv-workspace-side-panel"
          style={{
            width: 290,
            height: "100%",
            background: "var(--surface-0)",
            borderLeft: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: "9px 12px 8px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {panelTitles[activePanel] ?? activePanel}
              {activePanel === "queries" && openQCount > 0 && (
                <span
                  style={{
                    fontSize: 9,
                    background: "var(--accent-pink)",
                    color: "#fff",
                    borderRadius: "var(--r-full)",
                    padding: "1px 5px",
                    fontWeight: 700,
                  }}
                >
                  {openQCount}
                </span>
              )}
            </span>
            <button
              onClick={() => setPanel(null)}
              aria-label="Close panel"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                display: "flex",
                padding: 2,
              }}
            >
              <X size={13} />
            </button>
          </div>

          {activePanel === "queries"  && <QueryPanel />}
          {activePanel === "timeline" && <TimelinePanel />}
        </div>
      )}
    </div>
  );
}

/* ── Logo ──────────────────────────────────────────────────────────────────── */
function BITverseLogo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <polygon
          points="11,2 20,7 20,15 11,20 2,15 2,7"
          stroke="var(--accent-violet)"
          strokeWidth="1.5"
          fill="none"
        />
        <polygon
          points="11,6 16,9 16,13 11,16 6,13 6,9"
          stroke="var(--accent-cyan)"
          strokeWidth="1"
          fill="rgba(108,92,231,.08)"
        />
        <circle cx="11" cy="11" r="2" fill="var(--accent-violet)" />
      </svg>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          fontFamily: "var(--font-head)",
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
        }}
      >
        <span style={{ color: "var(--accent-violet)" }}>BIT</span>verse
      </span>
    </div>
  );
}

/* ── Primitives ───────────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div
      className="bv-workspace-divider"
      aria-hidden
      style={{
        width: 1,
        height: 18,
        background: "var(--border)",
        margin: "0 2px",
        flexShrink: 0,
      }}
    />
  );
}

function HRule() {
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        width: 24,
        background: "var(--border)",
        margin: "3px 0",
        flexShrink: 0,
      }}
    />
  );
}

function ToolBtn({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        position: "relative",
        width: 32,
        height: 32,
        borderRadius: "var(--r-sm)",
        background: active ? "var(--accent-violet)" : "none",
        border: "none",
        color: active ? "#fff" : "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background var(--t-base), color var(--t-base)",
        boxShadow: active ? "var(--glow-violet)" : "none",
      }}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent-pink)",
            border: "1.5px solid var(--surface-0)",
          }}
        />
      )}
    </button>
  );
}

function TopBtn({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="bv-top-btn"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        width: 26,
        height: 26,
        borderRadius: "var(--r-sm)",
        background: "none",
        border: "none",
        color: "var(--text-tertiary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color var(--t-base)",
      }}
    >
      {icon}
    </button>
  );
}

function SavedBadge() {
  return (
    <span
      className="bv-saved-badge"
      title="Automatically saved in this browser only — not synced to other collaborators yet."
      aria-label="Workspace saved locally in this browser"
      style={{
        fontSize: 10,
        color: "var(--accent-green)",
        fontFamily: "var(--font-mono)",
        marginLeft: 6,
        display: "flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "var(--accent-green)",
          boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent-green) 12%, transparent)",
        }}
      />
      Saved locally
    </span>
  );
}
