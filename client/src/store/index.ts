/**
 * State layer — Zustand stores.
 * Architecture: feature components call actions and select state only.
 * When Yjs/WS arrives, swap internals here without changing component APIs.
 */
export { useWorkspaceStore } from "./workspaceStore";
export { useSimulationStore } from "./simulationStore";
export { useUIStore } from "./uiStore";
