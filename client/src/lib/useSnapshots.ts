/**
 * Snapshot operations — save + restore against the server when authenticated,
 * fall back gracefully to the local store when offline.
 */
import { useCallback, useState } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { api, type ApiSnapshot } from "@/lib/api";

export function useSnapshots(remoteWorkspaceId: string | null) {
  const workspace      = useWorkspaceStore((s) => s.workspace);
  const addTimeline    = useWorkspaceStore((s) => s.addTimelineEvent);
  const replaceGraph   = useWorkspaceStore((s) => s.replaceGraph);
  const isAuth         = useAuthStore((s) => s.isAuthenticated);
  const serverStatus   = useAuthStore((s) => s.serverStatus);

  const [snapshots, setSnapshots] = useState<ApiSnapshot[]>([]);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const canSync = isAuth && serverStatus === "online" && !!remoteWorkspaceId;

  const loadSnapshots = useCallback(async () => {
    if (!canSync) return;
    try {
      const { snapshots: list } = await api.snapshots.list(remoteWorkspaceId!);
      setSnapshots(list);
    } catch {
      setError("Could not load snapshots");
    }
  }, [canSync, remoteWorkspaceId]);

  const saveSnapshot = useCallback(async (name: string, description = "") => {
    setIsSaving(true);
    setError(null);
    try {
      const graphJson = JSON.stringify(workspace.graph);
      if (canSync) {
        const snap = await api.snapshots.save(remoteWorkspaceId!, { name, description, graphJson });
        setSnapshots((prev) => [snap, ...prev]);
      }
      addTimeline({ kind: "snapshot-saved", description: `Snapshot saved: "${name}"`, author: "You" });
    } catch {
      setError("Failed to save snapshot");
    } finally {
      setIsSaving(false);
    }
  }, [canSync, remoteWorkspaceId, workspace.graph, addTimeline]);

  const restoreSnapshot = useCallback(async (snapshotId: string) => {
    if (!canSync) { setError("Sign in to restore snapshots"); return; }
    setError(null);
    try {
      const snap = await api.snapshots.get(remoteWorkspaceId!, snapshotId);
      if (!snap.graphJson) return;
      const graph = JSON.parse(snap.graphJson);
      replaceGraph(graph);
      addTimeline({ kind: "snapshot-saved", description: `Snapshot restored: "${snap.name}"`, author: "You" });
    } catch {
      setError("Failed to restore snapshot");
    }
  }, [canSync, remoteWorkspaceId, replaceGraph, addTimeline]);

  return { snapshots, isSaving, error, loadSnapshots, saveSnapshot, restoreSnapshot };
}
