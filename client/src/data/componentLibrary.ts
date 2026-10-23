import type { ComponentKind } from "@/domain/types";

export interface ComponentMeta {
  kind: ComponentKind;
  label: string;
  description: string;
  category: "Application" | "Compute" | "Data" | "Messaging" | "Infrastructure";
  /** Tailwind-compatible hex accent for the category */
  color: string;
}

export const COMPONENT_LIBRARY: ComponentMeta[] = [
  // Application
  { kind: "web-client",     label: "Web Client",          description: "Browser-based frontend application",          category: "Application",    color: "#55E6FF" },
  { kind: "mobile-client",  label: "Mobile Client",       description: "iOS / Android mobile application",            category: "Application",    color: "#55E6FF" },
  { kind: "api-gateway",    label: "API Gateway",         description: "Unified API entry point and routing layer",   category: "Application",    color: "#55E6FF" },
  { kind: "load-balancer",  label: "Load Balancer",       description: "Distributes traffic across service instances", category: "Application",   color: "#55E6FF" },
  // Compute
  { kind: "service",        label: "Service",             description: "A backend microservice or application",       category: "Compute",        color: "#A78BFA" },
  { kind: "worker",         label: "Worker",              description: "Background processing service",               category: "Compute",        color: "#A78BFA" },
  { kind: "serverless",     label: "Serverless Function", description: "Event-driven, auto-scaling function",         category: "Compute",        color: "#A78BFA" },
  // Data
  { kind: "database",       label: "Database",            description: "Persistent relational or document store",     category: "Data",           color: "#57E3A0" },
  { kind: "cache",          label: "Cache",               description: "In-memory fast-access data layer",            category: "Data",           color: "#57E3A0" },
  { kind: "object-storage", label: "Object Storage",      description: "Blob / file storage (S3-compatible)",         category: "Data",           color: "#57E3A0" },
  // Messaging
  { kind: "message-queue",  label: "Message Queue",       description: "Async message broker (RabbitMQ, SQS)",        category: "Messaging",      color: "#FFBF69" },
  { kind: "event-stream",   label: "Event Stream",        description: "High-throughput event log (Kafka)",           category: "Messaging",      color: "#FFBF69" },
  // Infrastructure
  { kind: "cdn",            label: "CDN",                 description: "Edge network for global content delivery",    category: "Infrastructure", color: "#98A6BD" },
  { kind: "external-api",   label: "External API",        description: "Third-party API or external service",         category: "Infrastructure", color: "#98A6BD" },
  { kind: "firewall",       label: "Firewall",            description: "Network security and access control layer",   category: "Infrastructure", color: "#98A6BD" },
];

export const CATEGORIES = ["Application", "Compute", "Data", "Messaging", "Infrastructure"] as const;
