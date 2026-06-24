import End from '@/components/nodes/end.vue';
import Start from '@/components/nodes/start.vue';
import { Graph } from '@antv/x6';
import { register } from '@antv/x6-vue-shape';

const outputPortAttributes = {
  circle: {
    r: 6,
    stroke: 'var(--color_blue)',
    strokeWidth: 2,
    magnet: true
  }
};
const inputPortAttributes = {
  circle: {
    r: 6,
    stroke: 'none',
    fill: 'var(--color_blue)',
    magnet: true
  }
};

Graph.registerEdge('think', {
  inherits: 'edge',
  attrs: {
    line: {
      stroke: 'var(--color_blue)'
    }
  }
});
register({
  shape: 'start',
  component: Start,
  width: 120,
  height: 40,
  ports: { groups: { output: { position: 'right', attrs: outputPortAttributes } }, items: [{ group: 'output' }] }
});
register({ shape: 'end', component: End, width: 120, height: 40, ports: { groups: { input: { position: 'left', attrs: inputPortAttributes } }, items: [{ group: 'input' }] } });
