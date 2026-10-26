import { ArrowUpRight, ChevronRight, Clock, Zap } from "lucide-react";
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
        <div className="bv-landing-brand">
          <Logo />
          <span className="bv-landing-brand-divider" aria-hidden="true" />
          <span className="bv-landing-tagline">Build it together</span>
        </div>
        <nav className="bv-landing-nav" aria-label="Main navigation">
          <button type="button" onClick={() => setView("workspace")}>The canvas</button>
          <button type="button" onClick={() => document.getElementById("bv-how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
          <button type="button" onClick={openFailureLab}>Failure lab</button>
          <button type="button" onClick={() => document.getElementById("bv-dashboard-content")?.scrollIntoView({ behavior: "smooth" })}>Open dashboard</button>
        </nav>
        <button className="bv-landing-start-button" onClick={openNewWorkspace} style={primaryBtnSt}>
          Start building <ArrowUpRight size={14} />
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
        {/* Team Sport hero — an expressive front door to the existing design workspace. */}
        <section
          className="bv-dashboard-spotlight bv-team-hero"
          aria-labelledby="bv-team-hero-title"
          onPointerMove={(event) => {
            if (event.pointerType === "touch") return;
            const bounds = event.currentTarget.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            const nx = (event.clientX - bounds.left) / bounds.width - 0.5;
            const ny = (event.clientY - bounds.top) / bounds.height - 0.5;
            const target = event.currentTarget;
            target.style.setProperty("--bv-hero-pointer-x", `${(nx * 24).toFixed(1)}px`);
            target.style.setProperty("--bv-hero-pointer-y", `${(ny * 18).toFixed(1)}px`);
            target.style.setProperty("--bv-hero-backdrop-x", `${(nx * -12).toFixed(1)}px`);
            target.style.setProperty("--bv-hero-backdrop-y", `${(ny * -9).toFixed(1)}px`);
          }}
          onPointerLeave={(event) => {
            const target = event.currentTarget;
            target.style.setProperty("--bv-hero-pointer-x", "0px");
            target.style.setProperty("--bv-hero-pointer-y", "0px");
            target.style.setProperty("--bv-hero-backdrop-x", "0px");
            target.style.setProperty("--bv-hero-backdrop-y", "0px");
          }}
        >
          <svg className="bv-team-hero-ribbons" viewBox="0 0 1500 760" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="bv-team-ribbon-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8d7bee" />
                <stop offset="36%" stopColor="#6ca9ef" />
                <stop offset="67%" stopColor="#c77add" />
                <stop offset="100%" stopColor="#f4a0a0" />
              </linearGradient>
              <linearGradient id="bv-team-iridescent-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dff5a4" />
                <stop offset="16%" stopColor="#7ad8c9" />
                <stop offset="31%" stopColor="#72c7ef" />
                <stop offset="46%" stopColor="#b2a1f4" />
                <stop offset="60%" stopColor="#ee9dd2" />
                <stop offset="74%" stopColor="#ffad88" />
                <stop offset="88%" stopColor="#ffd98a" />
                <stop offset="100%" stopColor="#9de0c5" />
              </linearGradient>
              <linearGradient id="bv-team-iridescent-reverse" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#dff5a4" />
                <stop offset="18%" stopColor="#7ad8c9" />
                <stop offset="37%" stopColor="#72c7ef" />
                <stop offset="55%" stopColor="#b2a1f4" />
                <stop offset="72%" stopColor="#ee9dd2" />
                <stop offset="86%" stopColor="#ffad88" />
                <stop offset="100%" stopColor="#ffd98a" />
              </linearGradient>
              <linearGradient id="bv-team-liquid-sheen-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="28%" stopColor="#ffffff" stopOpacity="0.82" />
                <stop offset="47%" stopColor="#ffffff" stopOpacity="0.30" />
                <stop offset="65%" stopColor="#15394b" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </linearGradient>
              <filter id="bv-team-liquid-soft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
            </defs>
            <path className="bv-team-liquid-glow" d="M -110 205 C 80 42, 245 44, 370 164 S 575 444, 744 366 S 1001 78, 1176 176 S 1418 414, 1610 250" />
            <path className="bv-team-liquid-band" d="M -110 205 C 80 42, 245 44, 370 164 S 575 444, 744 366 S 1001 78, 1176 176 S 1418 414, 1610 250" />
            <path className="bv-team-liquid-sheen" d="M -110 205 C 80 42, 245 44, 370 164 S 575 444, 744 366 S 1001 78, 1176 176 S 1418 414, 1610 250" />
            <path className="bv-team-liquid-glow bv-team-liquid-glow-alt" d="M -90 560 C 135 688, 315 405, 500 500 S 705 686, 890 560 S 1152 351, 1352 435 S 1510 618, 1620 510" />
            <path className="bv-team-liquid-band bv-team-liquid-band-alt" d="M -90 560 C 135 688, 315 405, 500 500 S 705 686, 890 560 S 1152 351, 1352 435 S 1510 618, 1620 510" />
            <path className="bv-team-liquid-sheen bv-team-liquid-sheen-alt" d="M -90 560 C 135 688, 315 405, 500 500 S 705 686, 890 560 S 1152 351, 1352 435 S 1510 618, 1620 510" />
            <path className="bv-team-ribbon" d="M 420 85 C 585 115, 548 385, 735 390 S 1010 122, 1195 230 S 1355 400, 1515 280" />
            <path className="bv-team-ribbon" d="M 390 105 C 560 140, 540 415, 735 420 S 1015 152, 1200 255 S 1360 425, 1520 305" />
            <path className="bv-team-ribbon" d="M 360 125 C 535 168, 530 445, 732 450 S 1015 182, 1205 280 S 1365 450, 1520 330" />
            <path className="bv-team-ribbon" d="M 330 145 C 510 195, 520 475, 730 480 S 1020 212, 1210 305 S 1370 475, 1520 355" />
            <path className="bv-team-ribbon" d="M 500 700 C 640 660, 700 545, 815 555 S 1035 710, 1170 620 S 1355 470, 1510 535" />
            <path className="bv-team-ribbon" d="M 475 725 C 620 685, 690 575, 810 585 S 1035 735, 1175 650 S 1360 500, 1515 565" />
            <path className="bv-team-ribbon" d="M 610 20 C 700 160, 730 230, 830 220 S 1010 15, 1135 35" />
          </svg>

          <div className="bv-team-hero-copy">
            <div className="bv-team-hero-eyebrow"><span className="bv-team-hero-eyebrow-mark">✦</span> THE SYSTEM DESIGN WORKSPACE</div>
            <h2 id="bv-team-hero-title">Architecture is a<br /><span className="bv-team-gradient">team sport.</span></h2>
            <p>Great systems come from better conversations. Sketch the architecture, question the decisions, and see how it holds up when things go wrong.</p>
            <div className="bv-team-hero-actions">
              <button className="bv-team-primary-cta" onClick={() => setView("workspace")}>Enter the canvas <ArrowUpRight size={17} /></button>
              <button className="bv-team-secondary-cta" onClick={() => document.getElementById("bv-how-it-works")?.scrollIntoView({ behavior: "smooth" })}><span>↘</span> See how it works</button>
            </div>
            <div className="bv-team-hero-proof">
              <div className="bv-team-avatar-stack">
                {workspace.collaborators.slice(0, 4).map((collaborator) => (
                  <span key={collaborator.id} title={collaborator.name} style={{ backgroundColor: collaborator.color }}>{collaborator.initials}</span>
                ))}
              </div>
              <div className="bv-team-hero-proof-copy">
                <strong>From first sketch to failure test</strong>
                <small>One space for the whole design journey.</small>
              </div>
            </div>
            <div className="bv-team-hero-footnote"><span /> Interactive prototype <i /> No setup required</div>
          </div>

          <div className="bv-team-hero-art" aria-hidden="true">
            <div className="bv-team-map-label">
              <span className="bv-team-map-live" />
              <div className="bv-team-map-label-copy"><strong>{workspace.name}</strong><small>Architecture map</small></div>
              <span className="bv-team-map-demo">DEMO</span>
            </div>
            <div className="bv-team-sticker bv-team-sticker-test"><span>↗</span> Let’s test it!</div>
            <div className="bv-team-float-card bv-team-float-dependencies">
              <span className="bv-team-float-icon">↗</span>
              <span className="bv-team-float-copy"><strong>Dependencies mapped</strong><small>Every connection tells a story</small></span>
            </div>
            <div className="bv-team-map-window">
              <div className="bv-team-window-bar">
                <div className="bv-team-window-dots"><i /><i /><i /></div>
                <span className="bv-team-window-name">{workspace.name} — Architecture Preview</span>
                <div className="bv-team-window-avatars">
                  {workspace.collaborators.slice(0, 3).map((collaborator) => (
                    <span key={collaborator.id} title={collaborator.name} style={{ backgroundColor: collaborator.color }}>{collaborator.initials}</span>
                  ))}
                </div>
              </div>
              <div className="bv-team-map-canvas">
                <svg className="bv-team-map-edges" viewBox="0 0 620 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="bv-team-edge-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a398ea" />
                      <stop offset="55%" stopColor="#79b9e7" />
                      <stop offset="100%" stopColor="#e29ed1" />
                    </linearGradient>
                  </defs>
                  <path d="M 126 150 C 135 150, 140 150, 149 150" />
                  <path d="M 262 150 C 280 150, 268 45, 285 45" />
                  <path d="M 262 150 C 282 150, 282 150, 285 150" />
                  <path d="M 262 150 C 280 150, 268 255, 285 255" />
                  <path d="M 397 45 C 427 45, 452 45, 493 45" />
                  <path d="M 397 150 C 427 150, 452 150, 493 150" />
                  <path d="M 397 255 C 427 255, 452 255, 493 255" />
                </svg>
                <div className="bv-team-node bv-team-node-web">
                  <span className="bv-team-node-icon">W</span><span className="bv-team-node-text"><strong>Web Client</strong><small>Entry point</small></span><i className="bv-team-node-status" />
                </div>
                <div className="bv-team-node bv-team-node-api">
                  <span className="bv-team-node-icon">↗</span><span className="bv-team-node-text"><strong>API Gateway</strong><small>Routing</small></span><i className="bv-team-node-status" />
                </div>
                <div className="bv-team-node bv-team-node-service bv-team-node-product">
                  <span className="bv-team-node-icon">S</span><span className="bv-team-node-text"><strong>Product Svc</strong><small>Business logic</small></span><i className="bv-team-node-status" />
                </div>
                <div className="bv-team-node bv-team-node-service bv-team-node-orders">
                  <span className="bv-team-node-icon">O</span><span className="bv-team-node-text"><strong>Order Svc</strong><small>Order processing</small></span><i className="bv-team-node-status" />
                </div>
                <div className="bv-team-node bv-team-node-service bv-team-node-payment">
                  <span className="bv-team-node-icon">P</span><span className="bv-team-node-text"><strong>Payment Svc</strong><small>Transactions</small></span><i className="bv-team-node-status" />
                </div>
                <div className="bv-team-node bv-team-node-data bv-team-node-redis">
                  <span className="bv-team-node-icon">R</span><span className="bv-team-node-text"><strong>Redis Cache</strong><small>92% hit rate</small></span><i className="bv-team-node-status" />
                </div>
                <div className="bv-team-node bv-team-node-data bv-team-node-postgres">
                  <span className="bv-team-node-icon">D</span><span className="bv-team-node-text"><strong>PostgreSQL</strong><small>68% capacity</small></span><i className="bv-team-node-status" />
                </div>
                <div className="bv-team-node bv-team-node-queue">
                  <span className="bv-team-node-icon">Q</span><span className="bv-team-node-text"><strong>Message Queue</strong><small>Async work</small></span><i className="bv-team-node-status" />
                </div>
              </div>
            </div>
            <div className="bv-team-sticker bv-team-sticker-spof">⚠ SPOF?</div>
            <div className="bv-team-float-card bv-team-float-stress">
              <span className="bv-team-float-icon stress">ϟ</span>
              <span className="bv-team-float-copy"><strong>Ready to stress-test</strong><small>Try a failure scenario ↗</small></span>
            </div>
          </div>
          <div className="bv-team-scroll-hint"><span /> Scroll to explore</div>
        </section>

        <section id="bv-how-it-works" className="bv-design-journey" aria-label="How BITverse works">
          <div className="bv-journey-intro"><span>THE DESIGN LOOP</span><h3>From first sketch to confidence.</h3></div>
          <div className="bv-journey-step"><span>01</span><div><h4>Sketch the system</h4><p>Drag components onto a shared architecture canvas.</p></div></div>
          <div className="bv-journey-step"><span>02</span><div><h4>Challenge decisions</h4><p>Capture open questions and make trade-offs visible.</p></div></div>
          <div className="bv-journey-step"><span>03</span><div><h4>Stress-test the flow</h4><p>Explore failure paths before they become outages.</p></div></div>
        </section>

        {/* Two columns */}
        <div id="bv-dashboard-content" className="bv-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
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
