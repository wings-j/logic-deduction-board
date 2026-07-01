import type { Cell, Graph } from '@antv/x6';

/**
 * Calculate Cell Chain
 * @param [graph] Graph
 * @param [cell] Cell
 * @param [array] Array
 * @return Array
 */
function calculateCellChain(graph: Graph, cell: Cell, array: Cell[] = []) {
  if (cell.isNode()) {
    let edges = graph.getConnectedEdges(cell);
    let previous = edges.find(b => b.shape === 'think' && (b.target as any).cell === cell.id);
    if (previous) {
      array.push(previous);

      return calculateCellChain(graph, previous, array);
    } else {
      return array;
    }
  } else if (cell.isEdge()) {
    let source = graph.getCellById((cell.source as any).cell);
    if (source) {
      array.push(source);

      return calculateCellChain(graph, source, array);
    } else {
      return array;
    }
  } else {
    return array;
  }
}

export { calculateCellChain };
