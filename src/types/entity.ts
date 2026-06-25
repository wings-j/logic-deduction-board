import { Cell, Graph, type ValidateConnectionArgs } from '@antv/x6';
import type { Port } from '@antv/x6/lib/model/port';

/**
 * Entity
 */
class Entity {
  static map: Record<
    string,
    { validateConnectionOfDirection: (direction: 'source' | 'target', sourceCell: Cell, sourcePort: Port, targetCell: Cell, targetPort: Port) => boolean }
  > = {};

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
      case 'thought': {
        return ThoughtEntity.from(raw);
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
      case 'thought': {
        return ThoughtEntity.createNode(graph);
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
        this.map[sourceShape].validateConnectionOfDirection('source', sourceCell, sourcePort, targetCell, targetPort) &&
        this.map[targetShape].validateConnectionOfDirection('target', sourceCell, sourcePort, targetCell, targetPort)
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

type EntityType = 'start' | 'end' | 'thought' | 'clue';

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
    let node = graph.createNode({ shape: 'start', data: { entity } });

    return node;
  }
  /**
   * Validate Connection of Direction
   * @param [role] Role
   * @param [sourceCell] Source Cell
   * @param [sourcePort] Source Port
   * @param [targetCell] Target Cell
   * @param [targetPort] Target Port
   * @return Result
   */
  static validateConnectionOfDirection(role: 'source' | 'target', _: Cell, __: Port, targetCell: Cell, targetPort: Port): boolean {
    if (role === 'source') {
      let targetEntity = targetCell.data.entity as Entity;

      return ['end', 'thought'].includes(targetEntity.type) && targetPort.group === 'input';
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
    let node = graph.createNode({ shape: 'end', data: { entity } });

    return node;
  }
  /**
   * Validate Connection
   * @param [role] Role
   * @param [sourceCell] Source Cell
   * @param [sourcePort] Source Port
   * @param [targetCell] Target Cell
   * @param [targetPort] Target Port
   * @return Result
   */
  static validateConnectionOfDirection(role: 'source' | 'target', sourceCell: Cell, sourcePort: Port, _: Cell, __: Port): boolean {
    if (role === 'target') {
      let sourceEntity = sourceCell.data.entity as Entity;

      return ['start', 'thought'].includes(sourceEntity.type) && sourcePort.group === 'output';
    } else {
      return false;
    }
  }

  /**
   * Constructor
   */
  constructor() {
    super('end');
  }
}
/**
 * Thought Entity
 */
class ThoughtEntity extends Entity {
  /**
   * From
   * @param [raw] Raw
   * @return Object
   */
  static from(raw: any): ThoughtEntity {
    return Object.assign(new ThoughtEntity(), raw);
  }
  /**
   * Create Node
   * @param [graph] Graph
   * @return Node
   */
  static createNode(graph: Graph) {
    let entity = new ThoughtEntity();
    let node = graph.createNode({ shape: 'thought', data: { entity } });

    return node;
  }
  /**
   * Validate Connection
   * @param [role] Role
   * @param [sourceCell] Source Cell
   * @param [sourcePort] Source Port
   * @param [targetCell] Target Cell
   * @param [targetPort] Target Port
   * @return Result
   */
  static validateConnectionOfDirection(role: 'source' | 'target', sourceCell: Cell, sourcePort: Port, targetCell: Cell, targetPort: Port): boolean {
    if (role === 'source') {
      let targetEntity = targetCell.data.entity as Entity;

      return ['end', 'thought'].includes(targetEntity.type) && targetPort.group === 'input';
    }
    if (role === 'target') {
      let sourceEntity = sourceCell.data.entity as Entity;

      return ['start', 'thought'].includes(sourceEntity.type) && sourcePort.group === 'output';
    } else {
      return false;
    }
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
Entity.map['thought'] = ThoughtEntity;

export { EndEntity, Entity, StartEntity, ThoughtEntity };
export type { EntityType };
