/**
 * Starter architectures for "Start with an example". Each is a compact
 * CanvasGraph; loading one replaces the current canvas (a single undoable
 * step) so a first-time user can explore a real system immediately.
 */
import type { ArchitectureNode, CanvasEdge, CanvasGraph } from "@/domain/types";

const e = (id: string, source: string, target: string): CanvasEdge => ({
  id, source, target, kind: "dataflow", animated: true,
});

const ecommerce: CanvasGraph = {
  nodes: [
    { id: "t-wc", type: "architecture", kind: "web-client",   label: "Web Client",      status: "healthy", position: { x: 40, y: 200 },  meta: { metric: "Users", detail: "Active sessions" } },
    { id: "t-cdn", type: "architecture", kind: "cdn",         label: "CDN",              status: "healthy", position: { x: 40, y: 320 },  meta: { detail: "Edge cache" } },
    { id: "t-lb", type: "architecture", kind: "load-balancer", label: "Load Balancer",  status: "healthy", position: { x: 260, y: 260 }, meta: { detail: "Round-robin" } },
    { id: "t-gw", type: "architecture", kind: "api-gateway", label: "API Gateway",      status: "healthy", position: { x: 470, y: 260 }, meta: { detail: "Routing + auth" } },
    { id: "t-ps", type: "architecture", kind: "service",     label: "Product Service",  status: "healthy", position: { x: 690, y: 160 }, meta: { detail: "Catalog reads" } },
    { id: "t-os", type: "architecture", kind: "service",     label: "Order Service",    status: "healthy", position: { x: 690, y: 300 }, meta: { detail: "Checkout" } },
    { id: "t-rc", type: "architecture", kind: "cache",       label: "Redis Cache",      status: "healthy", position: { x: 900, y: 160 }, meta: { detail: "~2ms" } },
    { id: "t-db", type: "architecture", kind: "database",    label: "PostgreSQL",       status: "healthy", position: { x: 900, y: 300 }, meta: { detail: "Primary DB" } },
  ] satisfies ArchitectureNode[],
  edges: [
    e("t-e1", "t-wc", "t-lb"), e("t-e2", "t-cdn", "t-lb"), e("t-e3", "t-lb", "t-gw"),
    e("t-e4", "t-gw", "t-ps"), e("t-e5", "t-gw", "t-os"),
    e("t-e6", "t-ps", "t-rc"), e("t-e7", "t-ps", "t-db"), e("t-e8", "t-os", "t-db"),
  ],
  strokes: [],
};

const chat: CanvasGraph = {
  nodes: [
    { id: "c-mc", type: "architecture", kind: "mobile-client", label: "Mobile Client", status: "healthy", position: { x: 40, y: 220 },  meta: { detail: "iOS / Android" } },
    { id: "c-gw", type: "architecture", kind: "api-gateway",   label: "API Gateway",   status: "healthy", position: { x: 260, y: 220 }, meta: { detail: "WS + REST" } },
    { id: "c-cs", type: "architecture", kind: "service",      label: "Chat Service",  status: "healthy", position: { x: 470, y: 160 }, meta: { detail: "Presence + routing" } },
    { id: "c-db", type: "architecture", kind: "database",     label: "Message Store",  status: "healthy", position: { x: 690, y: 160 }, meta: { detail: "History" } },
    { id: "c-mq", type: "architecture", kind: "message-queue", label: "Message Queue", status: "healthy", position: { x: 470, y: 320 }, meta: { detail: "Fan-out" } },
    { id: "c-wk", type: "architecture", kind: "worker",       label: "Push Worker",   status: "healthy", position: { x: 690, y: 320 }, meta: { detail: "Offline push" } },
  ] satisfies ArchitectureNode[],
  edges: [
    e("c-e1", "c-mc", "c-gw"), e("c-e2", "c-gw", "c-cs"),
    e("c-e3", "c-cs", "c-db"), e("c-e4", "c-cs", "c-mq"), e("c-e5", "c-mq", "c-wk"),
  ],
  strokes: [],
};

const shortener: CanvasGraph = {
  nodes: [
    { id: "u-wc", type: "architecture", kind: "web-client",   label: "Web Client",   status: "healthy", position: { x: 40, y: 220 },  meta: { detail: "Browser" } },
    { id: "u-gw", type: "architecture", kind: "api-gateway",  label: "API Gateway",   status: "healthy", position: { x: 260, y: 220 }, meta: { detail: "Rate limit" } },
    { id: "u-sv", type: "architecture", kind: "service",     label: "URL Service",    status: "healthy", position: { x: 470, y: 220 }, meta: { detail: "Shorten / resolve" } },
    { id: "u-ca", type: "architecture", kind: "cache",       label: "Cache",          status: "healthy", position: { x: 690, y: 120 }, meta: { detail: "Hot redirects" } },
    { id: "u-db", type: "architecture", kind: "database",    label: "PostgreSQL",     status: "healthy", position: { x: 690, y: 220 }, meta: { detail: "URL mapping" } },
    { id: "u-es", type: "architecture", kind: "event-stream", label: "Event Stream",   status: "healthy", position: { x: 690, y: 340 }, meta: { detail: "Click events" } },
    { id: "u-wk", type: "architecture", kind: "worker",       label: "Analytics Worker", status: "healthy", position: { x: 900, y: 340 }, meta: { detail: "Aggregation" } },
  ] satisfies ArchitectureNode[],
  edges: [
    e("u-e1", "u-wc", "u-gw"), e("u-e2", "u-gw", "u-sv"),
    e("u-e3", "u-sv", "u-ca"), e("u-e4", "u-sv", "u-db"),
    e("u-e5", "u-sv", "u-es"), e("u-e6", "u-es", "u-wk"),
  ],
  strokes: [],
};

export interface ExampleTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  graph: CanvasGraph;
}

export const EXAMPLE_TEMPLATES: ExampleTemplate[] = [
  { id: "ecommerce", name: "E-commerce", emoji: "🛒", description: "Catalog, checkout, cache, and a primary DB.", graph: ecommerce },
  { id: "chat", name: "Chat App", emoji: "💬", description: "Realtime chat with a queue and push worker.", graph: chat },
  { id: "shortener", name: "URL Shortener", emoji: "🔗", description: "Shorten, cache hot redirects, stream clicks.", graph: shortener },
];
