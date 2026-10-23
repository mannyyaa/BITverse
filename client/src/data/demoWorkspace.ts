/**
 * Demo workspace: Pulse Commerce — E-commerce Architecture
 * All data is illustrative. Clearly separated from real app state.
 */
import type {
  Workspace,
  GraphNode,
  GraphEdge,
  Query,
  TimelineEvent,
  Collaborator,
  FailureScenario,
} from "@/domain/types";

const now = Date.now();
const h = (mins: number) => now - mins * 60 * 1000;

// ── Nodes ────────────────────────────────────────────────────────────────────

export const demoNodes: GraphNode[] = [
  {
    id: "web-client",
    kind: "web-client",
    label: "Web Client",
    status: "healthy",
    position: { x: 60, y: 200 },
    meta: { metric: "~8k users", detail: "Active sessions" },
  },
  {
    id: "cdn",
    kind: "cdn",
    label: "CDN",
    status: "healthy",
    position: { x: 60, y: 340 },
    meta: { metric: "99.9% hit", detail: "Cache ratio" },
  },
  {
    id: "load-balancer",
    kind: "load-balancer",
    label: "Load Balancer",
    status: "healthy",
    position: { x: 280, y: 270 },
    meta: { metric: "2.4k req/s", detail: "Round-robin" },
  },
  {
    id: "api-gateway",
    kind: "api-gateway",
    label: "API Gateway",
    status: "healthy",
    position: { x: 500, y: 270 },
    meta: { metric: "1.2k req/s", detail: "Healthy" },
  },
  {
    id: "product-service",
    kind: "service",
    label: "Product Service",
    status: "healthy",
    position: { x: 720, y: 140 },
    meta: { metric: "340 req/s", detail: "p99: 45ms" },
  },
  {
    id: "order-service",
    kind: "service",
    label: "Order Service",
    status: "healthy",
    position: { x: 720, y: 270 },
    meta: { metric: "180 req/s", detail: "p99: 82ms" },
  },
  {
    id: "payment-service",
    kind: "service",
    label: "Payment Service",
    status: "healthy",
    position: { x: 720, y: 400 },
    meta: { metric: "95 req/s", detail: "p99: 120ms" },
  },
  {
    id: "redis-cache",
    kind: "cache",
    label: "Redis Cache",
    status: "healthy",
    position: { x: 940, y: 140 },
    meta: { metric: "92% hit", detail: "~2ms latency" },
  },
  {
    id: "postgres-db",
    kind: "database",
    label: "PostgreSQL",
    status: "healthy",
    position: { x: 940, y: 310 },
    meta: { metric: "68% capacity", detail: "Primary DB" },
  },
  {
    id: "message-queue",
    kind: "message-queue",
    label: "Message Queue",
    status: "healthy",
    position: { x: 720, y: 530 },
    meta: { metric: "1.2k msgs/s", detail: "RabbitMQ" },
  },
  {
    id: "notification-worker",
    kind: "worker",
    label: "Notification Worker",
    status: "healthy",
    position: { x: 940, y: 530 },
    meta: { metric: "3 instances", detail: "Healthy" },
  },
];

// ── Edges ────────────────────────────────────────────────────────────────────

export const demoEdges: GraphEdge[] = [
  { id: "e-wc-lb",   source: "web-client",     target: "load-balancer",       animated: true },
  { id: "e-cdn-lb",  source: "cdn",             target: "load-balancer",       animated: true },
  { id: "e-lb-apig", source: "load-balancer",   target: "api-gateway",         animated: true },
  { id: "e-apig-ps", source: "api-gateway",     target: "product-service",     animated: true },
  { id: "e-apig-os", source: "api-gateway",     target: "order-service",       animated: true },
  { id: "e-apig-pay",source: "api-gateway",     target: "payment-service",     animated: true },
  { id: "e-ps-rc",   source: "product-service", target: "redis-cache",         animated: true },
  { id: "e-ps-db",   source: "product-service", target: "postgres-db",         animated: true },
  { id: "e-os-db",   source: "order-service",   target: "postgres-db",         animated: true },
  { id: "e-pay-db",  source: "payment-service", target: "postgres-db",         animated: true },
  { id: "e-os-mq",   source: "order-service",   target: "message-queue",       animated: true },
  { id: "e-mq-nw",   source: "message-queue",   target: "notification-worker", animated: true },
];

// ── Queries / Discussions ────────────────────────────────────────────────────

export const demoQueries: Query[] = [
  {
    id: "q-1",
    title: "Is the primary database a single point of failure?",
    body: "We have three services depending on the same PostgreSQL instance. If the primary goes down, the entire checkout flow stops.",
    type: "issue",
    status: "open",
    priority: "critical",
    target: { kind: "node", id: "postgres-db" },
    author: "Aanya",
    createdAt: h(90),
    thread: [
      {
        id: "r-1-1",
        author: "Aanya",
        body: "If the primary instance becomes unavailable, the entire checkout flow may stop. This is high severity.",
        createdAt: h(88),
      },
      {
        id: "r-1-2",
        author: "Rohan",
        body: "We could introduce a read replica and a failover strategy. Adding a standby instance would help mitigate this.",
        createdAt: h(72),
      },
    ],
  },
  {
    id: "q-2",
    title: "Should product reads be cached?",
    body: "Product reads account for ~40% of total traffic. We already have Redis — should we cache catalog queries there?",
    type: "improvement",
    status: "in-discussion",
    priority: "medium",
    target: { kind: "node", id: "product-service" },
    author: "You",
    createdAt: h(120),
    thread: [
      {
        id: "r-2-1",
        author: "Aanya",
        body: "Makes sense. Cache TTL of 60s should be fine for product catalog — inventory is a separate concern.",
        createdAt: h(110),
      },
    ],
  },
  {
    id: "q-3",
    title: "What happens to pending orders if the notification worker goes down?",
    body: "The notification worker consumes from the message queue. If it crashes, do order-placed events build up indefinitely?",
    type: "question",
    status: "resolved",
    priority: "high",
    target: { kind: "node", id: "notification-worker" },
    author: "Rohan",
    assignee: "You",
    createdAt: h(200),
    resolvedAt: h(60),
    thread: [
      {
        id: "r-3-1",
        author: "You",
        body: "Yes, messages will accumulate in the queue with our current config (no TTL). We need DLQ support and consumer restarts.",
        createdAt: h(180),
      },
      {
        id: "r-3-2",
        author: "Rohan",
        body: "Added DLQ config to the worker and set max-retries to 3. Closing this.",
        createdAt: h(60),
      },
    ],
  },
];

// ── Timeline ─────────────────────────────────────────────────────────────────

export const demoTimeline: TimelineEvent[] = [
  {
    id: "t-1",
    kind: "workspace-created",
    description: "Workspace created: Pulse Commerce — E-commerce Architecture",
    author: "Aanya",
    timestamp: h(300),
  },
  {
    id: "t-2",
    kind: "node-added",
    description: "Added Web Client, CDN, Load Balancer, and API Gateway",
    author: "Aanya",
    timestamp: h(290),
    nodeId: "api-gateway",
  },
  {
    id: "t-3",
    kind: "node-added",
    description: "Added Product, Order, and Payment services",
    author: "Rohan",
    timestamp: h(270),
    nodeId: "order-service",
  },
  {
    id: "t-4",
    kind: "node-added",
    description: "Added PostgreSQL database and Redis Cache",
    author: "You",
    timestamp: h(250),
    nodeId: "postgres-db",
  },
  {
    id: "t-5",
    kind: "query-raised",
    description: "Query raised: What happens to pending orders if the notification worker goes down?",
    author: "Rohan",
    timestamp: h(200),
    queryId: "q-3",
  },
  {
    id: "t-6",
    kind: "node-added",
    description: "Added Message Queue and Notification Worker",
    author: "Rohan",
    timestamp: h(180),
    nodeId: "message-queue",
  },
  {
    id: "t-7",
    kind: "architecture-improved",
    description: "Added DLQ config and consumer retry logic to Notification Worker",
    author: "You",
    timestamp: h(170),
    nodeId: "notification-worker",
  },
  {
    id: "t-8",
    kind: "query-resolved",
    description: "Query resolved: Notification worker DLQ strategy implemented",
    author: "You",
    timestamp: h(60),
    queryId: "q-3",
  },
  {
    id: "t-9",
    kind: "query-raised",
    description: "Query raised: Is the primary database a single point of failure?",
    author: "Aanya",
    timestamp: h(90),
    queryId: "q-1",
  },
  {
    id: "t-10",
    kind: "snapshot-saved",
    description: "Architecture snapshot saved: v0.3 — Services connected",
    author: "Aanya",
    timestamp: h(30),
  },
];

// ── Collaborators ─────────────────────────────────────────────────────────────

export const demoCollaborators: Collaborator[] = [
  { id: "c-you",   name: "You",   color: "#55E6FF", initials: "YO", online: true },
  { id: "c-aanya", name: "Aanya", color: "#A78BFA", initials: "AA", online: true },
  { id: "c-rohan", name: "Rohan", color: "#57E3A0", initials: "RO", online: false },
];

// ── Failure Scenarios ────────────────────────────────────────────────────────

export const demoScenarios: FailureScenario[] = [
  {
    id: "s-db-outage",
    kind: "database-outage",
    name: "Database Outage",
    description: "The primary PostgreSQL instance becomes unavailable. All services with direct database dependencies may stop functioning.",
    difficulty: "medium",
    impact: "Data layer — all write operations and direct read queries fail",
    primaryTarget: "postgres-db",
    affectedNodes: ["order-service", "payment-service", "product-service"],
    affectedEdges: ["e-ps-db", "e-os-db", "e-pay-db"],
  },
  {
    id: "s-traffic-spike",
    kind: "traffic-spike",
    name: "Traffic Spike",
    description: "Incoming traffic rises 10x. Exposes capacity constraints in services and the API Gateway.",
    difficulty: "medium",
    impact: "Compute layer — services become overloaded, response times degrade",
    primaryTarget: "api-gateway",
    affectedNodes: ["product-service", "order-service", "load-balancer"],
  },
  {
    id: "s-network-partition",
    kind: "network-partition",
    name: "Network Partition",
    description: "Communication between the API Gateway and backend services is severed. Clients experience request timeouts.",
    difficulty: "hard",
    impact: "Network layer — inter-service communication fails",
    primaryTarget: "api-gateway",
    affectedEdges: ["e-apig-ps", "e-apig-os", "e-apig-pay"],
  },
  {
    id: "s-service-failure",
    kind: "service-failure",
    name: "Service Failure",
    description: "The Order Service stops responding. Orders cannot be placed and the message queue starts building up.",
    difficulty: "easy",
    impact: "Application layer — order placement unavailable, queue backlog grows",
    primaryTarget: "order-service",
    affectedEdges: ["e-apig-os", "e-os-db", "e-os-mq"],
  },
];

// ── Full demo workspace ───────────────────────────────────────────────────────

export const demoWorkspace: Workspace = {
  id: "ws-pulse-commerce",
  name: "Pulse Commerce",
  description: "E-commerce Architecture",
  createdAt: h(300),
  updatedAt: h(30),
  graph: { nodes: demoNodes, edges: demoEdges },
  queries: demoQueries,
  timeline: demoTimeline,
  collaborators: demoCollaborators,
  scenarios: demoScenarios,
};
