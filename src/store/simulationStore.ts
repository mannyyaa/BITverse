import { create } from "zustand";
import type { FailureScenario, NodeId, NodeStatus, SimulationLogEntry, SimulationPhase } from "@/domain/types";

interface SimState {
  phase: SimulationPhase;
  activeScenario: FailureScenario | null;
  statuses: Record<NodeId, NodeStatus>;
  log: SimulationLogEntry[];
  elapsedSeconds: number;
  beforeStatuses: Record<NodeId, NodeStatus> | null;

  startScenario: (scenario: FailureScenario, result: { statuses: Record<NodeId, NodeStatus>; log: SimulationLogEntry[] }) => void;
  pauseScenario: () => void;
  resumeScenario: () => void;
  resetScenario: () => void;
  tickElapsed: () => void;
}

export const useSimulationStore = create<SimState>((set, get) => ({
  phase: "idle",
  activeScenario: null,
  statuses: {},
  log: [],
  elapsedSeconds: 0,
  beforeStatuses: null,

  startScenario: (scenario, result) =>
    set((s) => ({
      phase: "running",
      activeScenario: scenario,
      statuses: result.statuses,
      log: result.log,
      elapsedSeconds: 0,
      beforeStatuses: s.beforeStatuses ?? { ...s.statuses },
    })),

  pauseScenario: () =>
    set((s) => ({ phase: s.phase === "running" ? "paused" : s.phase })),

  resumeScenario: () =>
    set((s) => ({ phase: s.phase === "paused" ? "running" : s.phase })),

  resetScenario: () =>
    set({
      phase: "idle",
      activeScenario: null,
      statuses: {},
      log: [],
      elapsedSeconds: 0,
      beforeStatuses: null,
    }),

  tickElapsed: () => {
    const { phase } = get();
    if (phase === "running") {
      set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
    }
  },
}));
