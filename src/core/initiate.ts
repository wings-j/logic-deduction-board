import { shortcuts } from '@/data/shortcuts';
import { Entity } from '@/types/entity';
import { Cell, Clipboard, Dnd, Edge, Graph, History, Keyboard, Selection } from '@antv/x6';

const selectionTime: Record<string, number> = {};

/**
 * Initiate
 * @param [container] Container
 * @return Objects
 */
function initiate(container: HTMLElement) {
  let graph = new Graph({
    container,
    mousewheel: true,
    grid: { visible: true },
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
        switch (sourceCell.shape) {
          case 'start':
          case 'thought': {
            return graph.createEdge({ shape: 'think' });
          }
          case 'clue': {
            return graph.createEdge({ shape: 'cue' });
          }
          default:
            throw new Error('Invalid Type');
        }
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

    if (cell.isNode()) {
      window.document.querySelector(`.x6-widget-selection-box[data-cell-id="${cell.id}"]`)?.addEventListener(
        'click',
        () => {
          unselect();
        },
        { once: true }
      );
    } else if (cell.isEdge()) {
      unselect();
    }
  });
  graph.on('cell:selected', ({ cell }: { cell: Cell }) => {
    selectionTime[cell.id] = Date.now();
  });
  graph.on('cell:unselected', ({ cell }: { cell: Cell }) => {
    delete selectionTime[cell.id];
  });

  let dnd = new Dnd({ target: graph });

  window.__x6_instances__ = [graph]; // For Chrome extension.

  return { graph, dnd };
}

export { initiate };
