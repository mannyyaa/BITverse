/**
 * Design token helpers — maps domain values to CSS variables.
 * Keep this file import-free from React/DOM.
 */
import type { ComponentKind, NodeStatus, Priority } from "@/domain/types";

/** Returns the CSS variable name (with var()) for a node's category accent colour. */
export function kindColor(kind: ComponentKind): string {
  switch (kind) {
    case "web-client":
    case "mobile-client":
    case "api-gateway":
    case "load-balancer":
      return "var(--cat-application)";
    case "service":
    case "worker":
    case "serverless":
      return "var(--cat-compute)";
    case "database":
    case "cache":
    case "object-storage":
      return "var(--cat-data)";
    case "message-queue":
    case "event-stream":
      return "var(--cat-messaging)";
    case "cdn":
    case "external-api":
    case "firewall":
      return "var(--cat-infrastructure)";
    default:
      return "var(--text-secondary)";
  }
}

export function statusColor(status: NodeStatus): string {
  return `var(--status-${status})`;
}

export function priorityColor(priority: Priority): string {
  return `var(--priority-${priority})`;
}

export const STATUS_LABEL: Record<NodeStatus, string> = {
  healthy:    "Healthy",
  degraded:   "Degraded",
  overloaded: "Overloaded",
  down:       "Down",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low:      "Low",
  medium:   "Medium",
  high:     "High",
  critical: "Critical",
};
