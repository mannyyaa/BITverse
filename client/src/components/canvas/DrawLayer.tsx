import { useRef, useState } from "react";
import { useViewport } from "@xyflow/react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { generateId } from "@/lib/id";
import type { Stroke } from "@/domain/types";

/**
 * Freehand drawing overlay. Renders an SVG over the React Flow pane and
 * transforms stroke geometry by the live viewport (pan/zoom) so sketches
 * stay aligned with nodes. Only captures pointer events for pen /
 * highlighter / eraser — otherwise it is transparent to the canvas so nodes
 * remain selectable and the pane pannable.
 */
export function DrawLayer() {
  const vp = useViewport();
  const strokes = useWorkspaceStore((s) => s.workspace.graph.strokes);
  const addStroke = useWorkspaceStore((s) => s.addStroke);
  const removeStrokes = useWorkspaceStore((s) => s.removeStrokes);

  const activeTool = useUIStore((s) => s.activeTool);
  const strokeColor = useUIStore((s) => s.strokeColor);
  const strokeWidth = useUIStore((s) => s.strokeWidth);
  const stickyColor = useUIStore((s) => s.stickyColor);

  const isDrawTool = activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser";
  const isHighlighter = activeTool === "highlighter";
  const isEraser = activeTool === "eraser";

  const [draft, setDraft] = useState<Stroke | null>(null);
  const erasingRef = useRef<Set<string>>(new Set());
  const drawingRef = useRef(false);

  void stickyColor; // referenced to keep settings reactive for the toolbar

  const toCanvas = (clientX: number, clientY: number, rect: DOMRect) => ({
    x: (clientX - rect.left - vp.x) / vp.zoom,
    y: (clientY - rect.top - vp.y) / vp.zoom,
  });

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = toCanvas(e.clientX, e.clientY, rect);

    if (isEraser) {
      drawingRef.current = true;
      hitErase(p, rect);
      return;
    }

    drawingRef.current = true;
    const tool = isHighlighter ? "highlighter" : "pen";
    setDraft({
      id: generateId("sk"),
      tool,
      color: strokeColor,
      width: isHighlighter ? Math.max(strokeWidth, 12) : strokeWidth,
      points: [p],
    });
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = toCanvas(e.clientX, e.clientY, rect);

    if (isEraser) {
      hitErase(p, rect);
      return;
    }
    setDraft((d) => (d ? { ...d, points: [...d.points, p] } : d));
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    if (isEraser) {
      const ids = [...erasingRef.current];
      erasingRef.current = new Set();
      if (ids.length) removeStrokes(ids);
      return;
    }
    if (draft && draft.points.length > 1) addStroke(draft);
    setDraft(null);
  };

  const hitErase = (p: { x: number; y: number }, _rect: DOMRect) => {
    const tol = 10 / vp.zoom;
    for (const s of strokes) {
      if (erasingRef.current.has(s.id)) continue;
      for (const pt of s.points) {
        if (Math.hypot(pt.x - p.x, pt.y - p.y) <= tol + s.width / 2) {
          erasingRef.current.add(s.id);
          break;
        }
      }
    }
    // re-render to reflect hidden strokes
    setDraft((d) => (d ? { ...d } : null));
  };

  const visible = strokes.filter((s) => !erasingRef.current.has(s.id));
  const all = draft ? [...visible, draft] : visible;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: isDrawTool ? "auto" : "none",
        cursor: isEraser ? "cell" : "crosshair",
        zIndex: isDrawTool ? 5 : 0,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <g transform={`translate(${vp.x} ${vp.y}) scale(${vp.zoom})`}>
        {all.map((s) => {
          const d = s.points.length
            ? "M" + s.points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")
            : "";
          const highlighter = s.tool === "highlighter";
          return (
            <path
              key={s.id}
              d={d}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
              opacity={highlighter ? 0.35 : 1}
              style={{ mixBlendMode: highlighter ? "multiply" : "normal" }}
            />
          );
        })}
      </g>
    </svg>
  );
}
