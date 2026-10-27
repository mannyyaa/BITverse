import { useEffect } from "react";
import { useUIStore, type AppView } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { LandingPage } from "@/components/landing/LandingPage";
import { Dashboard } from "@/components/workspaces/Dashboard";
import { WorkspaceView } from "@/components/workspaces/WorkspaceView";

function isAppView(value: unknown): value is AppView {
  return value === "landing" || value === "dashboard" || value === "workspace";
}

function readViewFromHistoryState(state: unknown): AppView | null {
  if (!state || typeof state !== "object" || Array.isArray(state)) return null;
  const bitverse = (state as Record<string, unknown>).__bitverse;
  if (!bitverse || typeof bitverse !== "object" || Array.isArray(bitverse)) return null;
  const view = (bitverse as Record<string, unknown>).view;
  return isAppView(view) ? view : null;
}

function stateWithView(state: unknown, view: AppView): Record<string, unknown> {
  const baseState: Record<string, unknown> =
    state && typeof state === "object" && !Array.isArray(state)
      ? (state as Record<string, unknown>)
      : {};
  const rawBitverse = baseState.__bitverse;
  const bitverseState: Record<string, unknown> =
    rawBitverse && typeof rawBitverse === "object" && !Array.isArray(rawBitverse)
      ? (rawBitverse as Record<string, unknown>)
      : {};
  return { ...baseState, __bitverse: { ...bitverseState, view } };
}

export function App() {
  const view = useUIStore((s) => s.view);
  const restoreViewFromHistory = useUIStore((s) => s.restoreViewFromHistory);
  const { checkAuth, checkServer } = useAuthStore();

  // On mount: probe server health and restore any persisted JWT
  useEffect(() => {
    checkServer();
    checkAuth();
  }, [checkAuth, checkServer]);

  useEffect(() => {
    // Mark the current entry as the initial app view, so Back can restore it.
    const currentView = useUIStore.getState().view;
    if (readViewFromHistoryState(window.history.state) !== currentView) {
      window.history.replaceState(
        stateWithView(window.history.state, currentView),
        "",
        window.location.href,
      );
    }

    const handlePopState = (event: PopStateEvent) => {
      // A browser Back/Forward event restores view state without pushing a new entry.
      restoreViewFromHistory(readViewFromHistoryState(event.state) ?? "landing");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [restoreViewFromHistory]);

  return (
    <>
      {view === "landing"   && <LandingPage />}
      {view === "dashboard" && <Dashboard />}
      {view === "workspace" && <WorkspaceView />}
    </>
  );
}
