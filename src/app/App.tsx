import { AppHeader } from "@/app/components/AppHeader";
import { CanvasStage } from "@/features/canvas/CanvasStage";
import { QueryPanel } from "@/features/queries/QueryPanel";
import { FailureLabPanel } from "@/features/failureLab/FailureLabPanel";
import { TimelinePanel } from "@/features/timeline/TimelinePanel";

/**
 * Workspace shell. The layout itself communicates the architecture:
 * a canvas region plus a sidebar of feature panels. Each panel is a thin
 * placeholder today; its real implementation lands in its numbered phase.
 */
export function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <section className="app-canvas">
          <CanvasStage />
        </section>
        <aside className="app-sidebar">
          <QueryPanel />
          <FailureLabPanel />
          <TimelinePanel />
        </aside>
      </main>
    </div>
  );
}
