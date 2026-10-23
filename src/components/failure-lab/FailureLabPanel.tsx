import { useEffect, useRef, useState } from "react";
import { X, Zap, Play, Pause, RotateCcw, ChevronRight, AlertTriangle } from "lucide-react";import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useSimulationStore } from "@/store/simulationStore";
import { runScenario } from "@/engine/simulation/simulation";
import { formatElapsed } from "@/lib/id";
import type { FailureScenario, NodeStatus } from "@/domain/types";

const DIFFICULTY_COLORS = { easy: "#57E3A0", medium: "#FFBF69", hard: "#FF667D" };

const STATUS_COLORS: Record<NodeStatus, string> = {
  healthy: "#57E3A0", degraded: "#FFBF69", overloaded: "#FF667D", down: "#FF667D",
};

export function FailureLabPanel() {
  const isOpen = useUIStore((s) => s.isFailureLabOpen);
  const close = useUIStore((s) => () => s.setFailureLabOpen(false));
  const graph = useWorkspaceStore((s) => s.workspace.graph);
  const scenarios = useWorkspaceStore((s) => s.workspace.scenarios);
  const addTimelineEvent = useWorkspaceStore((s) => s.addTimelineEvent);

  const { phase, activeScenario, statuses, log, elapsedSeconds, startScenario, pauseScenario, resumeScenario, resetScenario, tickElapsed } = useSimulationStore();

  const [_selectedScenario, setSelectedScenario] = useState<FailureScenario | null>(null);
  const [view, setView] = useState<"pick" | "running" | "compare">("pick");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (phase === "running") {
      timerRef.current = setInterval(tickElapsed, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, tickElapsed]);

  const handleStart = (scenario: FailureScenario) => {
    const result = runScenario(graph, scenario);
    startScenario(scenario, result);
    setSelectedScenario(scenario);
    setView("running");
    addTimelineEvent({
      kind: "simulation-started",
      description: `Failure scenario started: ${scenario.name}`,
      author: "You",
    });
  };

  const handleReset = () => {
    resetScenario();
    setView("pick");
    setSelectedScenario(null);
  };

  const handleViewCompare = () => setView("compare");

  if (!isOpen) return null;

  const impactedNodes = Object.entries(statuses).filter(([, s]) => s !== "healthy");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(9,13,22,.85)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
    onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 580, maxHeight: "85vh",
          background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: 14,
          boxShadow: "var(--shadow-lg)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255,102,125,.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,102,125,.15)", border: "1px solid rgba(255,102,125,.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF667D" }}>
              <Zap size={16} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-head)" }}>
                Failure Lab
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                Simulate failures and test your architecture's resilience
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {phase !== "idle" && (
              <span style={{
                fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600,
                color: "#FF667D", background: "rgba(255,102,125,.1)",
                padding: "3px 8px", borderRadius: 20, border: "1px solid rgba(255,102,125,.2)",
              }}>
                {formatElapsed(elapsedSeconds)} — {phase.toUpperCase()}
              </span>
            )}
            <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        {phase !== "idle" && (
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 20px" }}>
            {(["pick", "running", "compare"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "8px 14px", background: "none",
                  border: "none", borderBottom: `2px solid ${view === v ? "#FF667D" : "transparent"}`,
                  color: view === v ? "#FF667D" : "var(--text-3)",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-ui)", textTransform: "uppercase", letterSpacing: ".05em",
                  marginBottom: -1,
                }}
              >
                {v === "pick" ? "Scenarios" : v === "running" ? "Live Impact" : "Before / After"}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {view === "pick" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  active={activeScenario?.id === scenario.id}
                  onStart={() => handleStart(scenario)}
                />
              ))}
            </div>
          )}

          {view === "running" && activeScenario && (
            <div>
              <div style={{ background: "rgba(255,102,125,.06)", border: "1px solid rgba(255,102,125,.2)", borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <AlertTriangle size={14} color="#FF667D" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#FF667D" }}>
                    {activeScenario.name} — Active
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.6 }}>
                  {activeScenario.description}
                </p>
              </div>

              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                Component Impact ({impactedNodes.length} affected)
              </div>

              {impactedNodes.length === 0 ? (
                <p style={{ fontSize: 11, color: "var(--text-3)" }}>No components affected yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {impactedNodes.map(([nodeId, status]) => {
                    const node = graph.nodes.find((n) => n.id === nodeId);
                    const logEntry = log.filter((l) => l.nodeId === nodeId).pop();
                    return (
                      <div key={nodeId} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 10px", background: "var(--surface-2)",
                        border: `1px solid ${STATUS_COLORS[status as NodeStatus]}33`,
                        borderRadius: 6,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLORS[status as NodeStatus], flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", flex: 1 }}>
                          {node?.label ?? nodeId}
                        </span>
                        <span style={{ fontSize: 9, color: STATUS_COLORS[status as NodeStatus], fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          {(status as string).toUpperCase()}
                        </span>
                        {logEntry && (
                          <span style={{ fontSize: 9, color: "var(--text-3)", maxWidth: 160, textAlign: "right", lineHeight: 1.3 }}>
                            {logEntry.reason}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Controls */}
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                {phase === "running" ? (
                  <LabBtn icon={<Pause size={13} />} label="Pause" color="#FFBF69" onClick={pauseScenario} />
                ) : (
                  <LabBtn icon={<Play size={13} />} label="Resume" color="#57E3A0" onClick={resumeScenario} />
                )}
                <LabBtn icon={<RotateCcw size={13} />} label="Reset" color="#98A6BD" onClick={handleReset} />
                <LabBtn icon={<ChevronRight size={13} />} label="Compare" color="#55E6FF" onClick={handleViewCompare} />
              </div>
            </div>
          )}

          {view === "compare" && activeScenario && (
            <CompareView
              scenario={activeScenario}
              statuses={statuses}
              graph={graph}
              onReset={handleReset}
              onRerun={() => { handleStart(activeScenario); setView("running"); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, active, onStart }: { scenario: FailureScenario; active: boolean; onStart: () => void }) {
  const [hovered, setHovered] = useState(false);
  const dc = DIFFICULTY_COLORS[scenario.difficulty];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${active ? "#FF667D" : hovered ? "var(--border)" : "var(--border-subtle)"}`,
        borderRadius: 8, padding: 14,
        background: active ? "rgba(255,102,125,.06)" : hovered ? "var(--surface-2)" : "transparent",
        transition: "all .15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-head)" }}>
            {scenario.name}
          </div>
          <span style={{ fontSize: 9, color: dc, fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>
            {scenario.difficulty}
          </span>
        </div>
        <button
          onClick={onStart}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px", background: active ? "#FF667D" : "#FF667D18",
            border: `1px solid #FF667D${active ? "FF" : "40"}`,
            borderRadius: 6, color: active ? "var(--bg)" : "#FF667D",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            fontFamily: "var(--font-ui)", flexShrink: 0,
          }}
        >
          <Play size={11} />
          {active ? "Rerun" : "Start"}
        </button>
      </div>
      <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 6 }}>
        {scenario.description}
      </p>
      <div style={{ fontSize: 10, color: "var(--text-3)" }}>
        <span style={{ color: "#FFBF69", fontWeight: 600 }}>Impact: </span>{scenario.impact}
      </div>
    </div>
  );
}

function CompareView({ scenario, statuses, graph, onReset, onRerun }: {
  scenario: FailureScenario;
  statuses: Record<string, NodeStatus>;
  graph: { nodes: { id: string; label: string }[] };
  onReset: () => void;
  onRerun: () => void;
}) {
  const affected = Object.entries(statuses).filter(([, s]) => s !== "healthy");
  const healthy = graph.nodes.filter((n) => (statuses[n.id] ?? "healthy") === "healthy");

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <SummaryCard title="Affected Components" value={`${affected.length}`} color="#FF667D" subtitle="degraded or down" />
        <SummaryCard title="Healthy Components" value={`${healthy.length}`} color="#57E3A0" subtitle="unaffected" />
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
        Recovery Suggestions
      </div>
      <RecoverySuggestions kind={scenario.kind} />

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <LabBtn icon={<RotateCcw size={13} />} label="Reset" color="#98A6BD" onClick={onReset} />
        <LabBtn icon={<Play size={13} />} label="Rerun Scenario" color="#FF667D" onClick={onRerun} />
      </div>
    </div>
  );
}

function RecoverySuggestions({ kind }: { kind: string }) {
  const suggestions: Record<string, string[]> = {
    "database-outage": [
      "Add a read replica for failover capability",
      "Implement connection pooling to reduce pressure",
      "Consider a standby primary with automated promotion",
      "Add a Redis cache layer to reduce DB load",
    ],
    "traffic-spike": [
      "Add a load balancer in front of services",
      "Scale service instances horizontally",
      "Introduce rate limiting at the API Gateway",
      "Add a CDN to offload static asset traffic",
    ],
    "network-partition": [
      "Implement circuit breakers on service-to-service calls",
      "Add retry logic with exponential backoff",
      "Use a service mesh for resilient routing",
    ],
    "service-failure": [
      "Add redundant service instances behind a load balancer",
      "Implement health checks and auto-restart policies",
      "Use a message queue to decouple the failed service",
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {(suggestions[kind] ?? []).map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 8, padding: "6px 10px", background: "var(--surface-2)", borderRadius: 6 }}>
          <span style={{ color: "#57E3A0", fontSize: 11, flexShrink: 0, marginTop: 1 }}>→</span>
          <span style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ title, value, color, subtitle }: { title: string; value: string; color: string; subtitle: string }) {
  return (
    <div style={{ background: "var(--surface-2)", border: `1px solid ${color}25`, borderRadius: 8, padding: 12, textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "var(--font-head)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginTop: 4 }}>{title}</div>
      <div style={{ fontSize: 9, color: "var(--text-3)", marginTop: 2 }}>{subtitle}</div>
    </div>
  );
}

function LabBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5, padding: "7px 14px",
        background: `${color}15`, border: `1px solid ${color}35`,
        borderRadius: 6, color, fontSize: 11, fontWeight: 600,
        cursor: "pointer", fontFamily: "var(--font-ui)",
      }}
    >
      {icon}{label}
    </button>
  );
}
