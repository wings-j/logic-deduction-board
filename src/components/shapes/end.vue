<script setup lang="ts">
  import { Node } from '@antv/x6';
  import { inject, onMounted } from 'vue';

  const getNode = inject('getNode') as GetNode;
  let node: Node;

  onMounted(() => {
    node = getNode();
  });
</script>

<template>
  <div style="display: flex; height: 100%">
    <svg style="width: 15%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polygon points="0,50 100,0 100,100" fill="var(--color_green)"></polygon>
    </svg>
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 85%;
        color: white;
        font-size: var(--size_font-large);
        font-weight: bold;
        background-color: var(--color_green);
      "
    >
      <span>{{ $t('End') }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
