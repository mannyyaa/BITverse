/**
 * Returns an SVG icon for each component kind.
 * Each category uses a consistent visual language.
 */
import type { ComponentKind } from "@/domain/types";

interface Props {
  kind: ComponentKind;
  size?: number;
  className?: string;
}

export function NodeIcon({ kind, size = 20, className = "" }: Props) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className };

  switch (kind) {
    case "web-client":
      return <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M2 7h20"/></svg>;
    case "mobile-client":
      return <svg {...props}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>;
    case "api-gateway":
      return <svg {...props}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
    case "load-balancer":
      return <svg {...props}><path d="M12 5v14M5 12H2M22 12h-3"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M5 8l-3 4 3 4M19 8l3 4-3 4"/></svg>;
    case "service":
      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>;
    case "worker":
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>;
    case "serverless":
      return <svg {...props}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
    case "database":
      return <svg {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
    case "cache":
      return <svg {...props}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/></svg>;
    case "object-storage":
      return <svg {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
    case "message-queue":
      return <svg {...props}><path d="M3 6h18M3 12h18M3 18h18"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>;
    case "event-stream":
      return <svg {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
    case "cdn":
      return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
    case "external-api":
      return <svg {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
    case "firewall":
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>;
    default:
      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="3"/></svg>;
  }
}
