import { create } from "zustand";
import type { NodeId, EdgeId } from "@/domain/types";

export type ActivePanel = "queries" | "timeline" | "failure-lab" | null;
export type ActiveTool = "select" | "pan" | "connect" | "annotate";
export type AppView = "landing" | "dashboard" | "workspace";

interface UIState {
  view: AppView;
  activePanel: ActivePanel;
  activeTool: ActiveTool;
  selectedNodeId: NodeId | null;
  selectedEdgeId: EdgeId | null;
  isComponentLibraryOpen: boolean;
  isInviteDialogOpen: boolean;
  isFailureLabOpen: boolean;
  isRaiseQueryDialogOpen: boolean;
  raiseQueryForNodeId: NodeId | null;

  setView: (view: AppView) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setActiveTool: (tool: ActiveTool) => void;
  selectNode: (id: NodeId | null) => void;
  selectEdge: (id: EdgeId | null) => void;
  toggleComponentLibrary: () => void;
  setComponentLibraryOpen: (open: boolean) => void;
  setInviteDialogOpen: (open: boolean) => void;
  setFailureLabOpen: (open: boolean) => void;
  openRaiseQuery: (nodeId: NodeId) => void;
  closeRaiseQuery: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: "landing",
  activePanel: null,
  activeTool: "select",
  selectedNodeId: null,
  selectedEdgeId: null,
  isComponentLibraryOpen: true,
  isInviteDialogOpen: false,
  isFailureLabOpen: false,
  isRaiseQueryDialogOpen: false,
  raiseQueryForNodeId: null,

  setView: (view) => set({ view }),
  setActivePanel: (panel) => set((s) => ({ activePanel: s.activePanel === panel ? null : panel })),
  setActiveTool: (activeTool) => set({ activeTool }),
  selectNode: (selectedNodeId) => set({ selectedNodeId, selectedEdgeId: null }),
  selectEdge: (selectedEdgeId) => set({ selectedEdgeId, selectedNodeId: null }),
  toggleComponentLibrary: () => set((s) => ({ isComponentLibraryOpen: !s.isComponentLibraryOpen })),
  setComponentLibraryOpen: (open) => set({ isComponentLibraryOpen: open }),
  setInviteDialogOpen: (open) => set({ isInviteDialogOpen: open }),
  setFailureLabOpen: (open) => set({ isFailureLabOpen: open }),
  openRaiseQuery: (nodeId) => set({ isRaiseQueryDialogOpen: true, raiseQueryForNodeId: nodeId }),
  closeRaiseQuery: () => set({ isRaiseQueryDialogOpen: false, raiseQueryForNodeId: null }),
}));
