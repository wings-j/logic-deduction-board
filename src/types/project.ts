import { Entity } from '@/types/entity';
import { type CellProperties } from '@antv/x6';
import { clone } from '@wings-j/clone';

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
      cells:
        raw['cells']?.map((a: any) => {
          let cell = clone(a);
          if (cell.data['entity']) {
            cell.data['entity'] = Entity.from(cell.data['entity']);
          }

          return cell;
        }) ?? []
    });
  }

  cells: CellProperties[] = [];
}

export { Project };
