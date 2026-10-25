import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { analyzeArchitecture, type HealthIssue, type HealthSeverity } from "@/engine/health/architectureHealth";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";

interface ArchitectureHealthPanelProps {
  onClose: () => void;
}

const severityStyle: Record<HealthSeverity, { color: string; background: string; label: string }> = {
  critical: { color: "var(--accent-red)", background: "rgba(214,48,49,.09)", label: "Critical" },
  warning: { color: "var(--accent-amber)", background: "rgba(225,112,85,.10)", label: "Warning" },
  info: { color: "var(--accent-blue)", background: "rgba(9,132,227,.08)", label: "Info" },
};

export function ArchitectureHealthPanel({ onClose }: ArchitectureHealthPanelProps) {
  const graph = useWorkspaceStore((s) => s.workspace.graph);
  const workspaceName = useWorkspaceStore((s) => s.workspace.name);
  const selectNode = useUIStore((s) => s.selectNode);
  const selectEdge = useUIStore((s) => s.selectEdge);
  const [runVersion, setRunVersion] = useState(0);
  const [lastRunAt, setLastRunAt] = useState(() => Date.now());

  const findings = useMemo(
    () => analyzeArchitecture(graph.nodes, graph.edges),
    [graph.nodes, graph.edges, runVersion],
  );
  const counts = useMemo(() => ({
    critical: findings.filter((item) => item.severity === "critical").length,
    warning: findings.filter((item) => item.severity === "warning").length,
    info: findings.filter((item) => item.severity === "info").length,
  }), [findings]);

  const rerun = () => {
    setRunVersion((version) => version + 1);
    setLastRunAt(Date.now());
  };

  const reviewFinding = (finding: HealthIssue) => {
    // When a finding identifies a connector, select the connector itself first;
    // its endpoint may also be attached for context (e.g. a duplicate edge).
    if (finding.edgeId) selectEdge(finding.edgeId);
    else if (finding.nodeId) selectNode(finding.nodeId);
    onClose();
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: "48px 0 0",
        zIndex: 120,
        background: "rgba(15,17,23,.12)",
        backdropFilter: "blur(1px)",
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="architecture-health-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "min(430px, 100vw)",
          display: "flex",
          flexDirection: "column",
          background: "var(--surface-0)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
          color: "var(--text-primary)",
        }}
      >
        <header style={{ padding: "18px 18px 14px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--accent-violet)", fontSize: 10, fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase" }}>
                <ShieldCheck size={14} /> Architecture review
              </div>
              <h2 id="architecture-health-title" style={{ fontSize: 21, marginTop: 6, letterSpacing: "-.025em" }}>
                Health Check
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 11, marginTop: 4, lineHeight: 1.55 }}>
                Structural checks for <strong>{workspaceName}</strong>. Sticky notes, shapes, and brainstorm arrows are excluded.
              </p>
            </div>
            <button
              aria-label="Close Architecture Health Check"
              onClick={onClose}
              style={{ border: "1px solid var(--border)", background: "var(--surface-1)", color: "var(--text-secondary)", borderRadius: "var(--r-sm)", width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7, marginTop: 16 }}>
            <SummaryTile label="Critical" count={counts.critical} severity="critical" />
            <SummaryTile label="Warnings" count={counts.warning} severity="warning" />
            <SummaryTile label="Info" count={counts.info} severity="info" />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 13 }}>
            <span style={{ color: "var(--text-tertiary)", fontSize: 10, fontFamily: "var(--font-mono)" }}>
              Last checked {formatTime(lastRunAt)}
            </span>
            <button
              type="button"
              onClick={rerun}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "6px 9px", background: "var(--surface-0)", color: "var(--text-secondary)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
            >
              <RefreshCw size={11} /> Run checks
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          {findings.length === 0 ? (
            <div style={{ padding: "32px 18px", textAlign: "center", border: "1px solid rgba(0,184,148,.24)", borderRadius: "var(--r-lg)", background: "rgba(0,184,148,.045)" }}>
              <div style={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(0,184,148,.12)", color: "var(--accent-green)", margin: "0 auto 12px" }}>
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: 15 }}>No structural findings</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>
                The current graph passed the checks included in this prototype. This is not a runtime, security, or capacity certification.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, margin: "2px 2px 10px" }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Findings</span>
                <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>{findings.length} rule result{findings.length === 1 ? "" : "s"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {findings.map((finding) => (
                  <FindingCard key={finding.id} finding={finding} onReview={() => reviewFinding(finding)} />
                ))}
              </div>
            </>
          )}

          <div style={{ marginTop: 14, padding: "11px 12px", display: "flex", alignItems: "flex-start", gap: 8, background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
            <Info size={13} color="var(--text-tertiary)" style={{ marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontSize: 10, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              <strong>How to read this:</strong> checks are deterministic heuristics over the drawn graph. They cannot infer business requirements or prove that a design is production-ready; treat each recommendation as a review prompt.
            </p>
          </div>
        </div>

        <footer style={{ borderTop: "1px solid var(--border)", padding: "10px 16px", color: "var(--text-tertiary)", fontSize: 9, fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between", gap: 10 }}>
          <span>LOCAL GRAPH ANALYSIS</span>
          <span>{graph.nodes.length} canvas objects · {graph.edges.length} connectors</span>
        </footer>
      </aside>
    </div>
  );
}

function SummaryTile({ label, count, severity }: { label: string; count: number; severity: HealthSeverity }) {
  const style = severityStyle[severity];
  return (
    <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "10px 11px" }}>
      <div style={{ fontSize: 21, fontWeight: 750, color: style.color, fontFamily: "var(--font-head)", lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 5 }}>{label}</div>
    </div>
  );
}

function FindingCard({ finding, onReview }: { finding: HealthIssue; onReview: () => void }) {
  const style = severityStyle[finding.severity];
  const Icon = finding.severity === "critical" ? AlertCircle : finding.severity === "warning" ? AlertTriangle : Info;
  const canReview = Boolean(finding.nodeId || finding.edgeId);

  return (
    <article style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--surface-0)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "12px 12px 8px" }}>
        <div style={{ width: 27, height: 27, borderRadius: "var(--r-sm)", background: style.background, color: style.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon size={14} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>{finding.title}</span>
            <span style={{ background: style.background, color: style.color, borderRadius: "var(--r-full)", padding: "2px 6px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>
              {style.label}
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 10, lineHeight: 1.55, marginTop: 6 }}>{finding.description}</p>
        </div>
      </div>
      <div style={{ margin: "0 12px", padding: "9px 10px", background: "var(--surface-1)", borderRadius: "var(--r-sm)" }}>
        <div style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Suggested next step</div>
        <p style={{ fontSize: 10, lineHeight: 1.55, color: "var(--text-secondary)" }}>{finding.recommendation}</p>
      </div>
      {canReview && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 11px 10px" }}>
          <button
            type="button"
            onClick={onReview}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, border: 0, background: "transparent", color: "var(--accent-violet)", fontSize: 10, fontWeight: 700, cursor: "pointer", padding: 2 }}
          >
            Inspect in canvas <ChevronRight size={12} />
          </button>
        </div>
      )}
    </article>
  );
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(timestamp);
}
