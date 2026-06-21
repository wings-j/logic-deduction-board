import { Cell, Graph, type ValidateConnectionArgs } from '@antv/x6';
import type { Port } from '@antv/x6/lib/model/port';

const portAttributes = {
  circle: {
    r: 6,
    stroke: 'var(--color_border-dark)',
    magnet: true
  }
};

/**
 * Entity
 */
class Entity {
  static map: Record<string, { validateConnectionOfDirection: (direction: 'source' | 'target', cell: Cell, port: Port) => boolean }> = {};

  /**
   * From
   * @param [raw] Raw
   * @return Object
   */
  static from(raw: any): Entity {
    switch (raw['type']) {
      case 'start': {
        return StartEntity.from(raw);
      }
      case 'end': {
        return EndEntity.from(raw);
      }
      default:
        throw new Error(`Unknown Entity Type: '${raw['type']}'`);
    }
  }
  /**
   * Create Node
   * @param [graph] Graph
   * @param [type] Type
   * @return Node
   */
  static createNode(graph: Graph, type: EntityType) {
    switch (type) {
      case 'start': {
        return StartEntity.createNode(graph);
      }
      case 'end': {
        return EndEntity.createNode(graph);
      }
      default:
        throw new Error(`Unknown Entity Type: '${type}'`);
    }
  }
  /**
   * Validate Connection
   * @param [args] Arguments
   * @return Result
   */
  static validateConnection(args: ValidateConnectionArgs): boolean {
    if (args.sourceCell && args.sourcePort && args.targetCell && args.targetPort) {
      let sourceCell = args.sourceCell;
      let targetCell = args.targetCell;
      let sourcePort = sourceCell.port.ports.find(a => a.id === args.sourcePort)!;
      let targetPort = targetCell.port.ports.find(a => a.id === args.targetPort)!;
      let sourceShape = args.sourceCell.shape as EntityType;
      let targetShape = args.targetCell.shape as EntityType;

      return (
        this.map[sourceShape].validateConnectionOfDirection('source', sourceCell, sourcePort) &&
        this.map[targetShape].validateConnectionOfDirection('target', targetCell, targetPort)
      );
    } else {
      return false;
    }
  }

  id = window.crypto.randomUUID();
  type: EntityType;

  /**
   * Constructor
   * @param [type] Type
   */
  constructor(type: EntityType) {
    this.type = type;
  }
}

type EntityType = 'start' | 'end';

/**
 * Start Entity
 */
class StartEntity extends Entity {
  /**
   * From
   * @param [raw] Raw
   * @return Object
   */
  static from(raw: any): StartEntity {
    return Object.assign(new StartEntity(), raw);
  }
  /**
   * Create Node
   * @param [graph] Graph
   * @return Node
   */
  static createNode(graph: Graph) {
    let entity = new StartEntity();
    let node = graph.createNode({
      shape: 'start',
      width: 120,
      height: 40,
      ports: { groups: { output: { position: 'right', attrs: portAttributes } }, items: [{ group: 'output' }] },
      data: { entity }
    });

    return node;
  }
  /**
   * Validate Connection of Direction
   * @param [direction] Direction
   * @param [cell] Cell
   * @param [port] Port
   * @return Result
   */
  static validateConnectionOfDirection(direction: 'source' | 'target', cell: Cell, port: Port): boolean {
    if (direction === 'source') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Constructor
   */
  constructor() {
    super('start');
  }
}
/**
 * End Entity
 */
class EndEntity extends Entity {
  /**
   * From
   * @param [raw] Raw
   * @return Object
   */
  static from(raw: any): EndEntity {
    return Object.assign(new EndEntity(), raw);
  }
  /**
   * Create Node
   * @param [graph] Graph
   * @return Node
   */
  static createNode(graph: Graph) {
    let entity = new EndEntity();
    let node = graph.createNode({
      shape: 'end',
      width: 120,
      height: 40,
      ports: { groups: { input: { position: 'left', attrs: portAttributes } }, items: [{ group: 'input' }] },
      data: { entity }
    });

    return node;
  }
  /**
   * Validate Connection
   * @param [direction] Direction
   * @param [cell] Cell
   * @param [port] Port
   * @return Result
   */
  static validateConnectionOfDirection(direction: 'source' | 'target', cell: Cell, port: Port): boolean {
    // TODO

    return true;
  }

  /**
   * Constructor
   */
  constructor() {
    super('end');
  }
}

Entity.map['start'] = StartEntity;
Entity.map['end'] = EndEntity;

export { EndEntity, Entity, StartEntity };
export type { EntityType };
