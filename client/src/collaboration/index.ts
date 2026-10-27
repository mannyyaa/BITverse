/**
 * BITverse real-time collaboration layer.
 *
 * Uses Yjs + y-websocket.  The server (server/src/collab/wsServer.ts) accepts
 * connections at  ws://host/collab/:workspaceId?token=JWT
 *
 * Architecture
 * ─────────────
 * Components NEVER touch the Y.Doc directly.  They read/write through the
 * existing Zustand store.  This module syncs the Y.Doc ↔ store in both
 * directions so the change is transparent to the rest of the UI.
 *
 * Status: IMPLEMENTED (server + client wired).
 * Tested: two browser tabs on the same machine share the same Y.Doc.
 *
 * Not yet implemented:
 * - Persistence adapter (Yjs state is in-memory on the server; clients flush
 *   to the REST API via useWorkspaceSync).
 * - WebRTC proximity audio (deferred — see README).
 */

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { getToken } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { CanvasGraph } from "@/domain/types";

const WS_BASE = (import.meta.env.VITE_WS_URL ?? "ws://localhost:3001").replace(/\/$/, "");

interface CollabSession {
  doc:      Y.Doc;
  provider: WebsocketProvider;
  destroy:  () => void;
}

let activeSession: CollabSession | null = null;

/**
 * Start a collaboration session for a workspace.
 * Safe to call multiple times — destroys the previous session first.
 *
 * @param workspaceId  Server workspace ID (the collab room key)
 * @returns A destroy() function to clean up on unmount
 */
export function startCollabSession(workspaceId: string): () => void {
  // Clean up any existing session
  if (activeSession) {
    activeSession.destroy();
    activeSession = null;
  }

  const token = getToken();
  if (!token) {
    console.warn("[collab] No auth token — real-time collaboration unavailable");
    return () => {};
  }

  const doc      = new Y.Doc();
  const wsUrl    = `${WS_BASE}/collab/${workspaceId}?token=${encodeURIComponent(token)}`;
  const provider = new WebsocketProvider(wsUrl, workspaceId, doc, { connect: true });

  // The shared type that holds the serialised graph
  const yGraph   = doc.getMap<string>("graph");

  // ── Doc → Store (inbound changes from other clients) ─────────────────────
  yGraph.observe(() => {
    const raw = yGraph.get("json");
    if (!raw) return;
    try {
      const incoming: CanvasGraph = JSON.parse(raw);
      const { workspace } = useWorkspaceStore.getState();
      // Only apply if the incoming graph actually differs (avoid echo)
      if (JSON.stringify(workspace.graph) !== raw) {
        useWorkspaceStore.getState().replaceGraph(incoming);
      }
    } catch {
      // Corrupt update — ignore
    }
  });

  // ── Store → Doc (outbound changes from this client) ───────────────────────
  const unsubscribe = useWorkspaceStore.subscribe((state, prev) => {
    if (state.workspace.graph === prev.workspace.graph) return;
    doc.transact(() => {
      yGraph.set("json", JSON.stringify(state.workspace.graph));
    });
  });

  const destroy = () => {
    unsubscribe();
    provider.destroy();
    doc.destroy();
    activeSession = null;
  };

  provider.on("status", ({ status }: { status: string }) => {
    console.log(`[collab] ${workspaceId} — ${status}`);
  });

  activeSession = { doc, provider, destroy };
  return destroy;
}

/** Expose awareness so the WorkspaceView can show remote cursors. */
export function getAwareness() {
  return activeSession?.provider.awareness ?? null;
}
