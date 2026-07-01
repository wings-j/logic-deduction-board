<script setup lang="ts">
  import { symbol_project } from '@/core/constant';
  import type { ThoughtEntity } from '@/types/entity';
  import type { Project } from '@/types/project';
  import { findInactiveEntity } from '@/utils/find-inactive-entity';
  import { ElInput, ElSwitch } from 'element-plus';
  import { computed, inject, type Ref } from 'vue';

  const project = inject(symbol_project) as Ref<Project>;
  const node = (inject('getNode') as GetNode)();
  const graph = node.model!.graph;
  const entity = computed(() => project.value.getEntity(node) as ThoughtEntity | undefined);
  const mute = computed(() => {
    return !(entity.value?.active ?? false) || findInactiveEntity(project.value, graph, node as any);
  });
</script>

<template>
  <div
    v-if="entity"
    style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: var(--gap_sub) var(--gap_main); border-radius: var(--radius_main)"
    :style="{ backgroundColor: mute ? 'var(--color_background-dark)' : 'var(--color_blue)' }"
  >
    <div style="display: flex; align-items: center">
      <span style="color: white; font-size: var(--size_font-large)">{{ $t('Thought') }}</span>
      <el-switch v-model="entity.active" style="--el-switch-on-color: var(--color_green); --el-switch-off-color: var(--color_red); margin-left: auto" @mousedown.stop></el-switch>
    </div>
    <el-input v-model="entity.text" style="flex-grow: 1; margin-top: var(--gap_middle)" type="textarea" resize="none" @mousedown.stop @mousewheel.stop></el-input>
  </div>
</template>

<style scoped></style>
