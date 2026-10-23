import { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { ShapeKind } from "@/domain/types";

interface ShapeData {
  shape: ShapeKind;
  label?: string;
  fill?: string;
  border?: string;
  title?: string;
  [key: string]: unknown;
}

export const ShapeNode = memo(function ShapeNode({ id, data, selected }: NodeProps) {
  const { shape, label, title } = data as ShapeData;
  const updateNode = useWorkspaceStore((s) => s.updateNode);

  const fill = (data as ShapeData).fill ?? "transparent";
  const border = (data as ShapeData).border ?? "var(--border-strong)";

  const isFrame = shape === "frame";
  const isEllipse = shape === "ellipse";
  const isDiamond = shape === "diamond";

  const borderRadius = shape === "rect-rounded" ? "var(--r-xl)" : isEllipse ? "50%" : "var(--r-xs)";
  const clip = isDiamond ? "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" : undefined;

  return (
    <div
      className="bit-shape"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <NodeResizer
        minWidth={60}
        minHeight={60}
        isVisible={!!selected}
        lineStyle={{ borderColor: "var(--accent-violet)", borderWidth: 0 }}
        handleStyle={{
          width: 8, height: 8, borderRadius: 2,
          background: "var(--accent-violet)", border: "none",
        }}
      />

      {/* Frame title tab */}
      {isFrame && (
        <input
          value={title ?? ""}
          onChange={(e) => updateNode(id, { title: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          placeholder="Section name"
          aria-label="Frame title"
          style={{
            position: "absolute", top: -22, left: 0,
            background: "transparent", border: "none", outline: "none",
            color: "var(--text-secondary)", fontFamily: "var(--font-head)",
            fontSize: 13, fontWeight: 700, width: 220, padding: 0,
          }}
        />
      )}

      {/* Shape body */}
      <div
        style={{
          width: "100%", height: "100%",
          background: isFrame ? "rgba(130,112,207,.04)" : fill,
          border: isFrame
            ? `2px dashed ${selected ? "var(--accent-violet)" : "var(--border-strong)"}`
            : `2px solid ${selected ? "var(--accent-violet)" : border}`,
          borderRadius,
          clipPath: clip,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: isFrame ? 24 : 12,
          transition: "box-shadow var(--t-base)",
          boxShadow: selected && !isFrame ? "var(--glow-violet)" : "none",
        }}
      >
        {label && !isFrame && (
          <span
            style={{
              fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
              color: "var(--text-primary)", textAlign: "center",
              maxWidth: "100%", wordBreak: "break-word",
              pointerEvents: "none",
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
});
