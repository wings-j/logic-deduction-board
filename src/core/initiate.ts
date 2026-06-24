import { shortcuts } from '@/data/shortcuts';
import { Entity } from '@/types/entity';
import { Cell, Clipboard, Dnd, Edge, Graph, History, Keyboard, Selection } from '@antv/x6';

/**
 * Initiate
 * @param [selector] Selector
 * @return Objects
 */
function initiate(selector: string) {
  let container = window.document.querySelector(selector) as HTMLElement;
  if (container) {
    let graph = new Graph({
      container,
      grid: { visible: true },
      mousewheel: true,
      connecting: {
        allowLoop: false,
        allowMulti: false,
        allowBlank: false,
        allowEdge: false,
        allowNode: false,
        connector: { name: 'smooth' },
        snap: { radius: 30 },
        validateMagnet: ({ cell, magnet }) => {
          let portId = magnet.getAttribute('port');
          let port = cell.port.ports.find(a => a.id === portId);

          return port?.group === 'output';
        },
        validateConnection: ev => {
          return Entity.validateConnection(ev);
        },
        createEdge({ sourceCell }): Edge {
          let type = sourceCell.data.entity.type;
          let edge: Edge;
          switch (type) {
            case 'start':
              {
                edge = graph.createEdge({ shape: 'think' });
              }
              break;
            default:
              throw new Error('Invalid Type');
          }

          return edge;
        }
      }
    });
    graph.use(new History({ enabled: true }));
    graph.use(new Selection({ enabled: true, showNodeSelectionBox: true, rubberband: true, rubberEdge: true, rubberNode: true, modifiers: 'ctrl' }));
    graph.use(new Clipboard({ enabled: true }));
    graph.use(new Keyboard({ enabled: true }));
    graph.bindKey(shortcuts.delete.keys.join('+'), () => {
      let cells = graph.getSelectedCells();

      graph.removeCells(cells);
    });
    graph.bindKey(shortcuts.undo.keys.join('+'), () => {
      graph.undo();

      return false;
    });
    graph.bindKey(shortcuts.redo.keys.join('+'), () => {
      graph.redo();

      return false;
    });
    graph.bindKey(shortcuts.copy.keys.join('+'), () => {
      let cells = graph.getSelectedCells();
      graph.copy(cells);

      return false;
    });
    graph.bindKey(shortcuts.paste.keys.join('+'), () => {
      let cells = graph.paste();
      graph.cleanSelection();
      graph.select(cells);
    });
    graph.on('cell:selected', ({ cell }: { cell: Cell }) => {
      if (cell.shape === 'think') {
        cell.attr('line', { stroke: 'var(--color_orange)' });
      }
    });
    graph.on('cell:unselected', ({ cell }: { cell: Cell }) => {
      if (cell.shape === 'think') {
        cell.attr('line', { stroke: 'var(--color_blue)' });
      }
    });

    let dnd = new Dnd({ target: graph });

    window.__x6_instances__ = [graph]; // For Chrome extension.

    return { graph, dnd };
  } else {
    throw new Error('Container not Found');
  }
}

export { initiate };
