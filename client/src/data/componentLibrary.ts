import type { ComponentKind } from "@/domain/types";

export interface ComponentMeta {
  kind: ComponentKind;
  label: string;
  /** One-line explanation. */
  description: string;
  /** When you'd reach for this component (shown in its tooltip). */
  whenToUse: string;
  category: ComponentCategory;
}

export type ComponentCategory =
  | "Clients"
  | "Traffic"
  | "Compute"
  | "Data"
  | "Messaging"
  | "Security & External";

export const CATEGORIES: ComponentCategory[] = [
  "Clients",
  "Traffic",
  "Compute",
  "Data",
  "Messaging",
  "Security & External",
];

export const CATEGORY_COLOR: Record<ComponentCategory, string> = {
  "Clients": "var(--cat-application)",
  "Traffic": "var(--cat-compute)",
  "Compute": "var(--cat-compute)",
  "Data": "var(--cat-data)",
  "Messaging": "var(--cat-messaging)",
  "Security & External": "var(--cat-infrastructure)",
};

export const COMPONENT_LIBRARY: ComponentMeta[] = [
  // Clients
  { kind: "web-client",    label: "Web Client",      description: "Browser-based frontend application",       whenToUse: "User-facing web app (React, Vue, etc.).",          category: "Clients" },
  { kind: "mobile-client", label: "Mobile Client",    description: "iOS / Android mobile application",         whenToUse: "Native or cross-platform mobile app.",            category: "Clients" },
  // Traffic
  { kind: "cdn",           label: "CDN",              description: "Edge network for global content delivery", whenToUse: "Serve static assets close to users.",             category: "Traffic" },
  { kind: "load-balancer", label: "Load Balancer",    description: "Distributes traffic across instances",      whenToUse: "Spread load over multiple service copies.",      category: "Traffic" },
  { kind: "api-gateway",   label: "API Gateway",      description: "Unified API entry point and routing",       whenToUse: "Single entry point: auth, rate limit, routing.",  category: "Traffic" },
  // Compute
  { kind: "service",       label: "Service",          description: "A backend microservice or application",     whenToUse: "Core business logic, always-on process.",         category: "Compute" },
  { kind: "worker",        label: "Worker",            description: "Background processing service",             whenToUse: "Consumes a queue, runs async jobs.",             category: "Compute" },
  { kind: "serverless",    label: "Serverless Function", description: "Event-driven, auto-scaling function",     whenToUse: "Short-lived, scale-to-zero handlers.",           category: "Compute" },
  // Data
  { kind: "database",      label: "Database",         description: "Persistent relational or document store",    whenToUse: "Durable source of truth for records.",           category: "Data" },
  { kind: "cache",         label: "Cache",            description: "In-memory fast-access data layer",          whenToUse: "Speed up reads, offload a database.",            category: "Data" },
  { kind: "object-storage", label: "Object Storage",   description: "Blob / file storage (S3-compatible)",       whenToUse: "Store images, uploads, large files.",           category: "Data" },
  // Messaging
  { kind: "message-queue", label: "Message Queue",    description: "Async message broker (RabbitMQ, SQS)",       whenToUse: "Decouple producers/consumers with retries.",     category: "Messaging" },
  { kind: "event-stream",  label: "Event Stream",     description: "High-throughput event log (Kafka)",         whenToUse: "Event sourcing, fan-out to many consumers.",     category: "Messaging" },
  // Security & External
  { kind: "firewall",      label: "Firewall",         description: "Network security and access control",      whenToUse: "Restrict ingress/egress between zones.",        category: "Security & External" },
  { kind: "external-api",  label: "External API",     description: "Third-party API or external service",       whenToUse: "Payments, email, SMS, partner APIs.",          category: "Security & External" },
];
