/**
 * useWorkspaceSync — syncs the local Zustand workspace to the backend.
 *
 * Strategy:
 * - If the server is unreachable, all ops succeed locally (localStorage fallback).
 * - If the user is authenticated, graph changes are debounced and pushed to
 *   PATCH /api/workspaces/:id every 3 seconds.
 * - On mount, if the user is authenticated and the server is online, the
 *   workspace list is fetched and the freshest matching workspace is offered.
 *
 * This hook is mounted once in WorkspaceView and runs silently in the background.
 */
import { useEffect, useRef, useCallback } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { api, ApiClientError } from "@/lib/api";

const DEBOUNCE_MS = 3000;

export function useWorkspaceSync() {
  const workspace    = useWorkspaceStore((s) => s.workspace);
  const isAuth       = useAuthStore((s) => s.isAuthenticated);
  const serverStatus = useAuthStore((s) => s.serverStatus);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteIdRef  = useRef<string | null>(null); // server workspace id

  // One-time: on auth + server online, try to load matching workspace from server
  useEffect(() => {
    if (!isAuth || serverStatus !== "online") return;

    (async () => {
      try {
        const { workspaces } = await api.workspaces.list();
        const match = workspaces.find((w) => w.name === workspace.name);
        if (match) {
          remoteIdRef.current = match.id;
          // Don't overwrite local edits; only update the remote id reference.
        } else {
          // Create the workspace on the server from local state
          const created = await api.workspaces.create({
            name: workspace.name,
            description: workspace.description ?? "",
            graphJson: JSON.stringify(workspace.graph),
          });
          remoteIdRef.current = created.id;
        }
      } catch (err) {
        // Server unavailable or auth expired — stay local
        if (!(err instanceof ApiClientError)) console.warn("[sync] server unreachable");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, serverStatus]);

  // Debounced push on every workspace.graph change
  const flush = useCallback(async () => {
    if (!isAuth || serverStatus !== "online" || !remoteIdRef.current) return;
    try {
      await api.workspaces.update(remoteIdRef.current, {
        graphJson:     JSON.stringify(workspace.graph),
        timelineJson:  JSON.stringify(workspace.timeline),
        scenariosJson: JSON.stringify(workspace.scenarios),
      });
    } catch {
      // Silent — localStorage always has the latest copy
    }
  }, [isAuth, serverStatus, workspace]);

  useEffect(() => {
    if (!isAuth || serverStatus !== "online") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [workspace.graph, flush, isAuth, serverStatus]);

  return { remoteId: remoteIdRef.current };
}
