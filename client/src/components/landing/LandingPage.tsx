import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  GitBranch,
  History,
  Layers3,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArchPreview } from "./ArchPreview";
import {
  SquiggleArrow,
  StarDoodle,
  CircleDoodle,
  WobblyUnderline,
  SparkDoodle,
  CurvedConnector,
  MarkerUnderline,
  ArrowDiagonal,
  DotCluster,
  FloatySticky,
  AnnotationLabel,
} from "./Doodles";
import { useScrollReveal } from "@/lib/useScrollReveal";
import "./LandingPage.css";
import "./LandingMotionV6.css";
import "./Doodles.css";

type Feature = {
  number: string;
  title: string;
  description: string;
  color: "lilac" | "blue" | "peach" | "sage";
  icon: ReactNode;
  tag: string;
};

const FEATURES: Feature[] = [
  {
    number: "01",
    title: "Shape the system",
    description: "Turn boxes and arrows into an explorable architecture. Add services, connect dependencies, and give every component a purpose.",
    color: "lilac",
    icon: <Workflow size={19} strokeWidth={1.8} />,
    tag: "BUILD",
  },
  {
    number: "02",
    title: "Make decisions visible",
    description: "Attach questions to the exact component they concern. Keep trade-offs, replies, and open decisions close to the design.",
    color: "blue",
    icon: <MessageSquareText size={19} strokeWidth={1.8} />,
    tag: "DISCUSS",
  },
  {
    number: "03",
    title: "Pressure-test assumptions",
    description: "Explore database outages, traffic spikes, and service failures before they surprise you in production.",
    color: "peach",
    icon: <ShieldAlert size={19} strokeWidth={1.8} />,
    tag: "BREAK",
  },
  {
    number: "04",
    title: "Keep the reasoning",
    description: "Follow the path from an early sketch to a stronger architecture with a timeline of meaningful changes.",
    color: "sage",
    icon: <History size={19} strokeWidth={1.8} />,
    tag: "EVOLVE",
  },
];

const STEPS = [
  { number: "01", title: "Map it out", body: "Start with a template or a blank canvas. Place the building blocks." },
  { number: "02", title: "Ask better questions", body: "Turn uncertainty into a discussion attached to the architecture." },
  { number: "03", title: "Try to break it", body: "Run a what-if scenario and inspect which dependencies are affected." },
  { number: "04", title: "Make it stronger", body: "Capture the decision and evolve the design with intent." },
];

export function LandingPage() {
  const setView = useUIStore((s) => s.setView);
  const setFailureLabOpen = useUIStore((s) => s.setFailureLabOpen);
  const { isAuthenticated, user: authUser } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const openWorkspace = () => setView("workspace");
  const openFailureLab = () => {
    setFailureLabOpen(true);
    setView("workspace");
  };

  // Scroll reveal refs — only ref-attached elements use bv-reveal.
  // Individual cards / steps do NOT get bv-reveal because they have no ref
  // and would stay at opacity:0 forever.
  const revealFeatures = useScrollReveal<HTMLDivElement>(0.08);
  const revealWorkflow = useScrollReveal<HTMLDivElement>(0.08);
  const revealFailure  = useScrollReveal<HTMLDivElement>(0.08);
  const revealCta      = useScrollReveal<HTMLDivElement>(0.1);

  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
      setScrollY(window.scrollY);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
      const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        hero.style.setProperty("--bv-hero-motion-x", `${(x * 18).toFixed(1)}px`);
        hero.style.setProperty("--bv-hero-motion-y", `${(y * 12).toFixed(1)}px`);
      });
    };
    const resetPointer = () => {
      window.cancelAnimationFrame(frame);
      hero.style.setProperty("--bv-hero-motion-x", "0px");
      hero.style.setProperty("--bv-hero-motion-y", "0px");
    };

    hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerleave", resetPointer);
    return () => {
      window.cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", resetPointer);
    };
  }, []);

  return (
    <main className="bv-landing">
      <nav className={`bv-nav${scrolled ? " bv-nav--scrolled" : ""}`} aria-label="Main navigation">
        <a className="bv-brand" href="#top" aria-label="BITverse home">
          <span className="bv-brand-mark"><Layers3 size={19} strokeWidth={2.1} /></span>
          <span className="bv-brand-word"><strong>BIT</strong>verse</span>
          <span className="bv-brand-divider" />
          <span className="bv-brand-caption">Build it together</span>
        </a>

        <div className="bv-nav-links">
          <a href="#features">The canvas</a>
          <a href="#workflow">How it works</a>
          <a href="#failure-lab">Failure lab</a>
        </div>

        <div className="bv-nav-actions">
          {isAuthenticated ? (
            <button className="bv-nav-signin" onClick={() => setView("dashboard")}>
              {authUser?.name ?? "Dashboard"}
            </button>
          ) : (
            <button className="bv-nav-signin" onClick={() => setAuthModalOpen(true)}>Sign in</button>
          )}
          <button className="bv-button bv-button--nav" onClick={() => setView("workspace")}>
            Start building <ArrowUpRight size={15} />
          </button>
        </div>
      </nav>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* ─────────────────────── HERO ─────────────────────────────────────── */}
      <section className="bv-hero" id="top" ref={heroRef}>
        <div className="bv-hero-orb bv-hero-orb--one" aria-hidden="true" />
        <div className="bv-hero-orb bv-hero-orb--two" aria-hidden="true" />
        <svg className="bv-spectrum-flow bv-spectrum-flow--hero" viewBox="0 0 1510 470" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="bv-hero-spectrum" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8c5cf6" />
              <stop offset="22%" stopColor="#387df2" />
              <stop offset="42%" stopColor="#19c7df" />
              <stop offset="63%" stopColor="#df49c5" />
              <stop offset="82%" stopColor="#ff5d82" />
              <stop offset="100%" stopColor="#ff9857" />
            </linearGradient>
            <filter id="bv-hero-liquid-blur" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          <g fill="none" stroke="url(#bv-hero-spectrum)" strokeLinecap="round">
          <path className="bv-liquid-ribbon-glow" d="M -110 205 C 80 42, 245 44, 370 164 S 575 444, 744 366 S 1001 78, 1176 176 S 1418 414, 1610 250" strokeWidth="86" opacity=".20" filter="url(#bv-hero-liquid-blur)" />
          <path className="bv-liquid-ribbon-band" d="M -110 205 C 80 42, 245 44, 370 164 S 575 444, 744 366 S 1001 78, 1176 176 S 1418 414, 1610 250" strokeWidth="36" opacity=".36" />
          <path className="bv-liquid-ribbon-sheen" d="M -110 205 C 80 42, 245 44, 370 164 S 575 444, 744 366 S 1001 78, 1176 176 S 1418 414, 1610 250" strokeWidth="3.6" opacity=".68" />
          <path className="bv-liquid-ribbon-glow bv-liquid-ribbon-glow--secondary" d="M -90 390 C 135 440, 315 260, 500 320 S 705 445, 890 365 S 1152 230, 1352 310 S 1510 410, 1620 345" strokeWidth="66" opacity=".15" filter="url(#bv-hero-liquid-blur)" />
          <path className="bv-liquid-ribbon-band bv-liquid-ribbon-band--secondary" d="M -90 390 C 135 440, 315 260, 500 320 S 705 445, 890 365 S 1152 230, 1352 310 S 1510 410, 1620 345" strokeWidth="26" opacity=".28" />
          <path className="bv-liquid-ribbon-sheen bv-liquid-ribbon-sheen--secondary" d="M -90 390 C 135 440, 315 260, 500 320 S 705 445, 890 365 S 1152 230, 1352 310 S 1510 410, 1620 345" strokeWidth="2.8" opacity=".62" />
            {Array.from({ length: 13 }, (_, index) => (
              <path
                key={index}
                d="M -80 90 C 110 250 205 280 370 175 S 610 5 755 155 S 1010 340 1170 170 S 1350 30 1510 108"
                transform={`translate(0 ${index * 13})`}
                strokeWidth="3.2"
                opacity={0.82 - index * 0.025}
              />
            ))}
            <path d="M -80 90 C 110 250 205 280 370 175 S 610 5 755 155 S 1010 340 1170 170 S 1350 30 1510 108" transform="translate(0 78)" strokeWidth="22" opacity=".14" />
          </g>
        </svg>

        {/*
         * ── Hero doodle background layer ──────────────────────────────────
         * z-index: 0 keeps all decorations BEHIND hero-copy (z-index: 2)
         * and hero-visual (z-index: 1). pointer-events:none so they cannot
         * block clicks on text, buttons, or the preview card.
         * Doodles are positioned in the left/right margins and corners,
         * away from the centre columns where the text lives.
         */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {/* LEFT MARGIN — below the fold of the copy column */}
          <FloatySticky
            text="SPOF?"
            color="coral"
            emoji="⚠️"
            className="bv-floaty-sticky--float-alt"
            style={{
              bottom: "18%", left: "0.5%",
              transform: `rotate(2deg) translateY(${-scrollY * 0.03}px)`,
              "--rot": "2deg",
              maxWidth: 100,
            } as React.CSSProperties}
          />
          <AnnotationLabel
            text="aha moment"
            style={{ position: "absolute", top: "38%", left: "2%", transform: "rotate(-3deg)" }}
          />
          <AnnotationLabel
            text="let's connect these"
            style={{ position: "absolute", bottom: "32%", left: "2%", transform: "rotate(1deg)" }}
          />
          <SquiggleArrow
            style={{ position: "absolute", top: "30%", left: "3%", color: "#8975d8", opacity: 0.4, transform: "rotate(20deg)" }}
          />
          <StarDoodle
            style={{ position: "absolute", bottom: "38%", left: "5%", color: "#8975d8", opacity: 0.45 }}
          />
          <DotCluster
            style={{ position: "absolute", top: "60%", left: "4%", color: "#6ba4c5", opacity: 0.35 }}
          />

          {/* RIGHT MARGIN — outside the visual column */}
          <FloatySticky
            text="Let's test it!"
            color="mint"
            emoji="🧪"
            className="bv-floaty-sticky--float-slow"
            style={{
              top: "14%", right: "0.5%",
              transform: `rotate(1.5deg) translateY(${scrollY * 0.04}px)`,
              "--rot": "1.5deg",
              maxWidth: 120,
            } as React.CSSProperties}
          />
          <AnnotationLabel
            text="IDEA!"
            style={{ position: "absolute", bottom: "28%", right: "2%", transform: "rotate(2deg)", color: "#dd9a6f", background: "rgba(221,154,111,.1)", borderColor: "rgba(221,154,111,.35)" }}
          />
          <SquiggleArrow
            style={{ position: "absolute", bottom: "24%", right: "3%", color: "#78a08a", opacity: 0.35, transform: "rotate(-30deg) scaleX(-1)" }}
          />
          <SparkDoodle
            style={{ position: "absolute", top: "22%", right: "4%", color: "#dd9a6f", opacity: 0.5 }}
          />
          <StarDoodle
            style={{ position: "absolute", top: "15%", right: "8%", color: "#dd9a6f", opacity: 0.5, transform: `translateY(${scrollY * -0.02}px)` }}
          />

          {/* TOP / BOTTOM EDGES — far from the grid columns */}
          <SparkDoodle
            style={{ position: "absolute", top: "8%", left: "14%", color: "#8975d8", opacity: 0.4 }}
          />
          <SparkDoodle
            style={{ position: "absolute", bottom: "8%", right: "14%", color: "#6ba4c5", opacity: 0.35 }}
          />
        </div>

        {/* ── Hero copy (z-index 2 via .bv-hero-copy in LandingPage.css) ── */}
        <div className="bv-hero-copy">
          <div className="bv-eyebrow bv-eyebrow--hero"><span className="bv-eyebrow-spark"><Sparkles size={13} /></span> THE SYSTEM DESIGN WORKSPACE</div>
          <h1>Architecture is a team <span>sport.</span></h1>
          <p className="bv-hero-lede">
            Great systems come from better conversations. Sketch the architecture, question the decisions,
            and see how it holds up when things go wrong.
          </p>
          <div className="bv-hero-actions">
            <button className="bv-button bv-button--primary" onClick={openWorkspace}>
              Enter the canvas <ArrowRight size={16} />
            </button>
            <a className="bv-button bv-button--quiet" href="#workflow">
              <span className="bv-play-icon"><ArrowDownRight size={15} /></span> See how it works
            </a>
          </div>
          <div className="bv-hero-proof">
            <div className="bv-proof-avatars" aria-hidden="true">
              <span className="bv-proof-avatar bv-proof-avatar--lilac">A</span>
              <span className="bv-proof-avatar bv-proof-avatar--blue">R</span>
              <span className="bv-proof-avatar bv-proof-avatar--sage">Y</span>
              <span className="bv-proof-avatar bv-proof-avatar--peach"><Users size={12} /></span>
            </div>
            <div className="bv-proof-copy"><strong>From first sketch to failure test</strong><span>One space for the whole design journey.</span></div>
          </div>
          <div className="bv-hero-footnote"><span className="bv-live-dot" /> Interactive prototype <span className="bv-footnote-separator">·</span> No setup required</div>
        </div>

        {/* ── Hero visual (z-index 1 via .bv-hero-visual in LandingPage.css) ── */}
        <div className="bv-hero-visual">
          <div className="bv-visual-glow" aria-hidden="true" />
          <div className="bv-visual-label bv-visual-label--top">
            <span className="bv-label-icon"><Activity size={14} /></span>
            <span><strong>Pulse Commerce</strong><small>Architecture map</small></span>
            <span className="bv-label-status">DEMO</span>
          </div>
          <div className="bv-preview-card"><ArchPreview /></div>
          {/* Decorative arrow pointing at the preview */}
          <SquiggleArrow
            aria-hidden="true"
            style={{ position: "absolute", top: "-14px", left: "22%", color: "#8975d8", opacity: 0.45, transform: "rotate(45deg)", pointerEvents: "none" }}
          />
          <div className="bv-floating-note bv-floating-note--top"><span className="bv-note-icon bv-note-icon--blue"><GitBranch size={15} /></span><span><strong>Dependencies mapped</strong><small>Every connection tells a story</small></span></div>
          <div className="bv-floating-note bv-floating-note--bottom"><span className="bv-note-icon bv-note-icon--peach"><Zap size={15} /></span><span><strong>Ready to stress-test</strong><small>Try a failure scenario ↗</small></span></div>
        </div>

        <a className="bv-scroll-cue" href="#features"><span /> Scroll to explore</a>
      </section>

      {/* ─────────────────────── SPECTRUM BRIDGE ──────────────────────────── */}
      <div className="bv-spectrum-bridge" aria-hidden="true">
        <svg viewBox="0 0 1600 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="bv-bridge-spectrum" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff5f8f" />
              <stop offset="24%" stopColor="#ff8d55" />
              <stop offset="44%" stopColor="#df4fc8" />
              <stop offset="66%" stopColor="#8b62f5" />
              <stop offset="84%" stopColor="#3a9bf3" />
              <stop offset="100%" stopColor="#23c9d9" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#bv-bridge-spectrum)" strokeLinecap="round">
            {Array.from({ length: 13 }, (_, index) => (
              <path
                key={index}
                d="M -40 48 C 145 118 255 110 405 62 S 655 -6 805 57 S 1065 132 1220 68 S 1450 2 1640 72"
                transform={`translate(0 ${(index - 6) * 6})`}
                strokeWidth="2.1"
                opacity={0.9 - Math.abs(index - 6) * 0.045}
              />
            ))}
            <path d="M -40 48 C 145 118 255 110 405 62 S 655 -6 805 57 S 1065 132 1220 68 S 1450 2 1640 72" strokeWidth="15" opacity=".12" />
          </g>
        </svg>
      </div>

      {/* ─────────────────────── WORKFLOW RIBBON ──────────────────────────── */}
      <section className="bv-workflow-ribbon" aria-label="The BITverse workflow">
        <div className="bv-ribbon-intro">ONE ARCHITECTURE.<br /><span>FOUR WAYS TO MAKE IT BETTER.</span></div>
        {FEATURES.map((feature, index) => (
          <a className={`bv-ribbon-step bv-ribbon-step--${feature.color}`} href={index === 2 ? "#failure-lab" : "#features"} key={feature.number}>
            <span className="bv-ribbon-number">{feature.number}</span><span className="bv-ribbon-label">{feature.tag}</span><ArrowUpRight size={14} className="bv-ribbon-arrow" />
          </a>
        ))}
      </section>

      {/* ─────────────────────── FEATURES ────────────────────────────────── */}
      <section className="bv-section bv-section--features" id="features">
        {/*
         * bv-reveal is ONLY on this ref-attached wrapper.
         * The cards below have NO bv-reveal — they are always visible.
         * A section-level reveal is sufficient visual polish.
         */}
        <div className="bv-section-head bv-reveal" ref={revealFeatures}>
          <div style={{ position: "relative" }}>
            <span className="bv-section-kicker">A better way to think in systems</span>
            <h2>From scattered ideas<br />to <em>systems that make sense.</em></h2>
            <MarkerUnderline style={{ position: "absolute", bottom: -6, left: 0, color: "#8975d8", width: 120 }} />
            <StarDoodle style={{ position: "absolute", top: -10, right: "22%", color: "#dd9a6f", opacity: 0.6 }} />
          </div>
          <p>Architecture should be more than a diagram. It should be a place where your team can reason, challenge, and improve the design together.</p>
        </div>

        <div className="bv-feature-grid">
          {FEATURES.map((feature) => (
            /* NO bv-reveal on individual cards — they'd be invisible forever */
            <article className={`bv-feature-card bv-feature-card--${feature.color}`} key={feature.number}>
              <div className="bv-feature-card-top"><span className="bv-feature-icon">{feature.icon}</span><span className="bv-feature-number">{feature.number}</span></div>
              <span className="bv-feature-tag">{feature.tag}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="bv-feature-underline" />
            </article>
          ))}
        </div>
      </section>

      {/* ─────────────────────── WORKFLOW / HOW IT WORKS ──────────────────── */}
      <section className="bv-section bv-section--workflow" id="workflow">
        {/* ── Decorative background layer ── */}
        <div className="bv-workflow-bg" aria-hidden="true">
          {/* Large faint dot grid via CSS — see LandingPage.css */}
          {/* Floating numbered step "chips" as SVG shapes in the bg */}
          <svg className="bv-workflow-bg-svg" viewBox="0 0 900 520" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Meandering connector path linking step positions */}
            <path
              d="M 60 120 C 120 80, 200 200, 280 160 C 360 120, 400 260, 480 240 C 560 220, 620 340, 700 300 C 760 270, 820 340, 860 320"
              stroke="url(#wf-path-grad)" strokeWidth="1.8" strokeDasharray="6 5" strokeLinecap="round" opacity="0.55"
            />
            {/* Step nodes on the path */}
            <circle cx="60"  cy="120" r="20" fill="url(#wf-node-a)" opacity="0.18" />
            <circle cx="280" cy="160" r="20" fill="url(#wf-node-b)" opacity="0.14" />
            <circle cx="480" cy="240" r="20" fill="url(#wf-node-c)" opacity="0.14" />
            <circle cx="700" cy="300" r="20" fill="url(#wf-node-d)" opacity="0.14" />
            {/* Large background ellipses for depth */}
            <ellipse cx="760" cy="100" rx="220" ry="140" fill="url(#wf-orb-right)" opacity="0.08" />
            <ellipse cx="100" cy="430" rx="160" ry="100" fill="url(#wf-orb-left)"  opacity="0.08" />
            {/* Subtle grid lines */}
            {Array.from({ length: 7 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 80} x2="900" y2={i * 80}
                stroke="#8975d8" strokeWidth="0.4" opacity="0.06" />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="520"
                stroke="#8975d8" strokeWidth="0.4" opacity="0.06" />
            ))}
            <defs>
              <linearGradient id="wf-path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#8975d8" />
                <stop offset="50%"  stopColor="#6ba4c5" />
                <stop offset="100%" stopColor="#78a08a" />
              </linearGradient>
              <radialGradient id="wf-node-a"><stop stopColor="#8975d8" /></radialGradient>
              <radialGradient id="wf-node-b"><stop stopColor="#6ba4c5" /></radialGradient>
              <radialGradient id="wf-node-c"><stop stopColor="#dd9a6f" /></radialGradient>
              <radialGradient id="wf-node-d"><stop stopColor="#78a08a" /></radialGradient>
              <radialGradient id="wf-orb-right" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%"   stopColor="#8975d8" />
                <stop offset="100%" stopColor="#8975d8" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="wf-orb-left" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%"   stopColor="#78a08a" />
                <stop offset="100%" stopColor="#78a08a" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="bv-workflow-copy bv-reveal" ref={revealWorkflow}>
          <span className="bv-section-kicker">Small steps. Better architecture.</span>
          <h2>Think clearly.<br /><em>Build resiliently.</em></h2>
          <WobblyUnderline style={{ display: "block", color: "#78a08a", opacity: 0.7, marginTop: 2, width: 160 }} />
          <p>Keep the design and the reasoning behind it in the same place. No bouncing between a diagram, a chat thread, and a separate incident doc.</p>
          <button className="bv-button bv-button--primary" onClick={openWorkspace}>Explore the workspace <ArrowRight size={16} /></button>
        </div>
        <div className="bv-steps-list" style={{ position: "relative" }}>
          <CurvedConnector style={{ position: "absolute", left: -32, top: "28%", color: "#8975d8", opacity: 0.28, transform: "rotate(90deg)", pointerEvents: "none" }} />
          {STEPS.map((step) => (
            <div className="bv-step" key={step.number}>
              <span className="bv-step-number">{step.number}</span>
              <div className="bv-step-body"><h3>{step.title}</h3><p>{step.body}</p></div>
              <ArrowUpRight className="bv-step-arrow" size={16} />
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────── FAILURE LAB ─────────────────────────────── */}
      <section className="bv-failure-section" id="failure-lab">
        {/* ── Decorative background layer ── */}
        <div className="bv-failure-bg" aria-hidden="true">
          <svg className="bv-failure-bg-svg" viewBox="0 0 900 480" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Pulse rings radiating from a centre point — evokes an alert signal */}
            <circle cx="650" cy="240" r="60"  stroke="#cf737a" strokeWidth="1"   opacity="0.12" />
            <circle cx="650" cy="240" r="110" stroke="#cf737a" strokeWidth="0.8" opacity="0.08" />
            <circle cx="650" cy="240" r="165" stroke="#cf737a" strokeWidth="0.6" opacity="0.06" />
            <circle cx="650" cy="240" r="230" stroke="#d69a6f" strokeWidth="0.5" opacity="0.05" />
            {/* Jagged "severed" path across the middle */}
            <path
              d="M 0 240 L 120 240 L 155 190 L 195 290 L 230 200 L 265 270 L 300 240 L 900 240"
              stroke="url(#fl-sever-grad)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.35" strokeLinecap="round"
            />
            {/* Three status node blobs */}
            <circle cx="180" cy="180" r="36" fill="url(#fl-blob-green)"  opacity="0.12" />
            <circle cx="380" cy="290" r="28" fill="url(#fl-blob-amber)"  opacity="0.14" />
            <circle cx="560" cy="160" r="44" fill="url(#fl-blob-red)"    opacity="0.12" />
            {/* Faint diagonal grid */}
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`d${i}`}
                x1={i * 80 - 80} y1="0" x2={i * 80 + 480} y2="480"
                stroke="#cf737a" strokeWidth="0.35" opacity="0.05"
              />
            ))}
            <defs>
              <linearGradient id="fl-sever-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#78a08a" />
                <stop offset="45%"  stopColor="#d69a6f" />
                <stop offset="100%" stopColor="#cf737a" />
              </linearGradient>
              <radialGradient id="fl-blob-green" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#78a08a" />
                <stop offset="100%" stopColor="#78a08a" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="fl-blob-amber" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#d69a6f" />
                <stop offset="100%" stopColor="#d69a6f" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="fl-blob-red" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#cf737a" />
                <stop offset="100%" stopColor="#cf737a" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="bv-failure-copy bv-reveal" ref={revealFailure}>
          <span className="bv-section-kicker bv-section-kicker--peach"><Zap size={13} /> THE FAILURE LAB</span>
          <h2>What if your<br /><em>database disappeared?</em></h2>
          <p>Don't wait for production to discover a single point of failure. Use controlled scenarios to explore blast radius, spot dependencies, and strengthen the design before it matters.</p>
          <button className="bv-button bv-button--dark" onClick={openFailureLab}>Run a what-if scenario <ArrowRight size={16} /></button>
          <span className="bv-failure-caption"><ShieldAlert size={14} /> Deterministic, graph-based demo simulations</span>
        </div>
        <div className="bv-failure-card" aria-label="Illustrative database outage simulation preview" style={{ position: "relative" }}>
          <FloatySticky
            text="What's the blast radius?"
            color="coral"
            emoji="💥"
            style={{ position: "absolute", top: -48, right: 16, zIndex: 2, pointerEvents: "none" }}
          />
          <ArrowDiagonal style={{ position: "absolute", top: -30, right: 148, color: "#dd9a6f", opacity: 0.5 }} />
          <div className="bv-failure-card-head"><span className="bv-failure-pulse" /> SIMULATION PREVIEW <span className="bv-failure-time">00:03.4</span></div>
          <div className="bv-scenario-title"><span className="bv-scenario-icon"><ShieldAlert size={18} /></span><span><strong>Primary database outage</strong><small>What happens if PostgreSQL goes down?</small></span><span className="bv-scenario-badge">WHAT IF</span></div>
          <div className="bv-scenario-nodes">
            <div className="bv-scenario-node bv-scenario-node--healthy"><span className="bv-scenario-dot" /><span>Web client</span><small>Healthy</small></div>
            <div className="bv-scenario-connector"><span /></div>
            <div className="bv-scenario-node bv-scenario-node--warning"><span className="bv-scenario-dot" /><span>Order service</span><small>Degraded</small></div>
            <div className="bv-scenario-connector bv-scenario-connector--broken"><span /></div>
            <div className="bv-scenario-node bv-scenario-node--down"><span className="bv-scenario-dot" /><span>PostgreSQL</span><small>Down</small></div>
          </div>
          <div className="bv-scenario-summary"><span className="bv-summary-icon"><Activity size={14} /></span><span><strong>2 dependent components affected</strong><small>Blast radius identified in the graph</small></span><ArrowUpRight size={15} /></div>
        </div>
      </section>

      {/* ─────────────────────── FINAL CTA ───────────────────────────────── */}
      <section className="bv-final-cta bv-reveal" ref={revealCta} style={{ position: "relative" }}>
        <div className="bv-cta-decoration bv-cta-decoration--one" aria-hidden="true" />
        <div className="bv-cta-decoration bv-cta-decoration--two" aria-hidden="true" />
        {/* Small doodle cluster — in corners away from the centred text */}
        <SparkDoodle  aria-hidden style={{ position: "absolute", top: "18%",    left: "6%",   color: "#8975d8", opacity: 0.45, pointerEvents: "none" }} />
        <StarDoodle   aria-hidden style={{ position: "absolute", bottom: "20%", right: "6%",  color: "#dd9a6f", opacity: 0.5,  pointerEvents: "none" }} />
        <CircleDoodle aria-hidden style={{ position: "absolute", top: "10%",    right: "16%", color: "#6ba4c5", opacity: 0.28, pointerEvents: "none" }} />
        <DotCluster   aria-hidden style={{ position: "absolute", bottom: "16%", left: "10%",  color: "#78a08a", opacity: 0.4,  pointerEvents: "none" }} />
        <span className="bv-section-kicker">YOUR NEXT SYSTEM STARTS HERE</span>
        <h2>Make the invisible<br /><em>architecture visible.</em></h2>
        <p>Open the canvas. Start with the idea. Leave with a stronger system.</p>
        <button className="bv-button bv-button--primary bv-button--cta" onClick={openWorkspace}>Build it together <ArrowRight size={16} /></button>
        <div className="bv-cta-annotation"><Sparkles size={13} /> A little clarity goes a long way.</div>
      </section>

      {/* ─────────────────────── FOOTER ──────────────────────────────────── */}
      <footer className="bv-footer">
        <a className="bv-brand bv-brand--footer" href="#top"><span className="bv-brand-mark"><Layers3 size={17} /></span><span className="bv-brand-word"><strong>BIT</strong>verse</span></a>
        <span>Design systems. Challenge assumptions. Build better together.</span>
        <a className="bv-footer-top" href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
