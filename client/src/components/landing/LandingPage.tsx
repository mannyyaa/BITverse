import { useState, useEffect } from "react";
import { ArrowRight, MessageCircle, TrendingUp, Users } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { ArchPreview } from "./ArchPreview";

export function LandingPage() {
  const setView = useUIStore((s) => s.setView);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface-0)",
        color: "var(--text-primary)",
        overflowX: "hidden",
      }}
    >
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          height: 52,
          background: scrolled ? "rgba(255,255,255,.9)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          display: "flex", alignItems: "center",
          padding: "0 40px", gap: 32,
          transition: "all 0.2s",
        }}
      >
        <NavLogo />
        <div style={{ flex: 1 }} />
        <NavLinks />
        <button
          onClick={() => setView("dashboard")}
          style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-ui)" }}
        >
          Sign in
        </button>
        <button
          onClick={() => setView("workspace")}
          style={{
            padding: "7px 18px",
            background: "var(--accent-violet)",
            border: "none", borderRadius: "var(--r-sm)",
            color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-ui)",
          }}
        >
          Start Building
        </button>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: 48,
          padding: "110px 80px 80px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* Left */}
        <div>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px",
              background: "rgba(108,92,231,.08)",
              border: "1px solid rgba(108,92,231,.2)",
              borderRadius: "var(--r-full)",
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "var(--accent-violet)",
              }}
            />
            <span
              style={{
                fontSize: 10, fontWeight: 700,
                color: "var(--accent-violet)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              The Collaborative System Design Lab
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "clamp(34px, 4.5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 18,
              color: "var(--text-primary)",
            }}
          >
            Great systems aren't drawn.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-cyan) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              They're built together.
            </span>
          </h1>

          <p
            style={{
              fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7,
              marginBottom: 30, maxWidth: 460,
            }}
          >
            Design software architectures on a shared canvas. Question every decision.
            Break your system safely. Build something more resilient — together.
          </p>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
            <button
              onClick={() => setView("workspace")}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px",
                background: "var(--accent-violet)",
                border: "none", borderRadius: "var(--r-md)",
                color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "var(--font-ui)",
                boxShadow: "0 4px 20px rgba(108,92,231,.3)",
              }}
            >
              Enter the Verse <ArrowRight size={15} />
            </button>
            <button
              onClick={() => setView("workspace")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "12px 20px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                color: "var(--text-secondary)", fontSize: 14,
                cursor: "pointer", fontFamily: "var(--font-ui)",
              }}
            >
              Explore a Live Architecture
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            One canvas.&nbsp; Shared ideas.&nbsp; Better systems.
          </p>
        </div>

        {/* Right: preview */}
        <ArchPreview />
      </section>

      {/* ── Section 1: Build Together ───────────────────────────────────── */}
      <LSection bg="var(--surface-1)">
        <Eyebrow color="var(--accent-violet)">Build</Eyebrow>
        <SectionHead>Build together, not in isolation</SectionHead>
        <SectionBody>
          A shared infinite canvas means your whole team sees the same architecture — live.
          No more emailing diagrams or misaligned whiteboard photos.
        </SectionBody>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 28 }}>
          <FCard icon={<Users size={18} />} color="var(--accent-violet)" title="Live presence" body="See teammates' cursors and edits in real time as they happen." />
          <FCard icon={<MessageCircle size={18} />} color="var(--accent-blue)" title="Component queries" body="Raise questions and track discussions directly on the nodes they relate to." />
          <FCard icon={<TrendingUp size={18} />} color="var(--accent-green)" title="Shared history" body="Every change is captured in the architecture timeline so decisions can be traced." />
        </div>
      </LSection>

      {/* ── Section 2: Every component ──────────────────────────────────── */}
      <LSection>
        <Eyebrow color="var(--accent-blue)">Discuss</Eyebrow>
        <SectionHead>Every component has a story</SectionHead>
        <SectionBody>
          Services, databases, queues, and connections are editable objects — not static boxes.
          Attach metadata, raise queries, assign decisions.
        </SectionBody>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginTop: 24 }}>
          {[
            { name: "API Gateway",   metric: "1.2k req/s", color: "var(--cat-application)" },
            { name: "PostgreSQL",    metric: "68% capacity", color: "var(--cat-data)"       },
            { name: "Redis Cache",   metric: "92% hit rate", color: "var(--cat-data)"       },
            { name: "Message Queue", metric: "1.2k msgs/s",  color: "var(--cat-messaging)"  },
          ].map((c) => (
            <div
              key={c.name}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                background: "var(--surface-1)",
                border: `1px solid color-mix(in srgb, ${c.color} 22%, transparent)`,
                borderRadius: "var(--r-md)",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</span>
              <span style={{ fontSize: 10, color: c.color, fontFamily: "var(--font-mono)", fontWeight: 500 }}>{c.metric}</span>
              <span style={{ fontSize: 9, color: "var(--accent-green)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>HEALTHY</span>
            </div>
          ))}
        </div>
      </LSection>

      {/* ── Section 3: Break ────────────────────────────────────────────── */}
      <LSection bg="var(--surface-1)">
        <Eyebrow color="var(--accent-red)">Break</Eyebrow>
        <SectionHead>What happens when things break?</SectionHead>
        <SectionBody>
          Introduce controlled failures and watch how they propagate through your architecture.
          The Failure Lab runs deterministic simulations based on your actual graph.
        </SectionBody>
        <BreakDemo />
      </LSection>

      {/* ── Section 4: Queries ──────────────────────────────────────────── */}
      <LSection>
        <Eyebrow color="var(--accent-green)">Evolve</Eyebrow>
        <SectionHead>From questions to better architecture</SectionHead>
        <SectionBody>
          A query attached to a component becomes a tracked discussion that drives an architecture
          improvement — and stays in the timeline forever.
        </SectionBody>
        <QueryDemo />
      </LSection>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 40px", textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "var(--font-head)",
            fontSize: "clamp(26px, 4vw, 42px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Your next great system starts with a{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            shared canvas.
          </span>
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>
          No setup required. Start with a template or blank canvas.
        </p>
        <button
          onClick={() => setView("workspace")}
          style={{
            padding: "13px 32px",
            background: "var(--accent-violet)",
            border: "none", borderRadius: "var(--r-md)",
            color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: "pointer", fontFamily: "var(--font-head)",
            boxShadow: "0 8px 28px rgba(108,92,231,.32)",
          }}
        >
          Start Building Together
        </button>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "20px 40px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
          BITverse — Build It Together · Design systems. Challenge assumptions. Build better together.
        </p>
      </footer>
    </div>
  );
}

/* ─── sub-components ─────────────────────────────────────────────────────── */

function NavLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, userSelect: "none" }}>
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden>
        <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="var(--accent-violet)" strokeWidth="1.5" fill="none" />
        <circle cx="11" cy="11" r="2" fill="var(--accent-violet)" />
      </svg>
      <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-head)", letterSpacing: "-0.02em" }}>
        <span style={{ color: "var(--accent-violet)" }}>BIT</span>verse
      </span>
    </div>
  );
}

function NavLinks() {
  return (
    <div style={{ display: "flex", gap: 26 }}>
      {["Product", "How it works", "Challenges"].map((l) => (
        <a
          key={l}
          href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
          style={{ fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" }}
        >
          {l}
        </a>
      ))}
    </div>
  );
}

function LSection({ bg, children }: { bg?: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: bg ?? "var(--surface-0)",
        padding: "72px 80px",
      }}
    >
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 12 }}>
      {children}
    </h2>
  );
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 540 }}>{children}</p>
  );
}

function FCard({ icon, color, title, body }: { icon: React.ReactNode; color: string; title: string; body: string }) {
  return (
    <div style={{ background: "var(--surface-0)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "18px 16px" }}>
      <div style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", background: `color-mix(in srgb, ${color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color, marginBottom: 10 }}>
        {icon}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function BreakDemo() {
  const [state, setState] = useState<"healthy" | "failing" | "recovered">("healthy");
  const nodes = [
    { label: "Web Client",           failing: false },
    { label: "API Gateway",          failing: state === "failing" },
    { label: "Order Service",        failing: state === "failing" },
    { label: "PostgreSQL Database",  failing: state !== "healthy" },
    { label: "Redis Cache",          failing: false },
  ];
  return (
    <div style={{ marginTop: 28, background: "var(--surface-0)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["healthy", "failing", "recovered"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            style={{
              padding: "4px 12px", borderRadius: "var(--r-sm)", fontSize: 11,
              cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600,
              background: state === s
                ? (s === "failing" ? "var(--accent-red)" : s === "healthy" ? "var(--accent-green)" : "var(--accent-violet)")
                : "var(--surface-2)",
              border: `1px solid ${state === s
                ? (s === "failing" ? "var(--accent-red)" : s === "healthy" ? "var(--accent-green)" : "var(--accent-violet)")
                : "var(--border)"}`,
              color: state === s ? "#fff" : "var(--text-secondary)",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {nodes.map(({ label, failing }) => {
          const col = failing ? "var(--accent-red)" : "var(--accent-green)";
          const status = failing ? "DOWN" : "HEALTHY";
          return (
            <div
              key={label}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px",
                background: `color-mix(in srgb, ${col} 6%, transparent)`,
                border: `1px solid color-mix(in srgb, ${col} 20%, transparent)`,
                borderRadius: "var(--r-sm)",
                transition: "all 0.2s",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: col, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-primary)", flex: 1 }}>{label}</span>
              <span style={{ fontSize: 9, color: col, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueryDemo() {
  const msgs = [
    { author: "Aanya", color: "var(--accent-violet)", text: "Is this database a single point of failure?" },
    { author: "Aanya", color: "var(--accent-violet)", text: "If the primary becomes unavailable, the entire checkout flow may stop." },
    { author: "Rohan", color: "var(--accent-green)",  text: "We could introduce a read replica and a failover strategy." },
    { author: "You",   color: "var(--accent-blue)",   text: "Failover design added to the architecture. Closing this." },
  ];
  return (
    <div style={{ marginTop: 28, background: "var(--surface-0)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "18px 20px", maxWidth: 560 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-amber)", marginBottom: 12 }}>
        ⚠ Open Query · PostgreSQL Database
      </div>
      {msgs.map((m, i) => (
        <div key={i} style={{ display: "flex", gap: 9, marginBottom: 9 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: `color-mix(in srgb, ${m.color} 15%, transparent)`, border: `1.5px solid color-mix(in srgb, ${m.color} 45%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: m.color, flexShrink: 0 }}>
            {m.author.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: m.color, marginRight: 5 }}>{m.author}</span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{m.text}</span>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 8, padding: "5px 9px", background: "rgba(0,184,148,.07)", border: "1px solid rgba(0,184,148,.2)", borderRadius: "var(--r-sm)", fontSize: 10, color: "var(--accent-green)", fontWeight: 600 }}>
        ✓ Resolved — Failover design added to the architecture
      </div>
    </div>
  );
}
