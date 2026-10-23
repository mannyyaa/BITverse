import { memo, useEffect, useRef, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { TextSize } from "@/domain/types";

interface TextData {
  content: string;
  size?: TextSize;
  [key: string]: unknown;
}

const SIZE_PX: Record<TextSize, number> = { sm: 14, md: 20, lg: 30 };

export const TextNode = memo(function TextNode({ id, data, selected }: NodeProps) {
  const { content, size } = data as TextData;
  const updateNode = useWorkspaceStore((s) => s.updateNode);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (!editing) setDraft(content); }, [content, editing]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next !== content) updateNode(id, { content: next });
    setEditing(false);
  };

  const fontSize = SIZE_PX[size ?? "md"];

  return (
    <div
      style={{
        width: "100%", minWidth: 120, padding: 2,
        borderRadius: "var(--r-sm)",
        outline: selected ? "2px solid var(--accent-violet)" : "2px solid transparent",
        outlineOffset: 2,
      }}
    >
      {editing ? (
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
            if (e.key === "Escape") { setDraft(content); setEditing(false); }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          rows={1}
          aria-label="Edit text"
          style={{
            width: "100%", background: "rgba(255,255,255,.6)",
            border: "1px dashed var(--border-strong)", borderRadius: "var(--r-sm)",
            color: "var(--text-primary)", fontFamily: "var(--font-head)",
            fontSize, fontWeight: 600, lineHeight: 1.2,
            padding: "2px 6px", resize: "none", outline: "none",
          }}
        />
      ) : (
        <div
          onDoubleClick={() => setEditing(true)}
          style={{
            fontFamily: "var(--font-head)", fontSize, fontWeight: 600,
            lineHeight: 1.2, color: "var(--text-primary)",
            whiteSpace: "pre-wrap", wordBreak: "break-word", cursor: "text",
            minHeight: fontSize,
          }}
        >
          {content || "Double-click to add text"}
        </div>
      )}
    </div>
  );
});
