<script setup lang="ts">
  import type { ClueEntity } from '@/types/entity';
  import { ElInput } from 'element-plus';
  import { inject, ref, watch } from 'vue';

  const node = (inject('getNode') as GetNode)();
  const entity = node.data.entity as ClueEntity;

  const text = ref(entity.text);

  watch(text, value => {
    entity.text = value;
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
      background-color: var(--color_purple);
      border-radius: var(--radius_main);
    "
  >
    <div>
      <span style="color: white; font-size: var(--size_font-large)">{{ $t('Clue') }}</span>
    </div>
    <el-input v-model="text" style="flex-grow: 1; margin-top: var(--gap_middle)" type="textarea" resize="none" @mousedown.stop @mousewheel.stop></el-input>
  </div>
</template>

<style scoped></style>
