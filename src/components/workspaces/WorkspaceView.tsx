import { useState, useEffect } from "react";
import {
  MousePointer2, Hand, Link2, MessageSquarePlus, Zap,
  ChevronRight, RotateCcw, RotateCw, Users,
  Clock, MessageCircle, PanelLeft,
} from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import { ComponentLibrary } from "@/components/canvas/ComponentLibrary";
import { Inspector } from "@/components/inspector/Inspector";
import { QueryPanel } from "@/components/queries/QueryPanel";
import { TimelinePanel } from "@/components/timeline/TimelinePanel";
import { FailureLabPanel } from "@/components/failure-lab/FailureLabPanel";
import { RaiseQueryDialog } from "@/components/queries/RaiseQueryDialog";
import { InviteDialog } from "@/components/workspaces/InviteDialog";
import { Avatar } from "@/components/ui/Avatar";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore, type ActivePanel, type ActiveTool } from "@/store/uiStore";
import { useSimulationStore } from "@/store/simulationStore";

export function WorkspaceView() {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const collaborators = workspace.collaborators;

  const {
    activeTool, setActiveTool,
    activePanel, setActivePanel,
    isComponentLibraryOpen, setComponentLibraryOpen,
    setInviteDialogOpen,
    setFailureLabOpen,
  } = useUIStore();

  const simPhase = useSimulationStore((s) => s.phase);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // Simulate autosave
  useEffect(() => {
    const t = setInterval(() => {
      setSaveStatus("saving");
      setTimeout(() => setSaveStatus("saved"), 600);
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  const tools: { id: ActiveTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: "select",    icon: <MousePointer2 size={16} />, label: "Select & Move", shortcut: "V" },
    { id: "pan",       icon: <Hand size={16} />,          label: "Pan Canvas",   shortcut: "H" },
    { id: "connect",   icon: <Link2 size={16} />,         label: "Connect",      shortcut: "C" },
    { id: "annotate",  icon: <MessageSquarePlus size={16} />, label: "Annotate", shortcut: "A" },
  ];

  const panels: { id: ActivePanel; icon: React.ReactNode; label: string }[] = [
    { id: "queries",     icon: <MessageCircle size={16} />, label: "Queries" },
    { id: "timeline",    icon: <Clock size={16} />,         label: "Timeline" },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "v" || e.key === "V") setActiveTool("select");
      if (e.key === "h" || e.key === "H") setActiveTool("pan");
      if (e.key === "c" || e.key === "C") setActiveTool("connect");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setActiveTool]);

  const isSimActive = simPhase !== "idle";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header style={{
        height: 48, display: "flex", alignItems: "center",
        padding: "0 12px", gap: 8,
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        flexShrink: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <BITverseLogo />

        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        {/* Workspace name */}
        <div style={{ fontSize: 12, color: "var(--text-2)" }}>
          <span style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            {workspace.name}
          </span>
          <span style={{ margin: "0 4px", color: "var(--text-3)" }}>·</span>
          <span style={{ color: "var(--text)" }}>{workspace.description}</span>
        </div>

        {/* Save status */}
        <div style={{ marginLeft: 8, fontSize: 10, color: saveStatus === "saved" ? "#57E3A0" : "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          {saveStatus === "saved" ? "● All changes saved" : saveStatus === "saving" ? "○ Saving..." : "○ Unsaved"}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Undo/Redo */}
        <TopBarBtn icon={<RotateCcw size={14} />} label="Undo (⌘Z)" onClick={() => {}} />
        <TopBarBtn icon={<RotateCw size={14} />} label="Redo (⌘⇧Z)" onClick={() => {}} />

        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        {/* Collaborators */}
        <div style={{ display: "flex", alignItems: "center", gap: -4, position: "relative" }}>
          {collaborators.map((c, i) => (
            <div key={c.id} style={{ marginLeft: i === 0 ? 0 : -6, zIndex: collaborators.length - i }}>
              <Avatar name={c.name} color={c.color} initials={c.initials} size={26} online={c.online} />
            </div>
          ))}
        </div>

        {/* Invite */}
        <button
          onClick={() => setInviteDialogOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 6, color: "var(--text-2)", fontSize: 11, cursor: "pointer",
            fontFamily: "var(--font-ui)",
          }}
        >
          <Users size={12} />
          Invite
        </button>

        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        {/* Break the System CTA */}
        <button
          onClick={() => setFailureLabOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "5px 14px",
            background: isSimActive ? "#FF667D" : "rgba(255,102,125,.12)",
            border: `1px solid ${isSimActive ? "#FF667D" : "rgba(255,102,125,.35)"}`,
            borderRadius: 6, color: isSimActive ? "var(--bg)" : "#FF667D",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            fontFamily: "var(--font-ui)", transition: "all .15s",
          }}
          aria-label="Open Failure Lab"
        >
          <Zap size={12} />
          {isSimActive ? "Simulation Active" : "Break the System"}
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Left: Toolbar ─────────────────────────────────────────────── */}
        <div style={{
          width: 44, flexShrink: 0, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 2, padding: "8px 4px",
          background: "var(--surface)", borderRight: "1px solid var(--border)",
          zIndex: 10,
        }}>
          {/* Toggle component library */}
          <ToolBtn
            icon={<PanelLeft size={16} />}
            label="Toggle Library"
            active={isComponentLibraryOpen}
            onClick={() => setComponentLibraryOpen(!isComponentLibraryOpen)}
          />
          <div style={{ height: 1, width: 24, background: "var(--border)", margin: "4px 0" }} />

          {tools.map((t) => (
            <ToolBtn
              key={t.id}
              icon={t.icon}
              label={`${t.label} (${t.shortcut})`}
              active={activeTool === t.id}
              onClick={() => setActiveTool(t.id)}
            />
          ))}

          <div style={{ height: 1, width: 24, background: "var(--border)", margin: "4px 0" }} />

          {panels.map((p) => (
            <ToolBtn
              key={p.id}
              icon={p.icon}
              label={p.label}
              active={activePanel === p.id}
              onClick={() => setActivePanel(p.id)}
            />
          ))}
        </div>

        {/* ── Component Library ─────────────────────────────────────────── */}
        {isComponentLibraryOpen && <ComponentLibrary />}

        {/* ── Canvas ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <ReactFlowProvider>
            <CanvasStage />
          </ReactFlowProvider>
        </div>

        {/* ── Right panel: Inspector / Queries / Timeline ──────────────── */}
        <RightPanel />
      </div>

      {/* ── Overlay dialogs ───────────────────────────────────────────── */}
      <FailureLabPanel />
      <RaiseQueryDialog />
      <InviteDialog />
    </div>
  );
}

function RightPanel() {
  const activePanel = useUIStore((s) => s.activePanel);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const openQueries = useWorkspaceStore((s) => s.workspace.queries.filter((q) => q.status !== "resolved").length);

  const hasPanel = activePanel || selectedNodeId;

  if (!hasPanel) return null;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Inspector */}
      {selectedNodeId && <Inspector />}

      {/* Panel */}
      {activePanel && (
        <div style={{
          width: 300, height: "100%",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <PanelHeader panel={activePanel} queryCount={openQueries} />
          {activePanel === "queries" && <QueryPanel />}
          {activePanel === "timeline" && <TimelinePanel />}
        </div>
      )}
    </div>
  );
}

function PanelHeader({ panel, queryCount }: { panel: string; queryCount: number }) {
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const titles: Record<string, string> = { queries: "Queries", timeline: "Timeline" };

  return (
    <div style={{
      padding: "10px 14px 8px",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: ".06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
        {titles[panel] ?? panel}
        {panel === "queries" && queryCount > 0 && (
          <span style={{ fontSize: 9, background: "#FFBF69", color: "var(--bg)", borderRadius: 10, padding: "1px 5px", fontWeight: 700 }}>
            {queryCount}
          </span>
        )}
      </span>
      <button
        onClick={() => setActivePanel(null)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 2 }}
        aria-label="Close panel"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function BITverseLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0, userSelect: "none" }}>
      {/* Geometric symbol */}
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#55E6FF" strokeWidth="1.5" fill="none"/>
        <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" stroke="#A78BFA" strokeWidth="1" fill="rgba(85,230,255,.08)"/>
        <circle cx="11" cy="11" r="2" fill="#55E6FF"/>
      </svg>
      <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--font-head)", letterSpacing: "-.02em" }}>
        <span style={{ color: "var(--cyan)" }}>BIT</span>
        <span style={{ color: "var(--text)" }}>verse</span>
      </span>
    </div>
  );
}

function ToolBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width: 34, height: 34, borderRadius: 7,
        background: active ? "var(--cyan)" : "none",
        border: active ? "none" : "1px solid transparent",
        color: active ? "var(--bg)" : "var(--text-3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all .12s",
        boxShadow: active ? "var(--glow-cyan)" : "none",
      }}
    >
      {icon}
    </button>
  );
}

function TopBarBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width: 28, height: 28, borderRadius: 6,
        background: "none", border: "none",
        color: "var(--text-3)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "color .12s",
      }}
    >
      {icon}
    </button>
  );
}
