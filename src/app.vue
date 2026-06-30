<script setup lang="ts">
  import Svg_Clue from '@/assets/images/templates/clue.svg?component';
  import Svg_End from '@/assets/images/templates/end.svg?component';
  import Svg_Start from '@/assets/images/templates/start.svg?component';
  import Svg_Thought from '@/assets/images/templates/thought.svg?component';
  import { symbol_project } from '@/core/constant';
  import { language, languages, t } from '@/core/i18n';
  import { initiate } from '@/core/initiate';
  import { shortcuts } from '@/data/shortcuts';
  import { Entity, ThoughtEntity, type EntityType } from '@/types/entity';
  import { Project } from '@/types/project';
  import { wait } from '@/utils/wait';
  import { Cell, Dnd, Graph } from '@antv/x6';
  import { getTeleport } from '@antv/x6-vue-shape';
  import { useDebounceFn, useThrottleFn } from '@vueuse/core';
  import { clone } from '@wings-j/clone';
  import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElMenu, ElMenuItem, ElMessage, ElPopover, ElSubMenu, ElTable, ElTableColumn } from 'element-plus';
  import { isEqual } from 'es-toolkit';
  import { onBeforeUnmount, onMounted, provide, ref, useTemplateRef, watch } from 'vue';

  const $wrap = useTemplateRef('wrap');
  const $container = useTemplateRef('container');
  const project = ref(new Project());
  let handle: FileSystemFileHandle | undefined;
  let origin: Project = clone(project.value);
  let graph: Graph;
  let dnd: Dnd;
  let TeleportContainer = getTeleport();
  let debouncedResize = useDebounceFn(async () => {
    let rect = $wrap.value?.getBoundingClientRect();
    if (rect) {
      graph.resize(rect.width, rect.height);
    }
  }, 300);
  let throttledUpdate = useThrottleFn(update, 300, true);

  provide(symbol_project, project);

  watch(
    project,
    () => {
      throttledUpdate();
    },
    { deep: true }
  );

  onMounted(async () => {
    let objects = initiate($container.value!);
    graph = objects.graph;
    dnd = objects.dnd;

    graph.on('scale', () => {
      let { sx, sy } = graph.scale();
      project.value.transform.sx = sx;
      project.value.transform.sy = sy;
    });
    graph.on('translate', () => {
      let { tx, ty } = graph.translate();
      project.value.transform.tx = tx;
      project.value.transform.ty = ty;
    });
    const throttledChange = useThrottleFn(handle_cell_change, 500, true);
    graph.on('cell:added', throttledChange);
    graph.on('cell:removed', throttledChange);
    graph.on('cell:changed', throttledChange);

    window.addEventListener('beforeunload', handle_unload);
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('keydown', handle_keydown);

    if (import.meta.hot) {
      handle = import.meta.hot.data['handle'];

      await open();
      update();
    }

    await wait(100);

    let svg = $container.value!.querySelector('.x6-graph-svg') as SVGSVGElement;
    let defs = svg.querySelector('defs') as SVGDefsElement;
    let marker = defs.querySelector('marker');
    if (marker) {
      marker = marker.cloneNode(true) as SVGMarkerElement;
      marker.setAttribute('id', 'marker-active');
      let path = marker.querySelector('path') as SVGPathElement;
      path.setAttribute('fill', 'var(--color_orange)');
      path.setAttribute('stroke', 'var(--color_orange)');

      defs.appendChild(marker);
    }
  });
  onBeforeUnmount(() => {
    if (import.meta.hot) {
      import.meta.hot.data['handle'] = handle;
    }

    window.removeEventListener('beforeunload', handle_unload);
    window.removeEventListener('resize', debouncedResize);
    window.removeEventListener('keydown', handle_keydown);
  });

  /**
   * Handle Unload
   * @param [ev] Event
   */
  function handle_unload(ev: BeforeUnloadEvent) {
    if (!import.meta.hot && !isEqual(project.value, origin)) {
      ev.preventDefault();
    }
  }
  /**
   * Handle Keyup
   * @param [ev] Event
   */
  async function handle_keydown(ev: KeyboardEvent) {
    if (ev.key.toLowerCase() === 's' && ev.ctrlKey) {
      ev.preventDefault();

      await save();

      ElMessage({ message: t('ProjectSaved'), type: 'success' });
    }
  }
  /**
   * Handle Menu Select
   * @param [ev] Index
   */
  async function handle_menu_select(ev: string) {
    try {
      switch (ev) {
        case 'open':
          {
            let res = await window.showOpenFilePicker({ types: [{ accept: { 'application/json': ['.json'] } }] });
            handle = res[0];

            await open();
            update();
          }
          break;
        case 'save':
          {
            save();
          }
          break;
      }
    } catch (er) {
      if (er instanceof DOMException && er.name === 'AbortError') {
        console.error(er);
      } else {
        throw er;
      }
    }
  }
  /**
   * Handle Template Mousedown
   * @param [ev] Event
   * @param [type] Type
   */
  async function handle_template_mousedown(ev: MouseEvent, type: EntityType) {
    let { entity, node } = Entity.create(graph, type);
    project.value.entities.push(entity);
    dnd.start(node, ev);
  }
  /**
   * Handle Cell Update
   */
  function handle_cell_change() {
    let cells = graph.toJSON().cells;
    project.value.cells = cells;
    project.value.entities = project.value.entities.filter(a => cells.some(b => b.data?.entity === a.id));
  }

  /**
   * Open
   */
  async function open() {
    if (handle) {
      let json = JSON.parse(await (await handle.getFile()).text());
      project.value = Project.from(json);

      graph.fromJSON(project.value.cells);
      if (project.value.transform) {
        graph.scale(project.value.transform.sx, project.value.transform.sy);
        graph.translate(project.value.transform.tx, project.value.transform.ty);
      }

      origin = clone(project.value);
    }
  }
  /**
   * Update
   */
  function update() {
    const getChain = (cell: Cell, array: Cell[] = []) => {
      if (cell.isNode()) {
        let edges = graph.getConnectedEdges(cell);
        let previous = edges.find(b => b.shape === 'think' && (b.target as any).cell === cell.id);
        if (previous) {
          array.push(previous);

          return getChain(previous, array);
        } else {
          return array;
        }
      } else if (cell.isEdge()) {
        let source = graph.getCellById((cell.source as any).cell);
        if (source) {
          array.push(source);

          return getChain(source, array);
        } else {
          return array;
        }
      } else {
        return array;
      }
    };
    const findInactive = (cell: Cell) => {
      let chain = getChain(cell);

      return chain.find(a => a.shape === 'thought' && !(a.data['entity'] as ThoughtEntity).active); // TODO get entity
    };

    for (let a of graph.getCells()) {
      if (a.shape === 'thought') {
        // TODO
      } else if (a.shape === 'think') {
        if (findInactive(a)) {
          a.setAttrs({ line: { stroke: 'var(--color_disabled)' } });
        } else {
          a.setAttrs({ line: { stroke: 'var(--color_blue)' } });
        }
      }
    }
  }
  /**
   * Save
   */
  async function save() {
    project.value.cells = graph.toJSON().cells;

    if (handle) {
      let stream = await handle.createWritable();
      await stream.write(JSON.stringify(project.value));
      await stream.close();
    } else {
      handle = await window.showSaveFilePicker({ types: [{ accept: { 'application/json': ['.json'] } }], suggestedName: 'logic-deduction-project.json' });
      let stream = await handle.createWritable();

      await stream.write(JSON.stringify(project.value));
      await stream.close();
    }

    origin = clone(project.value);
  }
</script>

<template>
  <div
    class="menu"
    style="
      display: flex;
      align-items: center;
      gap: var(--gap_sub);
      position: sticky;
      top: 0;
      border-bottom: 1px solid var(--color_border);
      box-shadow:
        0 4px 4px rgba(0, 0, 0, 0.06),
        0 2px 2px rgba(0, 0, 0, 0.03);
    "
  >
    <el-menu style="flex-grow: 1" popperClass="menu-popover" mode="horizontal" menuTrigger="click" closeOnClickOutside @select="handle_menu_select">
      <el-sub-menu index="file">
        <template #title>{{ $t('File') }}</template>
        <el-menu-item index="open">{{ $t('Open') }}</el-menu-item>
        <el-menu-item index="save">{{ $t('Save') }}</el-menu-item>
      </el-sub-menu>
    </el-menu>
    <el-dropdown>
      <div style="display: flex; align-items: center; gap: var(--gap_middle); padding: 0 var(--gap_sub); font-size: var(--size_font-sub); cursor: pointer">
        <img style="width: var(--size_font-main); height: var(--size_font-main)" src="@/assets/images/i18n.svg" />
        <span>{{ languages.find(a => a.value === language)?.name }}</span>
      </div>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="a of languages" :key="a.value" @click="language = a.value">
            {{ a.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-popover width="300px">
      <template #reference>
        <div
          style="
            display: flex;
            align-items: center;
            gap: var(--gap_middle);
            padding: 0 var(--gap_sub);
            color: var(--el-text-color-regular);
            font-size: var(--size_font-sub);
            cursor: pointer;
          "
        >
          <img style="width: var(--size_font-main); height: var(--size_font-main)" src="@/assets/images/shortcut.svg" />
          <span>{{ $t('Shortcut') }}</span>
        </div>
      </template>
      <el-table :data="Object.values(shortcuts)">
        <el-table-column :label="$t('Keys')">
          <template #="{ row: { keys } }">
            <div style="display: flex; align-items: center">
              <template v-for="(a, i) of keys">
                <span v-if="i !== 0">+</span>
                <span style="padding: 0 var(--gap_small); border-radius: var(--radius_middle); background-color: var(--color_background)">{{ a }}</span>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Function')">
          <template #="{ row: { name } }">
            <span>{{ $t(name) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-popover>
  </div>
  <div ref="wrap" style="height: calc(100vh - 40px)">
    <div ref="container" class="container" style="width: 100%; height: 100%"></div>
  </div>
  <TeleportContainer></TeleportContainer>

  <div
    style="
      display: flex;
      flex-direction: column;
      gap: var(--gap_middle);
      position: fixed;
      left: 20px;
      top: 60px;
      width: max-content;
      padding: var(--gap_sub);
      border: 1px solid var(--color_border);
      border-radius: var(--radius_main);
      background-color: var(--color_background);
    "
  >
    <div class="template" @mousedown="handle_template_mousedown($event, 'start')">
      <Svg_Start class="icon"></Svg_Start>
      <span class="name">{{ $t('Start') }}</span>
    </div>
    <div class="template" @mousedown="handle_template_mousedown($event, 'end')">
      <Svg_End class="icon"></Svg_End>
      <span class="name">{{ $t('End') }}</span>
    </div>
    <div class="template" @mousedown="handle_template_mousedown($event, 'thought')">
      <Svg_Thought class="icon"></Svg_Thought>
      <span class="name">{{ $t('Thought') }}</span>
    </div>
    <div class="template" @mousedown="handle_template_mousedown($event, 'clue')">
      <Svg_Clue class="icon"></Svg_Clue>
      <span class="name">{{ $t('Clue') }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .template {
    display: flex;
    align-items: center;
    gap: var(--gap_middle);
    padding: var(--gap_middle) var(--gap_sub);
    border: 1px solid var(--color_border);
    border-radius: var(--radius_sub);
    background-color: white;
    cursor: grab;
    user-select: none;

    .icon {
      width: var(--size_font-main);
      height: var(--size_font-main);
    }
    .name {
      font-size: var(--size_font-sub);
    }
  }
</style>
<style lang="scss">
  .menu {
    --el-menu-horizontal-height: 40px;
    --el-menu-active-color: var(--el-menu-text-color);

    .el-sub-menu__title {
      border-bottom-width: 0 !important;
    }
  }
  .menu-popover {
    --el-menu-active-color: var(--el-menu-text-color);
  }
  .container {
    .x6-edge-selected {
      path:nth-child(2) {
        stroke: var(--color_orange);
        marker-end: url(#marker-active);
      }
    }
    .el-textarea__inner {
      height: 100%;
    }
  }
</style>

// TODO 新建
