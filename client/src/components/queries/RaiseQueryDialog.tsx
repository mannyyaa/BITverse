import { useState } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { QueryType, Priority } from "@/domain/types";

export function RaiseQueryDialog() {
  const isOpen  = useUIStore((s) => s.isRaiseQueryDialogOpen);
  const nodeId  = useUIStore((s) => s.raiseQueryForNodeId);
  const close   = useUIStore((s) => s.closeRaiseQuery);
  const setPanel = useUIStore((s) => s.setActivePanel);

  const addQuery    = useWorkspaceStore((s) => s.addQuery);
  const addTimeline = useWorkspaceStore((s) => s.addTimelineEvent);
  const nodeName    = useWorkspaceStore((s) =>
    nodeId ? (s.workspace.graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId) : "",
  );

  const [title,    setTitle]    = useState("");
  const [body,     setBody]     = useState("");
  const [type,     setType]     = useState<QueryType>("question");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState("");

  if (!isOpen || !nodeId) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addQuery({
      title: title.trim(),
      body: body.trim(),
      type,
      priority,
      target: { kind: "node", id: nodeId },
      author: "You",
      assignee: assignee || undefined,
    });
    addTimeline({
      kind: "query-raised",
      description: `Query raised: "${title.trim()}"`,
      author: "You",
      nodeId,
    });
    setPanel("queries");
    close();
    setTitle(""); setBody(""); setType("question"); setPriority("medium"); setAssignee("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,17,23,.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={close}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          background: "var(--surface-0)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: "var(--font-head)",
              }}
            >
              Raise a Query
            </div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
              On:{" "}
              <span style={{ color: "var(--accent-violet)", fontWeight: 500 }}>
                {nodeName}
              </span>
            </div>
          </div>
          <button
            type="button"
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

        {/* Fields */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Field label="Title *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Is this a single point of failure?"
              required
              style={inputStyle}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the concern or improvement idea…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value as QueryType)} style={inputStyle}>
                <option value="question">Question</option>
                <option value="issue">Potential Issue</option>
                <option value="improvement">Improvement</option>
              </select>
            </Field>
            <Field label="Priority">
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} style={inputStyle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </Field>
          </div>
          <Field label="Assign to (optional)">
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={inputStyle}>
              <option value="">Unassigned</option>
              <option value="Aanya">Aanya</option>
              <option value="Rohan">Rohan</option>
              <option value="You">You</option>
            </select>
          </Field>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px 16px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={close}
            style={secondaryBtnStyle}
          >
            Cancel
          </button>
          <button type="submit" style={primaryBtnStyle}>
            Raise Query
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 10,
          fontWeight: 700,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-1)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-sm)",
  color: "var(--text-primary)",
  fontSize: 12,
  padding: "7px 10px",
  fontFamily: "var(--font-ui)",
  outline: "none",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "7px 18px",
  background: "var(--accent-violet)",
  border: "none",
  borderRadius: "var(--r-sm)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "var(--font-ui)",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "7px 14px",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-sm)",
  color: "var(--text-secondary)",
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "var(--font-ui)",
};
