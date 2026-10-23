import { useUIStore } from "@/store/uiStore";
import { LandingPage } from "@/components/landing/LandingPage";
import { Dashboard } from "@/components/workspaces/Dashboard";
import { WorkspaceView } from "@/components/workspaces/WorkspaceView";

export function App() {
  const view = useUIStore((s) => s.view);

  return (
    <>
      {view === "landing"   && <LandingPage />}
      {view === "dashboard" && <Dashboard />}
      {view === "workspace" && <WorkspaceView />}
    </>
  );
}
