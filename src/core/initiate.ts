import { shortcuts } from '@/data/shortcuts';
import { Entity } from '@/types/entity';
import { Cell, Clipboard, Dnd, Edge, Graph, History, Keyboard, Selection } from '@antv/x6';

const selectionTime: Record<string, number> = {};

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
        router: { name: 'manhattan', args: { padding: { left: 16, right: 16, top: 16, bottom: 16 } } },
        connector: { name: 'rounded', args: { radius: 8 } },
        snap: { radius: 30 },
        validateMagnet: ({ cell, magnet }) => {
          let portId = magnet.getAttribute('port');
          let port = cell.port.ports.find(a => a.id === portId);

          return ['output', 'provide'].includes(port?.group as any);
        },
        validateConnection: ev => {
          return Entity.validateConnection(ev);
        },
        createEdge({ sourceCell }): Edge {
          let type = sourceCell.data.entity.type;
          let edge: Edge;
          switch (type) {
            case 'start':
            case 'thought':
              {
                edge = graph.createEdge({ shape: 'think' });
              }
              break;
            case 'clue':
              {
                edge = graph.createEdge({ shape: 'cue' });
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
    });
    graph.bindKey(shortcuts.redo.keys.join('+'), () => {
      graph.redo();
    });
    graph.bindKey(shortcuts.copy.keys.join('+'), () => {
      let cells = graph.getSelectedCells();
      graph.copy(cells);
    });
    graph.bindKey(shortcuts.paste.keys.join('+'), () => {
      let cells = graph.paste();
      graph.cleanSelection();
      graph.select(cells);
    });
    graph.on('cell:click', ({ cell }) => {
      const unselect = () => {
        if (graph.isSelected(cell) && Date.now() - selectionTime[cell.id] > 100) {
          graph.unselect(cell);
        }
      };

      if (['start', 'end', 'thought', 'clue'].includes(cell.shape)) {
        window.document.querySelector(`.x6-widget-selection-box[data-cell-id="${cell.id}"]`)?.addEventListener(
          'click',
          () => {
            unselect();
          },
          { once: true }
        );
      } else if (['think', 'cue'].includes(cell.shape)) {
        unselect();
      }
    });
    graph.on('cell:selected', ({ cell }: { cell: Cell }) => {
      selectionTime[cell.id] = Date.now();

      if (['think', 'cue'].includes(cell.shape)) {
        cell.attr('line', { stroke: 'var(--color_orange)' });
      }
    });
    graph.on('cell:unselected', ({ cell }: { cell: Cell }) => {
      delete selectionTime[cell.id];

      if (cell.shape === 'think') {
        cell.attr('line', { stroke: 'var(--color_blue)' });
      } else if (cell.shape === 'cue') {
        cell.attr('line', { stroke: 'var(--color_purple)' });
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
