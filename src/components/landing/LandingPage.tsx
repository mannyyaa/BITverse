import { useState, useEffect } from "react";
import { ArrowRight, MessageCircle, TrendingUp, Users } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { ArchPreview } from "./ArchPreview";

export function LandingPage() {
  const setView = useUIStore((s) => s.setView);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", overflowX: "hidden" }}>
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        background: scrolled ? "rgba(9,13,22,.9)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        display: "flex", alignItems: "center",
        padding: "0 40px", gap: 32,
        transition: "all .2s",
      }}>
        <Logo />
        <div style={{ flex: 1 }} />
        <NavLinks />
        <button
          style={{ background: "none", border: "none", color: "var(--text-2)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-ui)" }}
          onClick={() => setView("dashboard")}
        >
          Sign in
        </button>
        <button
          onClick={() => setView("workspace")}
          style={{
            padding: "7px 18px",
            background: "linear-gradient(135deg, #55E6FF, #A78BFA)",
            border: "none", borderRadius: 7, color: "#090D16",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "var(--font-ui)", letterSpacing: "-.01em",
          }}
        >
          Start Building
        </button>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        gap: 40, padding: "120px 80px 80px",
        maxWidth: 1280, margin: "0 auto",
      }}>
        {/* Left */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20,
            background: "rgba(85,230,255,.08)", border: "1px solid rgba(85,230,255,.2)",
            marginBottom: 24,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#55E6FF", boxShadow: "0 0 6px #55E6FF" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--cyan)", letterSpacing: ".12em", textTransform: "uppercase" }}>
              The Collaborative System Design Lab
            </span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-head)", fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 800, lineHeight: 1.1, letterSpacing: "-.03em",
            marginBottom: 20, color: "var(--text)",
          }}>
            Great systems aren't drawn.{" "}
            <span style={{
              background: "linear-gradient(135deg, #55E6FF 0%, #A78BFA 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              They're built together.
            </span>
          </h1>

          <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            Design software architectures on a shared canvas. Question every decision. Break your system safely. Build something more resilient — together.
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <button
              onClick={() => setView("workspace")}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px",
                background: "linear-gradient(135deg, #55E6FF, #A78BFA)",
                border: "none", borderRadius: 8, color: "#090D16",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--font-ui)",
                boxShadow: "0 4px 24px rgba(85,230,255,.25)",
              }}
            >
              Enter the Verse <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setView("workspace")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "12px 20px",
                background: "rgba(255,255,255,.04)", border: "1px solid var(--border)",
                borderRadius: 8, color: "var(--text-2)",
                fontSize: 14, cursor: "pointer", fontFamily: "var(--font-ui)",
              }}
            >
              Explore a Live Architecture
            </button>
          </div>

          <p style={{ fontSize: 12, color: "var(--text-3)" }}>
            One canvas.&nbsp;&nbsp;Shared ideas.&nbsp;&nbsp;Better systems.
          </p>
        </div>

        {/* Right: Live arch preview */}
        <div>
          <ArchPreview />
        </div>
      </section>

      {/* ── Section 1: Build Together ────────────────────────────────── */}
      <LandingSection id="product">
        <SectionEyebrow>Build</SectionEyebrow>
        <SectionHeading>Build together, not in isolation</SectionHeading>
        <SectionBody>
          A shared infinite canvas means your whole team sees the same architecture — live. No more emailing diagrams or misaligned whiteboard photos.
        </SectionBody>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32 }}>
          <FeatureCard icon={<Users size={20} />} color="#55E6FF" title="Live presence" body="See your teammates' cursors and edits in real time as they happen." />
          <FeatureCard icon={<MessageCircle size={20} />} color="#A78BFA" title="Component queries" body="Raise questions and track discussions directly on the nodes they relate to." />
          <FeatureCard icon={<TrendingUp size={20} />} color="#57E3A0" title="Shared history" body="Every change is captured in the architecture timeline, so the team can understand how decisions evolved." />
        </div>
      </LandingSection>

      {/* ── Section 2: Every component ────────────────────────────── */}
      <LandingSection id="how-it-works" style={{ background: "var(--surface)" }}>
        <SectionEyebrow>Discuss</SectionEyebrow>
        <SectionHeading>Every component has a story</SectionHeading>
        <SectionBody>
          Services, databases, queues, APIs, and connections are editable objects — not static boxes. Attach metadata, raise questions, assign decisions.
        </SectionBody>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 32 }}>
          <ComponentShowcase kind="API Gateway" metric="1.2k req/s" status="Healthy" color="#55E6FF" />
          <ComponentShowcase kind="PostgreSQL" metric="68% capacity" status="Healthy" color="#57E3A0" />
          <ComponentShowcase kind="Redis Cache" metric="92% hit rate" status="Healthy" color="#57E3A0" />
          <ComponentShowcase kind="Message Queue" metric="1.2k msgs/s" status="Healthy" color="#FFBF69" />
        </div>
      </LandingSection>

      {/* ── Section 3: Break ──────────────────────────────────────── */}
      <LandingSection id="challenges">
        <SectionEyebrow>Break</SectionEyebrow>
        <SectionHeading>What happens when things break?</SectionHeading>
        <SectionBody>
          Introduce controlled failures and watch how they propagate. The Failure Lab runs deterministic simulations based on your actual architecture graph.
        </SectionBody>
        <BreakDemo />
      </LandingSection>

      {/* ── Section 4: Queries ──────────────────────────────────── */}
      <LandingSection style={{ background: "var(--surface)" }}>
        <SectionEyebrow>Evolve</SectionEyebrow>
        <SectionHeading>From questions to better architecture</SectionHeading>
        <SectionBody>
          A query attached to a component turns into a tracked discussion that drives an architecture improvement — and stays in the timeline forever.
        </SectionBody>
        <QueryDemo />
      </LandingSection>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section style={{ padding: "100px 40px", textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{
          fontFamily: "var(--font-head)", fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.15, marginBottom: 20,
        }}>
          Your next great system starts with a{" "}
          <span style={{ background: "linear-gradient(135deg, #55E6FF, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            shared canvas.
          </span>
        </h2>
        <p style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 36, lineHeight: 1.6 }}>
          No setup required. Start with a template or blank canvas.
        </p>
        <button
          onClick={() => setView("workspace")}
          style={{
            padding: "14px 32px",
            background: "linear-gradient(135deg, #55E6FF, #A78BFA)",
            border: "none", borderRadius: 8, color: "#090D16",
            fontSize: 16, fontWeight: 800, cursor: "pointer",
            fontFamily: "var(--font-head)",
            boxShadow: "0 8px 32px rgba(85,230,255,.3)",
          }}
        >
          Start Building Together
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{ padding: "24px 40px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "var(--text-3)" }}>
          BITverse — Build It Together · Design systems. Challenge assumptions. Build better together.
        </p>
      </footer>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, userSelect: "none" }}>
      <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
        <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#55E6FF" strokeWidth="1.5" fill="none"/>
        <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" stroke="#A78BFA" strokeWidth="1" fill="rgba(85,230,255,.08)"/>
        <circle cx="11" cy="11" r="2" fill="#55E6FF"/>
      </svg>
      <span style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--font-head)", letterSpacing: "-.02em" }}>
        <span style={{ color: "var(--cyan)" }}>BIT</span><span style={{ color: "var(--text)" }}>verse</span>
      </span>
    </div>
  );
}

function NavLinks() {
  const links = ["Product", "How it works", "Challenges"];
  return (
    <div style={{ display: "flex", gap: 28 }}>
      {links.map((l) => (
        <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
          style={{ fontSize: 13, color: "var(--text-2)", textDecoration: "none", transition: "color .15s" }}
        >
          {l}
        </a>
      ))}
    </div>
  );
}

function LandingSection({ id, children, style }: { id?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section id={id} style={{ padding: "80px 80px", maxWidth: 1280, margin: "0 auto", ...style }}>
      {children}
    </section>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--cyan)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.15, marginBottom: 14 }}>
      {children}
    </h2>
  );
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 560 }}>{children}</p>
  );
}

function FeatureCard({ icon, color, title, body }: { icon: React.ReactNode; color: string; title: string; body: string }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 20,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: `${color}15`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, marginBottom: 12,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function ComponentShowcase({ kind, metric, status, color }: { kind: string; metric: string; status: string; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", background: "var(--bg)",
      border: `1px solid ${color}25`, borderRadius: 8,
    }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{kind}</div>
        <div style={{ fontSize: 10, color, fontFamily: "var(--font-mono)", marginTop: 2 }}>{metric}</div>
      </div>
      <span style={{ fontSize: 9, color: "#57E3A0", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{status.toUpperCase()}</span>
    </div>
  );
}

function BreakDemo() {
  const [state, setState] = useState<"healthy" | "failing" | "recovered">("healthy");

  return (
    <div style={{ marginTop: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {(["healthy", "failing", "recovered"] as const).map((s) => (
          <button key={s} onClick={() => setState(s)} style={{
            padding: "5px 14px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600,
            background: state === s ? (s === "failing" ? "#FF667D" : s === "healthy" ? "#57E3A015" : "#55E6FF15") : "var(--surface-2)",
            border: `1px solid ${state === s ? (s === "failing" ? "#FF667D" : s === "healthy" ? "#57E3A0" : "#55E6FF") : "var(--border)"}`,
            color: state === s ? (s === "failing" ? "var(--bg)" : s === "healthy" ? "#57E3A0" : "var(--cyan)") : "var(--text-3)",
          }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "Web Client", affected: false },
          { label: "API Gateway", affected: state === "failing" },
          { label: "Order Service", affected: state === "failing" },
          { label: "PostgreSQL Database", affected: state !== "healthy" },
          { label: "Redis Cache", affected: false },
        ].map(({ label, affected }) => {
          const isRecovered = state === "recovered" && label === "PostgreSQL Database";
          const nodeState = isRecovered ? "degraded" : affected ? "down" : "healthy";
          const c = nodeState === "healthy" ? "#57E3A0" : nodeState === "degraded" ? "#FFBF69" : "#FF667D";
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: `${c}08`, border: `1px solid ${c}20`, borderRadius: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: `0 0 5px ${c}`, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text)", flex: 1 }}>{label}</span>
              <span style={{ fontSize: 9, color: c, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{nodeState.toUpperCase()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueryDemo() {
  return (
    <div style={{ marginTop: 32, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, maxWidth: 600 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#FFBF69", marginBottom: 12 }}>
        ⚠ Open Query · PostgreSQL Database
      </div>
      {[
        { author: "Aanya", color: "#A78BFA", text: "Is this database a single point of failure?", isQuery: true },
        { author: "Aanya", color: "#A78BFA", text: "If the primary instance becomes unavailable, the entire checkout flow may stop.", isQuery: false },
        { author: "Rohan", color: "#57E3A0", text: "We could introduce a read replica and a failover strategy.", isQuery: false },
        { author: "You", color: "#55E6FF", text: "Failover design added to the architecture. Closing this query.", isQuery: false },
      ].map((m, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${m.color}20`, border: `1.5px solid ${m.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: m.color, flexShrink: 0 }}>
            {m.author.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: m.color, marginRight: 6 }}>{m.author}</span>
            <span style={{ fontSize: 11, color: "var(--text-2)" }}>{m.text}</span>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 10, padding: "6px 10px", background: "rgba(87,227,160,.08)", border: "1px solid rgba(87,227,160,.2)", borderRadius: 6, fontSize: 10, color: "#57E3A0", fontWeight: 600 }}>
        ✓ Resolved — Failover design added to the architecture
      </div>
    </div>
  );
}
