import { memo, useEffect, useRef, useState } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  STICKY_BORDER_VAR,
  STICKY_COLORS,
  STICKY_COLOR_VAR,
  stickyTemplateMeta,
} from "@/lib/canvas";
import type { StickyColor, StickyTemplate } from "@/domain/types";

interface StickyData {
  text: string;
  color: StickyColor;
  template?: StickyTemplate;
  align?: "left" | "center";
  [key: string]: unknown;
}

export const StickyNoteNode = memo(function StickyNoteNode({ id, data, selected }: NodeProps) {
  const { text, color, template, align } = data as StickyData;
  const updateNode = useWorkspaceStore((s) => s.updateNode);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(text);
  }, [text, editing]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next !== text) updateNode(id, { text: next });
    setEditing(false);
  };

  const tmpl = stickyTemplateMeta(template);
  const bg = STICKY_COLOR_VAR[color];
  const border = STICKY_BORDER_VAR[color];

  return (
    <div
      className="bit-sticky"
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--r-lg)",
        boxShadow: selected
          ? "var(--shadow-md), var(--glow-violet)"
          : "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        padding: "12px 14px",
        position: "relative",
        transition: "box-shadow var(--t-base)",
        userSelect: "none",
      }}
    >
      <NodeResizer
        minWidth={110}
        minHeight={70}
        isVisible={!!selected}
        lineStyle={{ borderColor: "var(--accent-violet)", borderWidth: 0 }}
        handleStyle={{
          width: 8, height: 8, borderRadius: 2,
          background: "var(--accent-violet)", border: "none",
        }}
      />

      {/* Template chip */}
      {tmpl && !editing && (
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            alignSelf: "flex-start",
            fontSize: 10, fontWeight: 700, color: "var(--text-secondary)",
            background: "rgba(0,0,0,.05)", borderRadius: "var(--r-full)",
            padding: "1px 8px", marginBottom: 8,
          }}
        >
          <span aria-hidden>{tmpl.emoji}</span>
          {tmpl.label}
        </div>
      )}

      {/* Body */}
      {editing ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
            if (e.key === "Escape") { setDraft(text); setEditing(false); }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Write your note…"
          aria-label="Edit sticky note"
          style={{
            flex: 1, width: "100%", resize: "none",
            background: "transparent", border: "none", outline: "none",
            color: "var(--text-primary)", fontFamily: "var(--font-ui)",
            fontSize: 13, lineHeight: 1.5,
            textAlign: align ?? "left",
          }}
        />
      ) : (
        <div
          onDoubleClick={() => setEditing(true)}
          style={{
            flex: 1, width: "100%", cursor: "text",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            color: text ? "var(--text-primary)" : "var(--text-tertiary)",
            fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.5,
            textAlign: align ?? "left",
            overflow: "hidden",
          }}
        >
          {text || (tmpl ? tmpl.placeholder : "Double-click to write…")}
        </div>
      )}

      {/* Quick colour switcher */}
      {selected && !editing && (
        <div
          style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {STICKY_COLORS.map((c) => (
            <button
              key={c}
              title={c}
              aria-label={`Set note colour to ${c}`}
              onClick={() => updateNode(id, { color: c })}
              style={{
                width: 14, height: 14, borderRadius: "var(--r-full)",
                background: STICKY_COLOR_VAR[c],
                border: c === color ? "1.5px solid var(--accent-violet)" : "1px solid rgba(0,0,0,.12)",
                cursor: "pointer", padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});
