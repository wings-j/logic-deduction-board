<script setup lang="ts">
  import { ElInput } from 'element-plus';
  import { ref } from 'vue';

  const text = ref('');
</script>

<template>
  <div style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: var(--gap_main); background-color: var(--color_purple); border-radius: var(--radius_main)">
    <div style="color: white; font-size: var(--size_font-large)">{{ $t('Clue') }}</div>
    <el-input v-model="text" style="flex-grow: 1; margin-top: var(--gap_middle)" type="textarea" resize="none" @mousedown.stop @mousewheel.stop></el-input>
  </div>
</template>

<style scoped></style>
