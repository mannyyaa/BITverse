/**
 * State layer — the seam for future real-time collaboration.
 *
 * Today (Phase 2+): local Zustand stores keyed by feature:
 *   canvasStore, queryStore, simulationStore.
 *
 * Tomorrow (Phase 7): swap each store's *internals* for a CRDT-backed store
 * (Yjs) while keeping the same action/select interface. Feature components
 * only call actions and select state, so they don't need to know whether
 * state lives locally or in a shared document.
 *
 * Stores are added when the feature that needs them lands. This file is a
 * placeholder marking the seam.
 */
export {};
