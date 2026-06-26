<script setup lang="ts">
  import Svg_Clue from '@/assets/images/templates/clue.svg?component';
  import Svg_End from '@/assets/images/templates/end.svg?component';
  import Svg_Start from '@/assets/images/templates/start.svg?component';
  import Svg_Thought from '@/assets/images/templates/thought.svg?component';
  import { language, languages } from '@/core/i18n';
  import { initiate } from '@/core/initiate';
  import { shortcuts } from '@/data/shortcuts';
  import { Entity, type EntityType } from '@/types/entity';
  import { Project } from '@/types/project';
  import { Dnd, Graph } from '@antv/x6';
  import { getTeleport } from '@antv/x6-vue-shape';
  import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElMenu, ElMenuItem, ElPopover, ElSubMenu, ElTable, ElTableColumn } from 'element-plus';
  import { onMounted, ref } from 'vue';

  const handle = ref<FileSystemFileHandle>();
  const project = ref<Project>(new Project());
  let graph: Graph;
  let dnd: Dnd;
  let TeleportContainer = getTeleport();

  onMounted(() => {
    let objects = initiate('.container');
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
  });

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
            handle.value = res[0];
            let json = JSON.parse(await (await handle.value.getFile()).text());
            project.value = Project.from(json);

            graph.fromJSON(project.value.cells);
            if (project.value.transform) {
              graph.scale(project.value.transform.sx, project.value.transform.sy);
              graph.translate(project.value.transform.tx, project.value.transform.ty);
            }
          }
          break;
        case 'save':
          {
            let json = graph.toJSON();
            project.value.cells = json.cells;

            if (handle.value) {
              let stream = await handle.value.createWritable();
              await stream.write(JSON.stringify(project.value));
              await stream.close();
            } else {
              handle.value = await window.showSaveFilePicker({ types: [{ accept: { 'application/json': ['.json'] } }], suggestedName: 'logic-deduction-project.json' });
              let stream = await handle.value.createWritable();
              await stream.write(JSON.stringify(project.value));
              await stream.close();
            }
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
    dnd.start(Entity.createNode(graph, type), ev);
  }
</script>

<template>
  <div
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
    <el-menu class="menu" style="flex-grow: 1" popperClass="menu-popover" mode="horizontal" menuTrigger="click" closeOnClickOutside @select="handle_menu_select">
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
  <div class="container" style="height: calc(100vh - var(--el-menu-horizontal-height))"></div>
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
    .el-textarea__inner {
      height: 100%;
    }
  }
</style>
