import type {
  ArchitectureGraph,
  SimulationScenario,
  SimulationState,
} from "@/domain/types";

/**
 * Pure simulation step (no React, no DOM).
 *
 * Given the architecture graph, an active scenario, and the previous state,
 * returns the next discrete `SimulationState`. Keeping this pure means it can
 * be unit-tested in isolation and later run inside a Web Worker, so a
 * propagating failure never blocks the canvas UI.
 *
 * Implemented in Phase 4 (Failure Lab).
 */
export function stepSimulation(
  _graph: ArchitectureGraph,
  _scenario: SimulationScenario,
  prev: SimulationState,
): SimulationState {
  return prev;
}
