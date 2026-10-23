import type { ArchitectureGraph, GraphNode, NodeId } from "@/domain/types";

/** Direct successors of a node along its outgoing edges. */
export function getSuccessors(graph: ArchitectureGraph, nodeId: NodeId): GraphNode[] {
  const targetIds = graph.edges
    .filter((e) => e.source === nodeId)
    .map((e) => e.target);
  return graph.nodes.filter((n) => targetIds.includes(n.id));
}

/** All nodes that feed into a given node. */
export function getPredecessors(graph: ArchitectureGraph, nodeId: NodeId): GraphNode[] {
  const sourceIds = graph.edges
    .filter((e) => e.target === nodeId)
    .map((e) => e.source);
  return graph.nodes.filter((n) => sourceIds.includes(n.id));
}

/** BFS-reachable nodes starting from a source. */
export function reachableFrom(graph: ArchitectureGraph, sourceId: NodeId): NodeId[] {
  const visited = new Set<NodeId>();
  const queue = [sourceId];
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    getSuccessors(graph, id).forEach((n) => queue.push(n.id));
  }
  visited.delete(sourceId);
  return [...visited];
}
