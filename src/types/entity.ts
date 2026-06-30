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
      case 'clue': {
        return ThoughtEntity.from(raw);
      }
      default:
        throw new Error(`Unknown Entity Type: '${raw['type']}'`);
    }
  }
  /**
   * Create
   * @param [graph] Graph
   * @param [type] Type
   * @return Entity and Node
   */
  static create(graph: Graph, type: EntityType) {
    switch (type) {
      case 'start': {
        return StartEntity.create(graph);
      }
      case 'end': {
        return EndEntity.create(graph);
      }
      case 'thought': {
        return ThoughtEntity.create(graph);
      }
      case 'clue': {
        return ClueEntity.create(graph);
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
   * Create
   * @param [graph] Graph
   * @return Entity and Node
   */
  static create(graph: Graph) {
    let entity = new StartEntity();
    let node = graph.createNode({ shape: 'start', data: { entity: entity.id } });

    return { entity, node };
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
      return ['end', 'thought'].includes(targetCell.shape) && targetPort.group === 'input';
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
   * Create
   * @param [graph] Graph
   * @return Entity and Node
   */
  static create(graph: Graph) {
    let entity = new EndEntity();
    let node = graph.createNode({ shape: 'end', data: { entity: entity.id } });

    return { entity, node };
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
      return ['start', 'thought'].includes(sourceCell.shape) && sourcePort.group === 'output';
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
   * Create
   * @param [graph] Graph
   * @return Entity and Node
   */
  static create(graph: Graph) {
    let entity = new ThoughtEntity();
    let node = graph.createNode({ shape: 'thought', data: { entity: entity.id } });

    return { entity, node };
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
      return ['end', 'thought'].includes(targetCell.shape) && targetPort.group === 'input';
    } else if (role === 'target') {
      if (targetPort.group === 'input') {
        let graph = targetCell.model!.graph as Graph;
        let inputEdges = graph.getConnectedEdges(targetCell).filter(a => a.shape === 'think' && (a.target as any).cell === targetCell.id);
        if (inputEdges.length) {
          return false;
        }
      }

      return ['start', 'thought', 'clue'].includes(sourceCell.shape) && ['output', 'provide'].includes(sourcePort.group as any);
    } else {
      return false;
    }
  }

  text = '';
  active = true;

  /**
   * Constructor
   */
  constructor() {
    super('thought');
  }
}
/**
 * Clue Entity
 */
class ClueEntity extends Entity {
  /**
   * From
   * @param [raw] Raw
   * @return Object
   */
  static from(raw: any): ClueEntity {
    return Object.assign(new ClueEntity(), raw);
  }
  /**
   * Create
   * @param [graph] Graph
   * @return Entity and Node
   */
  static create(graph: Graph) {
    let entity = new ClueEntity();
    let node = graph.createNode({ shape: 'clue', data: { entity: entity.id } });

    return { entity, node };
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
  static validateConnectionOfDirection(role: 'source' | 'target', _: Cell, __: Port, targetCell: Cell, targetPort: Port): boolean {
    if (role === 'source') {
      return ['thought'].includes(targetCell.shape) && targetPort.group === 'inject';
    } else {
      return false;
    }
  }

  text = '';

  /**
   * Constructor
   */
  constructor() {
    super('clue');
  }
}

Entity.map['start'] = StartEntity;
Entity.map['end'] = EndEntity;
Entity.map['thought'] = ThoughtEntity;
Entity.map['clue'] = ClueEntity;

export { ClueEntity, EndEntity, Entity, StartEntity, ThoughtEntity };
export type { EntityType };
