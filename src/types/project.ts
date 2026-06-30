import { Entity } from '@/types/entity';
import { type CellProperties, Node } from '@antv/x6';

/**
 * Project
 */
class Project {
  /**
   * From
   * @param [raw] Raw
   * @return Object
   */
  static from(raw: any): Project {
    return Object.assign(new Project(), raw, {
      entities:
        raw['entities']?.map((a: any) => {
          return Entity.from(a);
        }) ?? []
    });
  }

  transform: { sx: number; sy: number; tx: number; ty: number } = { sx: 1, sy: 1, tx: 0, ty: 0 };
  cells: CellProperties[] = [];
  entities: Entity[] = [];

  /**
   * Get Entity
   * @param [target] Target
   * @return Entity
   */
  getEntity(target: string | Node) {
    if (target instanceof Node) {
      return this.entities.find(a => a.id === target.data?.entity);
    } else {
      return this.entities.find(a => a.id === target);
    }
  }

  // TODO 构建逻辑图
}

export { Project };
