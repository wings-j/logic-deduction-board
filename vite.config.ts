import Vue from '@vitejs/plugin-vue';
import UnpluginElementPlus from 'unplugin-element-plus/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  plugins: [Vue(), UnpluginElementPlus({})]
});
