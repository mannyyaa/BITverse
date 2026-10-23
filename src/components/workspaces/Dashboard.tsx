import { Plus, ChevronRight, Clock, Zap, Users } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { formatTime } from "@/lib/id";

const TEMPLATES = [
  { id: "ecommerce",  name: "E-commerce Platform",        nodes: 11, color: "#55E6FF", icon: "🛒" },
  { id: "chat",       name: "Real-Time Chat Application", nodes: 8,  color: "#A78BFA", icon: "💬" },
  { id: "url",        name: "URL Shortener",              nodes: 5,  color: "#57E3A0", icon: "🔗" },
  { id: "streaming",  name: "Video Streaming Platform",   nodes: 12, color: "#FFBF69", icon: "🎬" },
  { id: "delivery",   name: "Food Delivery System",       nodes: 10, color: "#FF667D", icon: "🚚" },
];

export function Dashboard() {
  const setView = useUIStore((s) => s.setView);
  const workspace = useWorkspaceStore((s) => s.workspace);
  const timeline = workspace.timeline.slice(0, 5);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        height: 56, display: "flex", alignItems: "center", padding: "0 32px",
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
      }}>
        <LogoMark />
        <div style={{ flex: 1 }} />
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(85,230,255,.2)", border: "1.5px solid #55E6FF66", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--cyan)" }}>
          YO
        </div>
      </header>

      <main style={{ flex: 1, padding: "40px 32px", maxWidth: 1100, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 36 }}>
        {/* Greeting */}
        <div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800, letterSpacing: "-.03em", marginBottom: 4 }}>
            Good evening 👋
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Your architecture is ready. Let's keep building.
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <QuickAction
            icon={<Plus size={16} />}
            label="New Workspace"
            color="#55E6FF"
            onClick={() => setView("workspace")}
          />
          <QuickAction
            icon={<Users size={16} />}
            label="Join Workspace"
            color="#A78BFA"
            onClick={() => {}}
          />
          <QuickAction
            icon={<Zap size={16} />}
            label="Open Failure Lab"
            color="#FF667D"
            onClick={() => setView("workspace")}
          />
        </div>

        {/* Recent workspaces */}
        <div>
          <SectionTitle>Recent Workspaces</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            <WorkspaceCard
              name={workspace.name}
              description={workspace.description ?? ""}
              updatedAt={workspace.updatedAt}
              nodes={workspace.graph.nodes.length}
              queries={workspace.queries.filter((q) => q.status !== "resolved").length}
              onClick={() => setView("workspace")}
            />
          </div>
        </div>

        {/* Templates */}
        <div>
          <SectionTitle>Start from a Template</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {TEMPLATES.map((t) => (
              <TemplateCard key={t.id} {...t} onClick={() => setView("workspace")} />
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <div>
            <SectionTitle>Recent Activity</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {timeline.map((event) => (
                <div key={event.id} style={{ display: "flex", gap: 10, padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7 }}>
                  <Clock size={13} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.4 }}>{event.description}</div>
                    <div style={{ fontSize: 9, color: "var(--text-3)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                      {event.author} · {formatTime(event.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle>Active Challenges</SectionTitle>
            <ChallengeCard
              title="The Database Failover Challenge"
              description="Your primary database has gone down. Redesign the system to survive this failure."
              difficulty="Medium"
              color="#FFBF69"
              onClick={() => setView("workspace")}
            />
            <ChallengeCard
              title="The Friday Traffic Spike"
              description="Traffic spikes 10x. Identify bottlenecks and scale the system to handle it."
              difficulty="Hard"
              color="#FF667D"
              onClick={() => setView("workspace")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function LogoMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#55E6FF" strokeWidth="1.5" fill="none"/>
        <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" stroke="#A78BFA" strokeWidth="1" fill="rgba(85,230,255,.08)"/>
        <circle cx="11" cy="11" r="2" fill="#55E6FF"/>
      </svg>
      <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-head)" }}>
        <span style={{ color: "var(--cyan)" }}>BIT</span><span style={{ color: "var(--text)" }}>verse</span>
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>{children}</h2>;
}

function QuickAction({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
        background: `${color}10`, border: `1px solid ${color}30`,
        borderRadius: 7, color, fontSize: 12, fontWeight: 600,
        cursor: "pointer", fontFamily: "var(--font-ui)", transition: "all .15s",
      }}
    >
      {icon}{label}
    </button>
  );
}

function WorkspaceCard({ name, description, updatedAt, nodes, queries, onClick }: {
  name: string; description: string; updatedAt: number; nodes: number; queries: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "16px", background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 10,
        textAlign: "left", cursor: "pointer", width: "100%",
        transition: "border-color .15s",
      }}
    >
      {/* Mini graph preview */}
      <div style={{ height: 60, background: "var(--bg)", borderRadius: 6, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#283349 1px, transparent 1px)", backgroundSize: "16px 16px", opacity: 0.5 }} />
        <MiniGraphPreview />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{name}</div>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 10 }}>{description}</div>
      <div style={{ display: "flex", gap: 12 }}>
        <Stat label="Components" value={nodes} />
        <Stat label="Open queries" value={queries} color="#FFBF69" />
        <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          {formatTime(updatedAt)}
        </div>
      </div>
    </button>
  );
}

function MiniGraphPreview() {
  const nodes = [{ x: 20, y: 25 }, { x: 70, y: 10 }, { x: 70, y: 40 }, { x: 120, y: 25 }, { x: 160, y: 25 }];
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
  return (
    <svg width={200} height={60} style={{ position: "relative", zIndex: 1 }}>
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].x + 8} y1={nodes[a].y + 6}
          x2={nodes[b].x} y2={nodes[b].y + 6}
          stroke="#283349" strokeWidth={1}
        />
      ))}
      {nodes.map((n, i) => (
        <rect key={i} x={n.x} y={n.y} width={16} height={12} rx={2} fill="#171F30" stroke="#283349" />
      ))}
    </svg>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: color ?? "var(--text)" }}>{value}</div>
      <div style={{ fontSize: 9, color: "var(--text-3)" }}>{label}</div>
    </div>
  );
}

function TemplateCard({ name, nodes, color, icon, onClick }: { name: string; nodes: number; color: string; icon: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "14px", background: "var(--surface)",
        border: `1px solid ${color}20`, borderRadius: 8,
        textAlign: "left", cursor: "pointer",
        transition: "all .15s", width: "100%",
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", lineHeight: 1.4, marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 10, color: color, fontFamily: "var(--font-mono)" }}>{nodes} components</div>
    </button>
  );
}

function ChallengeCard({ title, description, difficulty, color, onClick }: { title: string; description: string; difficulty: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "12px 14px", background: "var(--surface)",
        border: `1px solid ${color}25`, borderRadius: 8, textAlign: "left",
        cursor: "pointer", marginBottom: 10,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}
    >
      <Zap size={14} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>{description}</div>
        <div style={{ fontSize: 9, color, fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: 6 }}>
          {difficulty.toUpperCase()}
        </div>
      </div>
      <ChevronRight size={12} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 2 }} />
    </button>
  );
}
