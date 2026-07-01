import type { ThoughtEntity } from '@/types/entity';
import type { Project } from '@/types/project';
import { calculateCellChain } from '@/utils/calculate-cell-chain';
import type { Cell, Graph, Node } from '@antv/x6';

/**
 * Find Inactive Entity
 * @param [project] Project
 * @param [graph] Graph
 * @param [cell] Cell
 * @return Cell
 */
function findInactiveEntity(project: Project, graph: Graph, cell: Cell) {
  let chain = calculateCellChain(graph, cell);

  return chain.find(a => a.shape === 'thought' && !(project.getEntity(a as unknown as Node) as ThoughtEntity).active);
}

export { findInactiveEntity };
