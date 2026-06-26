import Clue from '@/components/nodes/clue.vue';
import End from '@/components/nodes/end.vue';
import Start from '@/components/nodes/start.vue';
import Thought from '@/components/nodes/thought.vue';
import { Graph } from '@antv/x6';
import { register } from '@antv/x6-vue-shape';

const outputPortAttributes = { circle: { r: 8, stroke: 'var(--color_blue-dark)', strokeWidth: 2, magnet: true } };
const inputPortAttributes = { circle: { r: 8, stroke: 'none', fill: 'var(--color_blue-dark)', magnet: true } };
const provideAttributes = { circle: { r: 8, stroke: 'var(--color_purple-dark)', strokeWidth: 2, magnet: true } };
const injectAttributes = { circle: { r: 8, stroke: 'none', fill: 'var(--color_purple-dark)', magnet: true } };

Graph.registerEdge('think', { inherits: 'edge', attrs: { line: { stroke: 'var(--color_blue)', strokeWidth: 4 } } });
Graph.registerEdge('cue', { inherits: 'edge', attrs: { line: { stroke: 'var(--color_purple)', strokeWidth: 4 } } });
register({
  shape: 'start',
  component: Start,
  width: 120,
  height: 40,
  ports: { groups: { output: { position: 'right', attrs: outputPortAttributes } }, items: [{ group: 'output' }] }
});
register({ shape: 'end', component: End, width: 120, height: 40, ports: { groups: { input: { position: 'left', attrs: inputPortAttributes } }, items: [{ group: 'input' }] } });
register({
  shape: 'clue',
  component: Clue,
  width: 240,
  height: 160,
  ports: { groups: { provide: { position: 'bottom', attrs: provideAttributes } }, items: [{ group: 'provide' }] }
});
register({
  shape: 'thought',
  component: Thought,
  width: 300,
  height: 200,
  ports: {
    groups: {
      input: { position: 'left', attrs: inputPortAttributes },
      output: { position: 'right', attrs: outputPortAttributes },
      inject: { position: 'top', attrs: injectAttributes }
    },
    items: [{ group: 'input' }, { group: 'output' }, { group: 'inject' }]
  }
});
