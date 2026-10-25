import { ArrowUpRight, Boxes, GitBranch, MessageSquareText, Plus, ChevronRight, Clock, Zap, Users } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { formatTime } from "@/lib/id";
import { EXAMPLE_TEMPLATES } from "@/data/templates";

const TEMPLATE_COLORS: Record<string, string> = {
  ecommerce: "var(--accent-violet)",
  chat: "var(--accent-blue)",
  shortener: "var(--accent-green)",
};

export function Dashboard() {
  const setView     = useUIStore((s) => s.setView);
  const setFailureLabOpen = useUIStore((s) => s.setFailureLabOpen);
  const createNewWorkspace = useWorkspaceStore((s) => s.createNewWorkspace);

  const replaceGraph = useWorkspaceStore((s) => s.replaceGraph);

  const openTemplate = (template: (typeof EXAMPLE_TEMPLATES)[number]) => {
    replaceGraph(template.graph);
    setView("workspace");
  };
  const openNewWorkspace = () => { createNewWorkspace(); setView("workspace"); };
  const openFailureLab = () => {
    setFailureLabOpen(true);
    setView("workspace");
  };
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const timeline    = workspace.timeline.slice(0, 5);

  return (
    <div
      className="bv-dashboard"
      style={{
        minHeight: "100vh",
        background: "var(--surface-1)",
        color: "var(--text-primary)",
      }}
    >
      {/* Top bar */}
      <header
        className="bv-dashboard-header"
        style={{
          height: 52,
          background: "var(--surface-0)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 16,
        }}
      >
        <Logo />
        <div style={{ flex: 1 }} />
        <button
          onClick={openNewWorkspace}
          style={primaryBtnSt}
        >
          <Plus size={13} /> New Workspace
        </button>
        <UserChip />
      </header>

      <main
        className="bv-dashboard-main"
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "36px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Greeting */}
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              fontFamily: "var(--font-head)",
              letterSpacing: "-0.03em",
              marginBottom: 4,
            }}
          >
            Good to have you back 👋
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Your architecture is ready. Keep building.
          </p>
        </div>

        {/* Quick actions */}
        <div className="bv-dashboard-quick-actions" style={{ display: "flex", gap: 8 }}>
          <QuickAction icon={<Plus size={14} />}   label="New Workspace"    color="var(--accent-violet)" onClick={openNewWorkspace} />
          <QuickAction icon={<Users size={14} />}   label="Open Workspace"   color="var(--accent-blue)"   onClick={() => setView("workspace")} />
          <QuickAction icon={<Zap size={14} />}     label="Open Failure Lab" color="var(--accent-red)"    onClick={openFailureLab} />
        </div>

        {/* Workspace spotlight — a visual entry point into the architecture canvas */}
        <section className="bv-dashboard-spotlight" aria-labelledby="bv-dashboard-spotlight-title">
          <div className="bv-spotlight-copy">
            <div className="bv-spotlight-eyebrow"><span className="bv-spotlight-live-dot" /> YOUR SYSTEM, IN CONTEXT</div>
            <h2 id="bv-dashboard-spotlight-title">Make your architecture <span>make sense.</span></h2>
            <p>Model components, connect the data flow, discuss trade-offs, and pressure-test failure paths — all in one design workspace.</p>
            <div className="bv-spotlight-metrics">
              <span><Boxes size={13} /> {workspace.graph.nodes.filter((node) => node.type === "architecture").length} components</span>
              <span><GitBranch size={13} /> {workspace.graph.edges.filter((edge) => edge.kind === "dataflow").length} data flows</span>
              <span><MessageSquareText size={13} /> {workspace.queries.filter((q) => q.status !== "resolved").length} open questions</span>
            </div>
            <button className="bv-spotlight-cta" onClick={() => setView("workspace")}>
              Continue building <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="bv-spotlight-art" aria-hidden="true">
            <div className="bv-spotlight-orbit bv-spotlight-orbit-one" />
            <div className="bv-spotlight-orbit bv-spotlight-orbit-two" />
            <div className="bv-spotlight-window">
              <div className="bv-spotlight-windowbar">
                <span className="bv-spotlight-window-dots"><i /><i /><i /></span>
                <span>BITVERSE / SYSTEM MAP</span>
                <span className="bv-spotlight-demo-tag">DESIGN VIEW</span>
              </div>
              <div className="bv-spotlight-map">
                <svg className="bv-spotlight-connectors" viewBox="0 0 460 180" preserveAspectRatio="none">
                  <path d="M 94 91 C 118 91, 120 91, 143 91" />
                  <path d="M 233 91 C 259 91, 263 46, 291 46" />
                  <path d="M 233 91 C 259 91, 263 135, 291 135" />
                  <path d="M 373 46 C 400 46, 397 91, 418 91" />
                  <path d="M 373 135 C 400 135, 397 91, 418 91" />
                </svg>
                <div className="bv-spotlight-node bv-spotlight-node-client"><span className="bv-spotlight-node-icon client">W</span><span>Web client<small>Entry point</small></span></div>
                <div className="bv-spotlight-node bv-spotlight-node-api"><span className="bv-spotlight-node-icon api">↗</span><span>API gateway<small>Routing</small></span></div>
                <div className="bv-spotlight-node bv-spotlight-node-product"><span className="bv-spotlight-node-icon product">S</span><span>Service<small>Business logic</small></span></div>
                <div className="bv-spotlight-node bv-spotlight-node-orders"><span className="bv-spotlight-node-icon orders">Q</span><span>Queue<small>Async work</small></span></div>
                <div className="bv-spotlight-node bv-spotlight-node-db"><span className="bv-spotlight-node-icon db">D</span><span>Database<small>Persistence</small></span></div>
              </div>
            </div>
            <div className="bv-spotlight-float bv-spotlight-float-health"><span /> Structure at a glance</div>
            <div className="bv-spotlight-float bv-spotlight-float-query"><MessageSquareText size={12} /> Decisions stay attached</div>
          </div>
        </section>

        {/* Two columns */}
        <div className="bv-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Left: recent + templates */}
          <div className="bv-dashboard-primary-column" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Recent workspaces */}
            <div>
              <SectionTitle>Recent Workspaces</SectionTitle>
              <WorkspaceCard
                name={workspace.name}
                description={workspace.description ?? ""}
                updatedAt={workspace.updatedAt}
                nodes={workspace.graph.nodes.length}
                openQueries={workspace.queries.filter((q) => q.status !== "resolved").length}
                onClick={() => setView("workspace")}
              />
            </div>

            {/* Templates */}
            <div>
              <SectionTitle>Start from a Template</SectionTitle>
              <div className="bv-template-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {EXAMPLE_TEMPLATES.map((template) => (
                  <TemplateCard
                    key={template.id}
                    name={template.name}
                    nodes={template.graph.nodes.length}
                    color={TEMPLATE_COLORS[template.id] ?? "var(--accent-violet)"}
                    emoji={template.emoji}
                    onClick={() => openTemplate(template)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: activity + challenges */}
          <div className="bv-dashboard-side-column" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Activity */}
            <div>
              <SectionTitle>Recent Activity</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {timeline.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: "8px 10px",
                      background: "var(--surface-0)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--r-md)",
                    }}
                  >
                    <Clock size={12} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {e.description}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "var(--text-tertiary)",
                          marginTop: 2,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {e.author} · {formatTime(e.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenges */}
            <div>
              <SectionTitle>Active Challenges</SectionTitle>
              <ChallengeCard
                title="Database Failover Challenge"
                desc="Your primary DB has gone down. Redesign to survive."
                difficulty="Medium"
                color="var(--accent-amber)"
                onClick={() => setView("workspace")}
              />
              <ChallengeCard
                title="The Friday Traffic Spike"
                desc="Traffic spikes 10×. Identify bottlenecks and scale."
                difficulty="Hard"
                color="var(--accent-red)"
                onClick={() => setView("workspace")}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, userSelect: "none" }}>
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden>
        <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="var(--accent-violet)" strokeWidth="1.5" fill="none" />
        <circle cx="11" cy="11" r="2" fill="var(--accent-violet)" />
      </svg>
      <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--font-head)", letterSpacing: "-0.02em" }}>
        <span style={{ color: "var(--accent-violet)" }}>BIT</span>verse
      </span>
    </div>
  );
}

function UserChip() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(108,92,231,.15)", border: "1.5px solid var(--accent-violet)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--accent-violet)", userSelect: "none" }}>
      YO
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
      {children}
    </h2>
  );
}

function QuickAction({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: `color-mix(in srgb, ${color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`, borderRadius: "var(--r-sm)", color, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-ui)" }}
    >
      {icon}{label}
    </button>
  );
}

function WorkspaceCard({ name, description, updatedAt, nodes, openQueries, onClick }: {
  name: string; description: string; updatedAt: number;
  nodes: number; openQueries: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ padding: "14px", background: "var(--surface-0)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", textAlign: "left", cursor: "pointer", width: "100%", transition: "box-shadow var(--t-base)", display: "block" }}
    >
      {/* Mini graph */}
      <div style={{ height: 52, background: "var(--surface-1)", borderRadius: "var(--r-sm)", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(var(--canvas-dot) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
        <MiniGraph />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{name}</div>
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 9 }}>{description}</div>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Stat label="Components" value={nodes} />
        <Stat label="Open queries" value={openQueries} color="var(--accent-amber)" />
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{formatTime(updatedAt)}</span>
      </div>
    </button>
  );
}

function MiniGraph() {
  const n = [{ x: 18, y: 22 }, { x: 62, y: 10 }, { x: 62, y: 34 }, { x: 106, y: 22 }, { x: 148, y: 22 }];
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
  return (
    <svg width={180} height={52} style={{ position: "relative", zIndex: 1 }}>
      {edges.map(([a, b], i) => (
        <line key={i} x1={n[a].x + 7} y1={n[a].y + 5} x2={n[b].x} y2={n[b].y + 5} stroke="var(--border-strong)" strokeWidth={1} />
      ))}
      {n.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={14} height={10} rx={2} fill="var(--surface-0)" stroke="var(--border)" />
      ))}
    </svg>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: color ?? "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: 9, color: "var(--text-tertiary)" }}>{label}</div>
    </div>
  );
}

function TemplateCard({ name, nodes, color, emoji, onClick }: { name: string; nodes: number; color: string; emoji: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: "12px", background: "var(--surface-0)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", textAlign: "left", cursor: "pointer", width: "100%", transition: "border-color var(--t-base)" }}
    >
      <div style={{ fontSize: 20, marginBottom: 7 }}>{emoji}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 3 }}>{name}</div>
      <div style={{ fontSize: 9, color, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{nodes} components</div>
    </button>
  );
}

function ChallengeCard({ title, desc, difficulty, color, onClick }: { title: string; desc: string; difficulty: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", padding: "10px 12px", background: "var(--surface-0)", border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`, borderRadius: "var(--r-md)", textAlign: "left", cursor: "pointer", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}
    >
      <Zap size={12} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</div>
        <div style={{ fontSize: 9, color, fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: 5 }}>{difficulty.toUpperCase()}</div>
      </div>
      <ChevronRight size={11} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: 2 }} />
    </button>
  );
}

const primaryBtnSt: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, padding: "6px 14px",
  background: "var(--accent-violet)", border: "none", borderRadius: "var(--r-sm)",
  color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-ui)",
};
