<script setup lang="ts">
  import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus';
</script>

<template>
  <div
    style="
      border-bottom: 1px solid lightgray;
      box-shadow:
        0 4px 4px rgba(0, 0, 0, 0.08),
        0 2px 2px rgba(0, 0, 0, 0.04);
    "
  >
    <el-dropdown class="menu">
      <span>{{ $t('File') }}</span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>{{ $t('Open') }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
  .menu {
    padding: 10px;
    cursor: pointer;
    text-decoration: none;
  }
</style>
