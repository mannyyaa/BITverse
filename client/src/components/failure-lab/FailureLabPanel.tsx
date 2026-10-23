import { useEffect, useRef, useState } from "react";
import { X, Zap, Play, Pause, RotateCcw, AlertTriangle, ArrowRight } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useSimulationStore } from "@/store/simulationStore";
import { runScenario } from "@/engine/simulation/simulation";
import { toArchitectureGraph } from "@/lib/canvas";
import { formatElapsed } from "@/lib/id";
import { statusColor } from "@/lib/tokens";
import type { FailureScenario, NodeStatus } from "@/domain/types";

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   "var(--accent-green)",
  medium: "var(--accent-amber)",
  hard:   "var(--accent-red)",
};

export function FailureLabPanel() {
  const isOpen = useUIStore((s) => s.isFailureLabOpen);
  const setFailureLabOpen = useUIStore((s) => s.setFailureLabOpen);
  const close = () => setFailureLabOpen(false);
  const graph   = useWorkspaceStore((s) => s.workspace.graph);
  const scenarios = useWorkspaceStore((s) => s.workspace.scenarios);
  const addTimeline = useWorkspaceStore((s) => s.addTimelineEvent);

  const {
    phase, activeScenario, statuses, log,
    elapsedSeconds, startScenario, pauseScenario,
    resumeScenario, resetScenario, tickElapsed,
  } = useSimulationStore();

  const [view, setView] = useState<"pick" | "live" | "compare">("pick");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "running") {
      timerRef.current = setInterval(tickElapsed, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, tickElapsed]);

  const start = (scenario: FailureScenario) => {
    const result = runScenario(toArchitectureGraph(graph), scenario);
    startScenario(scenario, result);
    setView("live");
    addTimeline({
      kind: "simulation-started",
      description: `Failure scenario started: ${scenario.name}`,
      author: "You",
    });
  };

  const reset = () => {
    resetScenario();
    setView("pick");
  };

  if (!isOpen) return null;

  const impacted = Object.entries(statuses).filter(([, s]) => s !== "healthy");
  const healthy  = graph.nodes
    .filter((n): n is Extract<typeof n, { type: "architecture" }> => n.type === "architecture")
    .filter((n) => (statuses[n.id] ?? "healthy") === "healthy");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        background: "rgba(15,17,23,.4)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxHeight: "85vh",
          background: "var(--surface-0)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px 12px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface-1)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--r-md)",
                background: "rgba(214,48,49,.1)",
                border: "1px solid rgba(214,48,49,.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-red)",
              }}
            >
              <Zap size={15} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-head)",
                }}
              >
                Failure Lab
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                Simulate failures · discover weaknesses · improve resilience
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {phase !== "idle" && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: "var(--accent-red)",
                  background: "rgba(214,48,49,.08)",
                  border: "1px solid rgba(214,48,49,.2)",
                  padding: "2px 8px",
                  borderRadius: "var(--r-full)",
                }}
              >
                {formatElapsed(elapsedSeconds)}
              </span>
            )}
            <button
              onClick={close}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                display: "flex",
                padding: 3,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab bar (only when simulation is active) */}
        {phase !== "idle" && (
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--border)",
              padding: "0 18px",
              flexShrink: 0,
            }}
          >
            {(["pick", "live", "compare"] as const).map((v) => (
              <TabBtn
                key={v}
                label={v === "pick" ? "Scenarios" : v === "live" ? "Live Impact" : "Before / After"}
                active={view === v}
                onClick={() => setView(v)}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
          {/* SCENARIOS */}
          {view === "pick" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scenarios.map((s) => (
                <ScenarioCard
                  key={s.id}
                  scenario={s}
                  active={activeScenario?.id === s.id}
                  onStart={() => start(s)}
                />
              ))}
            </div>
          )}

          {/* LIVE IMPACT */}
          {view === "live" && activeScenario && (
            <>
              <div
                style={{
                  background: "rgba(214,48,49,.05)",
                  border: "1px solid rgba(214,48,49,.2)",
                  borderRadius: "var(--r-md)",
                  padding: "12px 14px",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 5,
                  }}
                >
                  <AlertTriangle size={13} color="var(--accent-red)" />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--accent-red)",
                    }}
                  >
                    {activeScenario.name}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 9,
                      color: "var(--text-tertiary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {DIFFICULTY_COLOR[activeScenario.difficulty] ? activeScenario.difficulty.toUpperCase() : ""}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {activeScenario.description}
                </p>
              </div>

              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Component Impact ({impacted.length} affected)
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {impacted.map(([nodeId, nodeStatus]) => {
                  const node    = graph.nodes.find((n) => n.id === nodeId);
                  const sColor  = statusColor(nodeStatus as NodeStatus);
                  const reason  = log.filter((l) => l.nodeId === nodeId).pop()?.reason;

                  return (
                    <div
                      key={nodeId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        background: "var(--surface-1)",
                        border: `1px solid color-mix(in srgb, ${sColor} 25%, transparent)`,
                        borderRadius: "var(--r-sm)",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: sColor,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          flex: 1,
                        }}
                      >
                        {node?.type === "architecture" ? node.label : nodeId}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: sColor,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {(nodeStatus as string).toUpperCase()}
                      </span>
                      {reason && (
                        <span
                          style={{
                            fontSize: 9,
                            color: "var(--text-tertiary)",
                            maxWidth: 140,
                            textAlign: "right",
                            lineHeight: 1.3,
                          }}
                        >
                          {reason}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                {phase === "running" ? (
                  <LabBtn icon={<Pause size={12} />} label="Pause" color="var(--accent-amber)" onClick={pauseScenario} />
                ) : (
                  <LabBtn icon={<Play size={12} />}  label="Resume" color="var(--accent-green)" onClick={resumeScenario} />
                )}
                <LabBtn icon={<RotateCcw size={12} />} label="Reset"   color="var(--text-secondary)" onClick={reset} />
                <LabBtn icon={<ArrowRight size={12} />} label="Compare" color="var(--accent-violet)" onClick={() => setView("compare")} />
              </div>
            </>
          )}

          {/* COMPARE */}
          {view === "compare" && activeScenario && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <SummaryCard
                  title="Affected"
                  value={impacted.length}
                  color="var(--accent-red)"
                  sub="degraded or down"
                />
                <SummaryCard
                  title="Healthy"
                  value={healthy.length}
                  color="var(--accent-green)"
                  sub="unaffected"
                />
              </div>

              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Recovery suggestions
              </div>
              <RecoverySuggestions kind={activeScenario.kind} />

              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                <LabBtn icon={<RotateCcw size={12} />} label="Reset"        color="var(--text-secondary)" onClick={reset} />
                <LabBtn icon={<Play size={12} />}       label="Rerun scenario" color="var(--accent-red)"  onClick={() => { start(activeScenario); }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── sub-components ─────────────────────────────────────────────────────── */

function ScenarioCard({
  scenario,
  active,
  onStart,
}: {
  scenario: FailureScenario;
  active: boolean;
  onStart: () => void;
}) {
  const dc = DIFFICULTY_COLOR[scenario.difficulty] ?? "var(--text-tertiary)";

  return (
    <div
      style={{
        border: `1px solid ${active ? "var(--accent-red)" : "var(--border)"}`,
        borderRadius: "var(--r-md)",
        padding: "12px 14px",
        background: active ? "rgba(214,48,49,.04)" : "var(--surface-1)",
        transition: "border-color var(--t-base), background var(--t-base)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-primary)",
              fontFamily: "var(--font-head)",
            }}
          >
            {scenario.name}
          </div>
          <span
            style={{
              fontSize: 9,
              color: dc,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {scenario.difficulty}
          </span>
        </div>
        <button
          onClick={onStart}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
            background: "var(--accent-red)",
            border: "none",
            borderRadius: "var(--r-sm)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-ui)",
            flexShrink: 0,
          }}
        >
          <Play size={10} />
          {active ? "Rerun" : "Start"}
        </button>
      </div>
      <p
        style={{
          fontSize: 11,
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          marginBottom: 5,
        }}
      >
        {scenario.description}
      </p>
      <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
        <span style={{ fontWeight: 600, color: "var(--accent-amber)" }}>Impact: </span>
        {scenario.impact}
      </div>
    </div>
  );
}

function RecoverySuggestions({ kind }: { kind: string }) {
  const map: Record<string, string[]> = {
    "database-outage":    ["Add a read replica with automatic failover", "Implement connection pooling", "Add Redis cache to reduce DB load", "Use circuit breakers in dependent services"],
    "traffic-spike":      ["Add a load balancer with horizontal scaling", "Implement rate limiting at the API Gateway", "Add a CDN to offload static assets", "Cache frequently-read data in Redis"],
    "network-partition":  ["Implement circuit breakers on service calls", "Add retry logic with exponential back-off", "Use a service mesh for resilient routing"],
    "service-failure":    ["Run redundant service instances behind a load balancer", "Implement health checks with auto-restart", "Decouple via message queue to absorb failures"],
  };
  const suggestions = map[kind] ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {suggestions.map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            padding: "7px 10px",
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-sm)",
          }}
        >
          <span
            style={{
              color: "var(--accent-green)",
              fontSize: 11,
              flexShrink: 0,
            }}
          >
            →
          </span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color,
  sub,
}: {
  title: string;
  value: number;
  color: string;
  sub: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
        borderRadius: "var(--r-md)",
        padding: "12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color,
          fontFamily: "var(--font-head)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginTop: 4,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 2 }}>
        {sub}
      </div>
    </div>
  );
}

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        background: "none",
        border: "none",
        borderBottom: `2px solid ${active ? "var(--accent-violet)" : "transparent"}`,
        color: active ? "var(--accent-violet)" : "var(--text-tertiary)",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
        letterSpacing: "0.03em",
        marginBottom: -1,
        transition: "color var(--t-base), border-color var(--t-base)",
      }}
    >
      {label}
    </button>
  );
}

function LabBtn({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
        borderRadius: "var(--r-sm)",
        color,
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
