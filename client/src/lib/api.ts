/**
 * Typed API client for the BITverse backend.
 *
 * All methods:
 * - Throw an ApiClientError on non-2xx responses (message = server error text).
 * - Read/write the JWT from localStorage under "bitverse.token".
 * - Are safe to call without a token (will 401 and throw ApiClientError).
 *
 * Usage:
 *   import { api } from "@/lib/api";
 *   const { token, user } = await api.auth.login(email, password);
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "bitverse.token";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); }
  catch { return null; }
}

export function setToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); }
  catch { /* storage unavailable */ }
}

export function clearToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); }
  catch { /* storage unavailable */ }
}

// ── Fetch wrapper ─────────────────────────────────────────────────────────────

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) {
    throw new ApiClientError(res.status, data?.error ?? "Request failed");
  }
  return data as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

export interface ApiWorkspace {
  id: string;
  name: string;
  description: string;
  graphJson: string;
  scenariosJson: string;
  timelineJson: string;
  mode: string;
  createdAt: string;
  updatedAt: string;
  members?: ApiMember[];
}

export interface ApiMember {
  userId: string;
  name: string;
  email: string;
  avatarColor: string;
  role: string;
}

export interface ApiQuery {
  id: string;
  title: string;
  body: string;
  type: string;
  status: string;
  priority: string;
  targetKind: string;
  targetId: string;
  assigneeId?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  author: { id: string; name: string; avatarColor: string };
  thread: ApiReply[];
}

export interface ApiReply {
  id: string;
  body: string;
  author: { id: string; name: string; avatarColor: string };
  createdAt: string;
}

export interface ApiSnapshot {
  id: string;
  name: string;
  description: string;
  graphJson?: string;
  yjsState?: string | null;
  createdAt: string;
}

export interface ApiChallengeRecord {
  id: string;
  scenarioId: string;
  scenarioName: string;
  outcome: string;
  impactScore: number;
  createdAt: string;
}

// ── API namespace ─────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: (email: string, name: string, password: string) =>
      req<{ token: string; user: ApiUser }>("POST", "/api/auth/register", { email, name, password }, false),

    login: (email: string, password: string) =>
      req<{ token: string; user: ApiUser }>("POST", "/api/auth/login", { email, password }, false),

    me: () => req<ApiUser>("GET", "/api/auth/me"),
  },

  workspaces: {
    list: () =>
      req<{ workspaces: ApiWorkspace[] }>("GET", "/api/workspaces"),

    create: (data: { name: string; description?: string; graphJson?: string }) =>
      req<ApiWorkspace>("POST", "/api/workspaces", data),

    get: (id: string) =>
      req<ApiWorkspace & { members: ApiMember[] }>("GET", `/api/workspaces/${id}`),

    update: (id: string, data: Partial<Pick<ApiWorkspace, "name" | "description" | "graphJson" | "scenariosJson" | "timelineJson" | "mode">>) =>
      req<ApiWorkspace>("PATCH", `/api/workspaces/${id}`, data),

    delete: (id: string) =>
      req<void>("DELETE", `/api/workspaces/${id}`),

    invite: (id: string, email: string, role: "editor" | "viewer" = "editor") =>
      req<{ userId: string; role: string }>("POST", `/api/workspaces/${id}/members`, { email, role }),
  },

  snapshots: {
    list: (workspaceId: string) =>
      req<{ snapshots: ApiSnapshot[] }>("GET", `/api/workspaces/${workspaceId}/snapshots`),

    save: (workspaceId: string, data: { name: string; description?: string; graphJson: string; yjsState?: string }) =>
      req<ApiSnapshot>("POST", `/api/workspaces/${workspaceId}/snapshots`, data),

    get: (workspaceId: string, snapshotId: string) =>
      req<ApiSnapshot>("GET", `/api/workspaces/${workspaceId}/snapshots/${snapshotId}`),

    restore: (workspaceId: string, snapshotId: string) =>
      req<{ ok: boolean; graphJson: string }>("POST", `/api/workspaces/${workspaceId}/snapshots/${snapshotId}/restore`),
  },

  queries: {
    list: (workspaceId: string) =>
      req<{ queries: ApiQuery[] }>("GET", `/api/workspaces/${workspaceId}/queries`),

    create: (workspaceId: string, data: {
      title: string; body?: string; type?: string; priority?: string;
      targetKind?: string; targetId: string; assigneeId?: string;
    }) =>
      req<ApiQuery>("POST", `/api/workspaces/${workspaceId}/queries`, data),

    updateStatus: (workspaceId: string, queryId: string, status: string) =>
      req<ApiQuery>("PATCH", `/api/workspaces/${workspaceId}/queries/${queryId}`, { status }),

    reply: (workspaceId: string, queryId: string, body: string) =>
      req<ApiReply>("POST", `/api/workspaces/${workspaceId}/queries/${queryId}/replies`, { body }),
  },

  challenges: {
    record: (workspaceId: string, data: {
      scenarioId: string; scenarioName: string;
      affectedNodes?: string[]; outcome?: string; impactScore?: number;
    }) =>
      req<ApiChallengeRecord>("POST", `/api/workspaces/${workspaceId}/challenges`, data),

    list: (workspaceId: string) =>
      req<{ records: ApiChallengeRecord[] }>("GET", `/api/workspaces/${workspaceId}/challenges`),
  },
};
