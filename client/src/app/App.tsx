import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { LandingPage } from "@/components/landing/LandingPage";
import { Dashboard } from "@/components/workspaces/Dashboard";
import { WorkspaceView } from "@/components/workspaces/WorkspaceView";

export function App() {
  const view    = useUIStore((s) => s.view);

  useEffect(() => {
    /**
     * Sync the store when the user presses the browser back or forward button.
     * `popstate` fires after the URL has already changed, so we just read
     * the new hash and update the store — without pushing another history entry
     * (which would create an infinite loop). We write directly to the store's
     * internal setter by calling setView, but we also need to avoid the
     * pushState inside setView from firing again. The simplest approach: read
     * the hash ourselves and only call setView when the view actually differs.
     */
    const handlePop = () => {
      const HASH_MAP: Record<string, import("@/store/uiStore").AppView> = {
        "":           "landing",
        "#dashboard": "dashboard",
        "#workspace": "workspace",
      };
      const next = HASH_MAP[window.location.hash] ?? "landing";
      // Update store view WITHOUT pushing another history entry.
      // Because the hash already matches the new view, the guard inside
      // setView (`if (current !== hash)`) will skip pushState automatically.
      useUIStore.setState({ view: next });
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — setView is stable

  return (
    <>
      {view === "landing"   && <LandingPage />}
      {view === "dashboard" && <Dashboard />}
      {view === "workspace" && <WorkspaceView />}
    </>
  );
}
