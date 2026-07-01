<script setup lang="ts">
  import { symbol_project } from '@/core/constant';
  import type { EndEntity } from '@/types/entity';
  import { Project } from '@/types/project';
  import { ElInput } from 'element-plus';
  import { computed, inject, type Ref } from 'vue';

  const project = inject(symbol_project) as Ref<Project>;
  const node = (inject('getNode') as GetNode)();
  const entity = computed(() => project.value.getEntity(node) as EndEntity | undefined);
</script>

<template>
  <div
    v-if="entity"
    style="
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: var(--gap_sub) var(--gap_main);
      background-color: var(--color_green);
      border-radius: var(--radius_main);
    "
  >
    <div>
      <span style="color: white; font-size: var(--size_font-sub)">{{ $t('End') }}</span>
    </div>
    <el-input v-model="entity.text" style="flex-grow: 1; margin-top: var(--gap_middle)" type="textarea" resize="none" @mousedown.stop @mousewheel.stop></el-input>
  </div>
</template>

<style scoped></style>
