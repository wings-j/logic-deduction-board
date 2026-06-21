<script setup lang="ts">
  import { language, languages } from '@/core/i18n';
  import { Entity, type EntityType } from '@/types/entity';
  import { Project } from '@/types/project';
  import { Dnd, Graph, History, Keyboard } from '@antv/x6';
  import { getTeleport } from '@antv/x6-vue-shape';
  import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElMenu, ElMenuItem, ElSubMenu } from 'element-plus';
  import { onMounted, ref } from 'vue';

  const handle = ref<FileSystemFileHandle>();
  const project = ref<Project>(new Project());
  let TeleportContainer = getTeleport();
  let graph: Graph;
  let dnd: Dnd;

  onMounted(() => {
    graph = new Graph({
      container: window.document.querySelector('#container')!,
      grid: { visible: true },
      mousewheel: true,
      connecting: {
        allowLoop: false,
        allowMulti: false,
        allowBlank: false,
        allowEdge: false,
        allowNode: false,
        validateConnection: ev => {
          return Entity.validateConnection(ev);
        }
      }
    });
    dnd = new Dnd({ target: graph });

    graph.use(new History({ enabled: true }));
    graph.use(new Keyboard({ enabled: true }));
    graph.bindKey('ctrl+z', () => {
      graph.undo();

      return false;
    });
    graph.bindKey('ctrl+y', () => {
      graph.redo();

      return false;
    });

    window.__x6_instances__ = [graph]; // For Chrome extension.
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
          }
          break;
        case 'save':
          {
            let cells = graph.toJSON().cells;
            project.value = Project.from({ cells });

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
    let node = Entity.createNode(graph, type);

    // TODO entity

    dnd.start(node, ev);
  }
</script>

<template>
  <div
    style="
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      border-bottom: 1px solid var(--color_border-main);
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
  </div>
  <div id="container" style="height: calc(100vh - var(--el-menu-horizontal-height))"></div>
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
      border: 1px solid var(--color_border-main);
      border-radius: var(--radius_main);
      background-color: var(--color_background);
    "
  >
    <div class="template" @mousedown="handle_template_mousedown($event, 'start')">
      <svg viewBox="0 0 100 100">
        <polygon points="0,0 70,0 100,50 70,100, 0,100" fill="var(--color_red)" />
      </svg>
      <span>{{ $t('Start') }}</span>
    </div>
    <div class="template" @mousedown="handle_template_mousedown($event, 'end')">
      <svg viewBox="0 0 100 100">
        <polygon points="0,50 30,0 100,0 100,100, 30,100" fill="var(--color_green)" />
      </svg>
      <span>{{ $t('End') }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .template {
    display: flex;
    align-items: center;
    gap: var(--gap_middle);
    padding: var(--gap_middle) var(--gap_sub);
    border: 1px solid var(--color_border-main);
    border-radius: var(--radius_sub);
    background-color: white;
    cursor: grab;
    user-select: none;

    svg {
      width: var(--size_font-main);
      height: var(--size_font-main);
    }
    span {
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
</style>
