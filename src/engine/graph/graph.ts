import type { ArchitectureGraph, GraphNode, NodeId } from "@/domain/types";

/**
 * Pure graph helpers shared by the simulation engine and future features
 * (e.g. dependency analysis surfaced in queries). No React imports.
 */

/** Direct successors of a node along its outgoing edges. */
export function getSuccessors(
  graph: ArchitectureGraph,
  nodeId: NodeId,
): GraphNode[] {
  const targetIds = graph.edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => edge.target);
  return graph.nodes.filter((node) => targetIds.includes(node.id));
}
