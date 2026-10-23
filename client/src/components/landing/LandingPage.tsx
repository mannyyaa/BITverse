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
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const openWorkspace = () => setView("workspace");
  const openFailureLab = () => {
    setFailureLabOpen(true);
    setView("workspace");
  };

  // Scroll reveal refs for each section
  const revealFeatures = useScrollReveal<HTMLDivElement>(0.08);
  const revealWorkflow = useScrollReveal<HTMLDivElement>(0.08);
  const revealFailure  = useScrollReveal<HTMLDivElement>(0.08);
  const revealCta      = useScrollReveal<HTMLDivElement>(0.1);

  // Parallax float delta for a few hero doodles
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
          <button className="bv-nav-signin" onClick={() => setView("dashboard")}>Open dashboard</button>
          <button className="bv-button bv-button--nav" onClick={() => setView("workspace")}>
            Start building <ArrowUpRight size={15} />
          </button>
        </div>
      </nav>

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
          </defs>
          <g fill="none" stroke="url(#bv-hero-spectrum)" strokeLinecap="round">
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

        {/* ── Hero doodles (purely decorative) ── */}
        <FloatySticky
          text="What if we tried this?"
          color="yellow"
          emoji="💡"
          className="bv-floaty-sticky--float"
          style={{
            top: "18%", left: "3%",
            transform: `rotate(-2.5deg) translateY(${scrollY * 0.06}px)`,
            "--rot": "-2.5deg",
          } as React.CSSProperties}
        />
        <FloatySticky
          text="SPOF?"
          color="coral"
          emoji="⚠️"
          className="bv-floaty-sticky--float-alt"
          style={{
            bottom: "22%", left: "1.5%",
            transform: `rotate(2deg) translateY(${-scrollY * 0.04}px)`,
            "--rot": "2deg",
          } as React.CSSProperties}
        />
        <FloatySticky
          text="Let's test it!"
          color="mint"
          emoji="🧪"
          className="bv-floaty-sticky--float-slow"
          style={{
            top: "12%", right: "2%",
            transform: `rotate(1.5deg) translateY(${scrollY * 0.05}px)`,
            "--rot": "1.5deg",
          } as React.CSSProperties}
        />

        <AnnotationLabel
          text="aha moment"
          style={{ position: "absolute", top: "33%", left: "6%", transform: "rotate(-3deg)" }}
        />
        <AnnotationLabel
          text="IDEA!"
          style={{ position: "absolute", bottom: "30%", right: "4%", transform: "rotate(2deg)", color: "#dd9a6f", background: "rgba(221,154,111,.1)", borderColor: "rgba(221,154,111,.35)" }}
        />
        <AnnotationLabel
          text="let's connect these"
          style={{ position: "absolute", top: "58%", left: "3.5%", transform: "rotate(1deg)" }}
        />

        <SquiggleArrow
          style={{ position: "absolute", top: "28%", left: "43%", color: "#8975d8", opacity: 0.45, transform: "rotate(20deg)" }}
        />
        <SquiggleArrow
          style={{ position: "absolute", bottom: "26%", right: "6%", color: "#78a08a", opacity: 0.4, transform: "rotate(-30deg) scaleX(-1)" }}
        />
        <StarDoodle
          style={{ position: "absolute", top: "16%", left: "38%", color: "#dd9a6f", opacity: 0.6, transform: `translateY(${scrollY * -0.03}px)` }}
        />
        <StarDoodle
          style={{ position: "absolute", bottom: "34%", left: "28%", color: "#8975d8", opacity: 0.5 }}
        />
        <SparkDoodle
          style={{ position: "absolute", top: "42%", left: "48%", color: "#6ba4c5", opacity: 0.55 }}
        />
        <SparkDoodle
          style={{ position: "absolute", top: "22%", right: "9%", color: "#dd9a6f", opacity: 0.6 }}
        />
        <DotCluster
          style={{ position: "absolute", top: "66%", left: "46%", color: "#8975d8", opacity: 0.4 }}
        />
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

        <div className="bv-hero-visual">
          <div className="bv-visual-glow" aria-hidden="true" />
          <div className="bv-visual-label bv-visual-label--top"><span className="bv-label-icon"><Activity size={14} /></span><span><strong>Pulse Commerce</strong><small>Architecture map</small></span><span className="bv-label-status">DEMO</span></div>
          <div className="bv-preview-card"><ArchPreview /></div>
          {/* Decorative arrow pointing at the preview */}
          <SquiggleArrow
            style={{ position: "absolute", top: "-18px", left: "18%", color: "#8975d8", opacity: 0.5, transform: "rotate(45deg)" }}
          />
          <FloatySticky
            text="dependencies mapped!"
            color="lavender"
            style={{ position: "absolute", top: "8%", right: "-14px", zIndex: 6, transform: "rotate(2.5deg)" }}
          />
          <div className="bv-floating-note bv-floating-note--top"><span className="bv-note-icon bv-note-icon--blue"><GitBranch size={15} /></span><span><strong>Dependencies mapped</strong><small>Every connection tells a story</small></span></div>
          <div className="bv-floating-note bv-floating-note--bottom"><span className="bv-note-icon bv-note-icon--peach"><Zap size={15} /></span><span><strong>Ready to stress-test</strong><small>Try a failure scenario ↗</small></span></div>
        </div>

        <a className="bv-scroll-cue" href="#features"><span /> Scroll to explore</a>
      </section>

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

      <section className="bv-workflow-ribbon" aria-label="The BITverse workflow">
        <div className="bv-ribbon-intro">ONE ARCHITECTURE.<br /><span>FOUR WAYS TO MAKE IT BETTER.</span></div>
        {FEATURES.map((feature, index) => (
          <a className={`bv-ribbon-step bv-ribbon-step--${feature.color}`} href={index === 2 ? "#failure-lab" : "#features"} key={feature.number}>
            <span className="bv-ribbon-number">{feature.number}</span><span className="bv-ribbon-label">{feature.tag}</span><ArrowUpRight size={14} className="bv-ribbon-arrow" />
          </a>
        ))}
      </section>

      <section className="bv-section bv-section--features" id="features">
        <div className="bv-section-head bv-reveal" ref={revealFeatures}>
          <div style={{ position: "relative" }}>
            <span className="bv-section-kicker">A better way to think in systems</span>
            <h2>From scattered ideas<br />to <em>systems that make sense.</em></h2>
            {/* Marker underline under the heading */}
            <MarkerUnderline style={{ position: "absolute", bottom: -6, left: 0, color: "#8975d8", width: 120 }} />
            {/* Small star accent */}
            <StarDoodle style={{ position: "absolute", top: -10, right: "22%", color: "#dd9a6f", opacity: 0.6 }} />
          </div>
          <p>Architecture should be more than a diagram. It should be a place where your team can reason, challenge, and improve the design together.</p>
        </div>

        <div className="bv-feature-grid">
          {FEATURES.map((feature, i) => (
            <article className={`bv-feature-card bv-feature-card--${feature.color} bv-reveal bv-reveal--d${(i + 1) as 1 | 2 | 3 | 4}`} key={feature.number}>
              <div className="bv-feature-card-top"><span className="bv-feature-icon">{feature.icon}</span><span className="bv-feature-number">{feature.number}</span></div>
              <span className="bv-feature-tag">{feature.tag}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="bv-feature-underline" />
            </article>
          ))}
        </div>
      </section>

      <section className="bv-section bv-section--workflow" id="workflow">
        <div className="bv-workflow-copy bv-reveal" ref={revealWorkflow}>
          <span className="bv-section-kicker">Small steps. Better architecture.</span>
          <h2>Think clearly.<br /><em>Build resiliently.</em></h2>
          {/* Wobbly underline under "Build resiliently" */}
          <WobblyUnderline style={{ display: "block", color: "#78a08a", opacity: 0.7, marginTop: 2, width: 160 }} />
          <p>Keep the design and the reasoning behind it in the same place. No bouncing between a diagram, a chat thread, and a separate incident doc.</p>
          <button className="bv-button bv-button--primary" onClick={openWorkspace}>Explore the workspace <ArrowRight size={16} /></button>
        </div>
        <div className="bv-steps-list" style={{ position: "relative" }}>
          {/* Curved connector decoration between steps */}
          <CurvedConnector style={{ position: "absolute", left: -32, top: "28%", color: "#8975d8", opacity: 0.28, transform: "rotate(90deg)" }} />
          {STEPS.map((step, i) => (
            <div className={`bv-step bv-reveal bv-reveal--d${Math.min(i + 1, 4) as 1|2|3|4}`} key={step.number}>
              <span className="bv-step-number">{step.number}</span>
              <div className="bv-step-body"><h3>{step.title}</h3><p>{step.body}</p></div>
              <ArrowUpRight className="bv-step-arrow" size={16} />
            </div>
          ))}
        </div>
      </section>

      <section className="bv-failure-section" id="failure-lab">
        <div className="bv-failure-copy bv-reveal" ref={revealFailure}>
          <span className="bv-section-kicker bv-section-kicker--peach"><Zap size={13} /> THE FAILURE LAB</span>
          <h2>What if your<br /><em>database disappeared?</em></h2>
          <p>Don't wait for production to discover a single point of failure. Use controlled scenarios to explore blast radius, spot dependencies, and strengthen the design before it matters.</p>
          <button className="bv-button bv-button--dark" onClick={openFailureLab}>Run a what-if scenario <ArrowRight size={16} /></button>
          <span className="bv-failure-caption"><ShieldAlert size={14} /> Deterministic, graph-based demo simulations</span>
        </div>
        <div className="bv-failure-card bv-reveal bv-reveal--d2" aria-label="Illustrative database outage simulation preview" style={{ position: "relative" }}>
          {/* Sticky note peeking above the failure card */}
          <FloatySticky
            text="What's the blast radius?"
            color="coral"
            emoji="💥"
            style={{ position: "absolute", top: -48, right: 16, zIndex: 2 }}
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

      <section className="bv-final-cta bv-reveal" ref={revealCta}>
        <div className="bv-cta-decoration bv-cta-decoration--one" aria-hidden="true" />
        <div className="bv-cta-decoration bv-cta-decoration--two" aria-hidden="true" />
        {/* Small doodle cluster in the CTA */}
        <SparkDoodle style={{ position: "absolute", top: "18%", left: "8%", color: "#8975d8", opacity: 0.5 }} />
        <StarDoodle  style={{ position: "absolute", bottom: "22%", right: "7%", color: "#dd9a6f", opacity: 0.55 }} />
        <CircleDoodle style={{ position: "absolute", top: "12%", right: "18%", color: "#6ba4c5", opacity: 0.3 }} />
        <DotCluster  style={{ position: "absolute", bottom: "18%", left: "12%", color: "#78a08a", opacity: 0.45 }} />
        <span className="bv-section-kicker">YOUR NEXT SYSTEM STARTS HERE</span>
        <h2>Make the invisible<br /><em>architecture visible.</em></h2>
        <p>Open the canvas. Start with the idea. Leave with a stronger system.</p>
        <button className="bv-button bv-button--primary bv-button--cta" onClick={openWorkspace}>Build it together <ArrowRight size={16} /></button>
        <div className="bv-cta-annotation"><Sparkles size={13} /> A little clarity goes a long way.</div>
      </section>

      <footer className="bv-footer">
        <a className="bv-brand bv-brand--footer" href="#top"><span className="bv-brand-mark"><Layers3 size={17} /></span><span className="bv-brand-word"><strong>BIT</strong>verse</span></a>
        <span>Design systems. Challenge assumptions. Build better together.</span>
        <a className="bv-footer-top" href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
