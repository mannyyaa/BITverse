/**
 * Deterministic, local-first architecture lint rules for BITverse.
 *
 * These checks intentionally inspect only the graph structure. They do not
 * claim to validate runtime availability, security, capacity, or correctness.
 * Inputs are accepted as unknown so the rules can work with both the domain
 * graph and React Flow-style nodes/edges without coupling to a canvas library.
 */

export type HealthSeverity = "critical" | "warning" | "info";

export interface HealthIssue {
  id: string;
  severity: HealthSeverity;
  title: string;
  description: string;
  recommendation: string;
  nodeId?: string;
  edgeId?: string;
  targetLabel?: string;
}

interface NormalizedNode {
  id: string;
  kind: string;
  label: string;
}

interface NormalizedEdge {
  id: string;
  source: string;
  target: string;
}

const STORAGE_KINDS = new Set(["database", "cache", "object-storage", "storage"]);
const ENTRY_KINDS = new Set([
  "web-client",
  "mobile-client",
  "api-gateway",
  "load-balancer",
]);
const DECORATIVE_KINDS = new Set([
  "text", "shape", "sticky", "sticky-note", "stickynote", "note", "annotation",
  "freehand", "drawing", "rectangle", "ellipse", "circle", "diamond",
  "line", "arrow", "callout", "group",
]);
const APPLICATION_KINDS = new Set([
  "web-client",
  "mobile-client",
  "api-gateway",
  "service",
  "worker",
  "serverless",
  "external-api",
]);
const SEVERITY_RANK: Record<HealthSeverity, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function readText(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function normalizeKind(value: string): string {
  return value.toLowerCase().trim().replace(/[ _]+/g, "-");
}

function rawNodeKind(item: Record<string, unknown>, data: Record<string, unknown> | null): string {
  return normalizeKind(readText(
    item.kind,
    data?.kind,
    item.componentKind,
    data?.componentKind,
    item.componentType,
    data?.componentType,
    item.type,
    data?.type,
  ) ?? "component");
}

function isDecorativeNode(value: unknown): boolean {
  const item = record(value);
  if (!item) return false;
  const data = record(item.data);
  return DECORATIVE_KINDS.has(rawNodeKind(item, data));
}

function normalizeNode(value: unknown, index: number): NormalizedNode | null {
  const item = record(value);
  if (!item) return null;
  const data = record(item.data);
  const id = readText(item.id);
  if (!id) return null;

  const kind = rawNodeKind(item, data);
  // Sticky notes, freehand drawings, and shapes are annotations, not system components.
  if (DECORATIVE_KINDS.has(kind)) return null;
  const rawLabel = readText(
    item.label,
    item.name,
    data?.label,
    data?.title,
    data?.text,
    data?.content,
    data?.name,
  );
  const fallbackLabel = kind === "component" ? `Component ${index + 1}` : kind.replace(/-/g, " ");

  return { id, kind, label: rawLabel ?? fallbackLabel };
}

function normalizeEdge(value: unknown, index: number): NormalizedEdge | null {
  const item = record(value);
  if (!item) return null;
  const rawKind = readText(item.kind);
  // Brainstorm arrows are freeform annotations, not architecture data flows.
  if (rawKind && normalizeKind(rawKind) !== "dataflow") return null;
  const id = readText(item.id) ?? `edge-${index + 1}`;
  const source = readText(item.source);
  const target = readText(item.target);
  if (!source || !target) return null;
  return { id, source, target };
}

function issue(
  values: Omit<HealthIssue, "id"> & { id: string },
): HealthIssue {
  return values;
}

/** Run all deterministic structural checks against one architecture graph. */
export function analyzeArchitecture(
  rawNodes: readonly unknown[],
  rawEdges: readonly unknown[],
): HealthIssue[] {
  const decorativeIds = new Set(
    rawNodes
      .filter(isDecorativeNode)
      .map((node) => readText(record(node)?.id))
      .filter((id): id is string => Boolean(id)),
  );
  const nodes = rawNodes
    .map((node, index) => normalizeNode(node, index))
    .filter((node): node is NormalizedNode => node !== null);
  const edges = rawEdges
    .map((edge, index) => normalizeEdge(edge, index))
    .filter((edge): edge is NormalizedEdge => edge !== null)
    .filter((edge) => !decorativeIds.has(edge.source) && !decorativeIds.has(edge.target));

  const issues: HealthIssue[] = [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, 0]));

  if (nodes.length === 0) {
    return [issue({
      id: "empty-architecture",
      severity: "info",
      title: "Your canvas is empty",
      description: "There are no components to review yet, so structural checks are limited.",
      recommendation: "Add a client, service, data store, or other system component to begin modelling the architecture.",
    })];
  }

  // Broken references are critical because the connection cannot be interpreted.
  for (const edge of edges) {
    const sourceExists = nodeById.has(edge.source);
    const targetExists = nodeById.has(edge.target);
    if (!sourceExists || !targetExists) {
      // The edge is still drawn against any surviving endpoint, so do not add
      // a second generic “isolated” warning for that same visible connector.
      if (sourceExists) {
        degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
        outgoing.set(edge.source, (outgoing.get(edge.source) ?? 0) + 1);
      }
      if (targetExists) degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);

      const existingNode = sourceExists ? nodeById.get(edge.source) : nodeById.get(edge.target);
      issues.push(issue({
        id: `dangling-edge-${edge.id}`,
        severity: "critical",
        title: "Connection references a missing component",
        description: `The connector ${edge.source} → ${edge.target} points to a component that is not present in this canvas.`,
        recommendation: "Reconnect the edge to an existing component or delete the stale connector.",
        nodeId: existingNode?.id,
        edgeId: edge.id,
        targetLabel: existingNode?.label,
      }));
      continue;
    }

    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
    outgoing.set(edge.source, (outgoing.get(edge.source) ?? 0) + 1);
  }

  // Duplicate directed links add visual noise and can imply repeated data flow.
  const seenPairs = new Set<string>();
  for (const edge of edges) {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) continue;
    const pair = `${edge.source}\u0000${edge.target}`;
    if (seenPairs.has(pair)) {
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);
      issues.push(issue({
        id: `duplicate-edge-${edge.id}`,
        severity: "warning",
        title: "Duplicate connection",
        description: `${source?.label ?? edge.source} and ${target?.label ?? edge.target} are connected more than once in the same direction.`,
        recommendation: "Keep one connector unless the separate links represent intentionally different protocols or flows; label those flows clearly if so.",
        nodeId: source?.id,
        edgeId: edge.id,
        targetLabel: source?.label,
      }));
    } else {
      seenPairs.add(pair);
    }
  }

  for (const node of nodes) {
    const nodeDegree = degree.get(node.id) ?? 0;
    const isStorage = STORAGE_KINDS.has(node.kind);

    if (nodeDegree === 0 && isStorage) {
      issues.push(issue({
        id: `orphaned-storage-${node.id}`,
        severity: "warning",
        title: `${capitalize(node.kind.replace(/-/g, " "))} is not connected`,
        description: `${node.label} has no incoming or outgoing connectors, so no component in the current graph appears to use it.`,
        recommendation: "Connect the store to the service that reads or writes it, or remove it if it is not part of this design.",
        nodeId: node.id,
        targetLabel: node.label,
      }));
      continue;
    }

    // Entry-point-specific checks below give a more actionable message than a
    // second, generic isolated-component warning for the same condition.
    if (nodeDegree === 0 && ENTRY_KINDS.has(node.kind)) continue;

    if (nodeDegree === 0) {
      issues.push(issue({
        id: `isolated-component-${node.id}`,
        severity: "warning",
        title: "Isolated component",
        description: `${node.label} has no connections to the rest of the architecture.`,
        recommendation: "Connect it to the components it communicates with, or document why it is intentionally standalone.",
        nodeId: node.id,
        targetLabel: node.label,
      }));
    }
  }

  // The arrow direction matters here: the client/gateway should send requests onward.
  for (const node of nodes) {
    if (!ENTRY_KINDS.has(node.kind)) continue;
    if ((outgoing.get(node.id) ?? 0) === 0) {
      issues.push(issue({
        id: `entry-no-outgoing-${node.id}`,
        severity: "warning",
        title: "Entry point has no outgoing flow",
        description: `${node.label} is modelled as an entry point, but no connector leaves it.`,
        recommendation: "Add a directed connector to the next hop (such as a gateway or application service). If this diagram intentionally reverses arrows, make the flow convention explicit.",
        nodeId: node.id,
        targetLabel: node.label,
      }));
    }
  }

  const hasEntryPoint = nodes.some((node) => ENTRY_KINDS.has(node.kind));
  if (!hasEntryPoint) {
    issues.push(issue({
      id: "no-entry-point",
      severity: "info",
      title: "No client or gateway entry point detected",
      description: "The graph has no web client, mobile client, API gateway, or load balancer component.",
      recommendation: "For request-driven systems, consider modelling the first component that receives traffic. Worker-only or batch designs may intentionally omit an entry point.",
    }));
  }

  const hasPersistence = nodes.some((node) => STORAGE_KINDS.has(node.kind));
  const hasApplication = nodes.some((node) => APPLICATION_KINDS.has(node.kind));
  if (hasApplication && !hasPersistence) {
    issues.push(issue({
      id: "no-persistence-component",
      severity: "info",
      title: "No persistence component detected",
      description: "Application-facing components are present, but no database, cache, or object-storage node is modelled.",
      recommendation: "For stateful workloads, add the appropriate persistence component. Stateless or external-storage architectures may be valid without one.",
    }));
  }

  return issues.sort((a, b) => {
    const severityOrder = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    return severityOrder || a.title.localeCompare(b.title);
  });
}

function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

/** Count issues by the highest severity attached to each component. */
export function summarizeNodeHealth(issues: readonly HealthIssue[]) {
  const summary = new Map<string, { count: number; severity: HealthSeverity }>();
  for (const finding of issues) {
    if (!finding.nodeId) continue;
    const current = summary.get(finding.nodeId);
    summary.set(finding.nodeId, {
      count: (current?.count ?? 0) + 1,
      severity: !current || SEVERITY_RANK[finding.severity] > SEVERITY_RANK[current.severity]
        ? finding.severity
        : current.severity,
    });
  }
  return summary;
}
