<script setup lang="ts">
  import type { ThoughtEntity } from '@/types/entity';
  import { ElInput, ElSwitch } from 'element-plus';
  import { inject, ref, watch } from 'vue';

  const node = (inject('getNode') as GetNode)();
  const entity = node.data.entity as ThoughtEntity;

  const text = ref(entity.text);
  const active = ref(entity.active);

  watch(text, value => {
    entity.text = value;
  });
  watch(active, value => {
    entity.active = value;
  });
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: var(--gap_sub) var(--gap_main);
      background-color: var(--color_blue);
      border-radius: var(--radius_main);
    "
  >
    <div style="display: flex; align-items: center">
      <span style="color: white; font-size: var(--size_font-large)">{{ $t('Thought') }}</span>
      <el-switch v-model="active" style="--el-switch-on-color: var(--color_green); --el-switch-off-color: var(--color_red); margin-left: auto" @mousedown.stop></el-switch>
    </div>
    <el-input v-model="text" style="flex-grow: 1; margin-top: var(--gap_middle)" type="textarea" resize="none" @mousedown.stop @mousewheel.stop></el-input>
  </div>
</template>

<style scoped></style>
