import { create } from "zustand";
import type { EdgeId, NodeId, StickyColor, WorkspaceMode } from "@/domain/types";

export type ActivePanel = "queries" | "timeline" | "failure-lab" | null;

/** The 12 primary canvas tools. Every visible tool has a working handler. */
export type ActiveTool =
  | "select"
  | "hand"
  | "sticky"
  | "text"
  | "pen"
  | "highlighter"
  | "eraser"
  | "shape"
  | "connector"
  | "comment"
  | "components"
  | "frame";

export type AppView = "landing" | "dashboard" | "workspace";

export type ShapeToolKind = "rect" | "rect-rounded" | "ellipse" | "diamond";

interface UIState {
  view: AppView;
  activePanel: ActivePanel;
  activeTool: ActiveTool;
  /** Which shape the shape tool stamps (frames use the dedicated `frame` tool). */
  shapeKind: ShapeToolKind;
  mode: WorkspaceMode;
  selectedNodeId: NodeId | null;
  selectedEdgeId: EdgeId | null;
  isComponentLibraryOpen: boolean;
  isInviteDialogOpen: boolean;
  isFailureLabOpen: boolean;
  isRaiseQueryDialogOpen: boolean;
  raiseQueryForNodeId: NodeId | null;

  // Drawing settings (pen / highlighter)
  strokeColor: string;
  strokeWidth: number;
  /** Default colour for new sticky notes. */
  stickyColor: StickyColor;

  setView: (view: AppView) => void;
  restoreViewFromHistory: (view: AppView) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setShapeKind: (kind: ShapeToolKind) => void;
  setMode: (mode: WorkspaceMode) => void;
  selectNode: (id: NodeId | null) => void;
  selectEdge: (id: EdgeId | null) => void;
  toggleComponentLibrary: () => void;
  setComponentLibraryOpen: (open: boolean) => void;
  setInviteDialogOpen: (open: boolean) => void;
  setFailureLabOpen: (open: boolean) => void;
  openRaiseQuery: (nodeId: NodeId) => void;
  closeRaiseQuery: () => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setStickyColor: (color: StickyColor) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: "landing",
  activePanel: null,
  activeTool: "select",
  shapeKind: "rect",
  mode: "brainstorm",
  selectedNodeId: null,
  selectedEdgeId: null,
  isComponentLibraryOpen: false,
  isInviteDialogOpen: false,
  isFailureLabOpen: false,
  isRaiseQueryDialogOpen: false,
  raiseQueryForNodeId: null,

  strokeColor: "#292c35",
  strokeWidth: 2.5,
  stickyColor: "yellow",

  setView: (view) =>
    set((state) => {
      // Do not add duplicate history entries when a button selects the current view.
      if (state.view === view) return state;

      if (typeof window !== "undefined") {
        const rawState = window.history.state;
        const baseState: Record<string, unknown> =
          rawState && typeof rawState === "object" && !Array.isArray(rawState)
            ? (rawState as Record<string, unknown>)
            : {};
        const rawBitverse = baseState.__bitverse;
        const bitverseState: Record<string, unknown> =
          rawBitverse && typeof rawBitverse === "object" && !Array.isArray(rawBitverse)
            ? (rawBitverse as Record<string, unknown>)
            : {};

        window.history.pushState(
          { ...baseState, __bitverse: { ...bitverseState, view } },
          "",
          window.location.href,
        );
      }

      return { view };
    }),
  // Popstate must update Zustand without creating another browser-history entry.
  restoreViewFromHistory: (view) => set({ view }),
  setActivePanel: (panel) => set((s) => ({ activePanel: s.activePanel === panel ? null : panel })),
  setActiveTool: (activeTool) => set({ activeTool }),
  setShapeKind: (shapeKind) => set({ shapeKind }),
  setMode: (mode) => set({ mode }),
  selectNode: (selectedNodeId) => set({ selectedNodeId, selectedEdgeId: null }),
  selectEdge: (selectedEdgeId) => set({ selectedEdgeId, selectedNodeId: null }),
  toggleComponentLibrary: () => set((s) => ({ isComponentLibraryOpen: !s.isComponentLibraryOpen })),
  setComponentLibraryOpen: (open) => set({ isComponentLibraryOpen: open }),
  setInviteDialogOpen: (open) => set({ isInviteDialogOpen: open }),
  setFailureLabOpen: (open) => set({ isFailureLabOpen: open }),
  openRaiseQuery: (nodeId) => set({ isRaiseQueryDialogOpen: true, raiseQueryForNodeId: nodeId }),
  closeRaiseQuery: () => set({ isRaiseQueryDialogOpen: false, raiseQueryForNodeId: null }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setStickyColor: (stickyColor) => set({ stickyColor }),
}));
