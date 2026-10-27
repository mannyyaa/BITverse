/**
 * Yjs WebSocket collaboration server.
 *
 * Each workspace gets its own in-memory Y.Doc. Clients authenticate via a
 * JWT query parameter (?token=...). Only workspace members are allowed.
 *
 * Wire protocol: standard y-websocket binary messages.
 *
 * Limitations (documented, not faked):
 * - Y.Doc state is held in memory only; a server restart loses collaborative
 *   edits that haven't been flushed to the REST API by the client.
 * - No persistence adapter is wired yet (next step: use y-leveldb or write
 *   Yjs updates into the Snapshot table on disconnect).
 */

import * as http from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync.js";
import * as awarenessProtocol from "y-protocols/awareness.js";
import * as encoding from "lib0/encoding.js";
import * as decoding from "lib0/decoding.js";
import { verifyToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

const messageSync      = 0;
const messageAwareness = 1;

interface Room {
  doc:       Y.Doc;
  awareness: awarenessProtocol.Awareness;
  clients:   Set<WebSocket>;
}

const rooms = new Map<string, Room>();

function getRoom(workspaceId: string): Room {
  let room = rooms.get(workspaceId);
  if (!room) {
    const doc = new Y.Doc();
    room = { doc, awareness: new awarenessProtocol.Awareness(doc), clients: new Set() };
    rooms.set(workspaceId, room);
  }
  return room;
}

function send(ws: WebSocket, buf: Uint8Array) {
  if (ws.readyState === WebSocket.OPEN) ws.send(buf, { binary: true });
}

function broadcastToRoom(room: Room, buf: Uint8Array, except?: WebSocket) {
  room.clients.forEach((client) => {
    if (client !== except) send(client, buf);
  });
}

async function authenticate(
  url: string | undefined,
  workspaceId: string,
): Promise<string | null> {
  if (!url) return null;
  const qs = new URL(url, "ws://localhost").searchParams;
  const token = qs.get("token");
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: payload.sub } },
    });
    return member ? payload.sub : null;
  } catch {
    return null;
  }
}

export function createCollabServer(httpServer: http.Server) {
  const wss = new WebSocketServer({ noServer: true });

  // Upgrade HTTP → WebSocket only on /collab/:workspaceId
  httpServer.on("upgrade", (req, socket, head) => {
    const match = req.url?.match(/^\/collab\/([^/?]+)/);
    if (!match) { socket.destroy(); return; }
    const workspaceId = match[1];

    wss.handleUpgrade(req, socket, head, async (ws) => {
      const userId = await authenticate(req.url, workspaceId);
      if (!userId) {
        ws.close(4001, "Unauthorized");
        return;
      }
      wss.emit("connection", ws, req, workspaceId, userId);
    });
  });

  wss.on("connection", (ws: WebSocket, _req: http.IncomingMessage, workspaceId: string) => {
    const room = getRoom(workspaceId);
    room.clients.add(ws);

    // 1. Send current doc state to the new client
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, room.doc);
    send(ws, encoding.toUint8Array(encoder));

    // 2. Send awareness states
    const awarenessStates = room.awareness.getStates();
    if (awarenessStates.size > 0) {
      const enc = encoding.createEncoder();
      encoding.writeVarUint(enc, messageAwareness);
      encoding.writeVarUint8Array(
        enc,
        awarenessProtocol.encodeAwarenessUpdate(room.awareness, [...awarenessStates.keys()]),
      );
      send(ws, encoding.toUint8Array(enc));
    }

    ws.on("message", (rawData: Buffer | ArrayBuffer | Buffer[]) => {
      const data = Buffer.isBuffer(rawData) ? rawData : Buffer.from(rawData as ArrayBuffer);
      const decoder = decoding.createDecoder(new Uint8Array(data));
      const encoder = encoding.createEncoder();
      const messageType = decoding.readVarUint(decoder);

      if (messageType === messageSync) {
        encoding.writeVarUint(encoder, messageSync);
        const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, room.doc, null);
        if (syncMessageType === syncProtocol.messageYjsSyncStep2 ||
            syncMessageType === syncProtocol.messageYjsUpdate) {
          const buf = encoding.toUint8Array(encoder);
          if (encoding.length(encoder) > 1) broadcastToRoom(room, buf, ws);
        }
        const reply = encoding.toUint8Array(encoder);
        if (encoding.length(encoder) > 1) send(ws, reply);
      } else if (messageType === messageAwareness) {
        const update = decoding.readVarUint8Array(decoder);
        awarenessProtocol.applyAwarenessUpdate(room.awareness, update, ws);
        const enc = encoding.createEncoder();
        encoding.writeVarUint(enc, messageAwareness);
        encoding.writeVarUint8Array(enc, update);
        broadcastToRoom(room, encoding.toUint8Array(enc), ws);
      }
    });

    ws.on("close", () => {
      room.clients.delete(ws);
      awarenessProtocol.removeAwarenessStates(room.awareness, [room.doc.clientID], null);
      if (room.clients.size === 0) rooms.delete(workspaceId);
    });

    ws.on("error", (err) => console.error("[ws error]", err.message));
  });

  console.log(`[collab] WebSocket server attached (upgrade on /collab/:workspaceId)`);
  return wss;
}

export { rooms };
