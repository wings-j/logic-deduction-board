import Vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import UnpluginElementPlus from 'unplugin-element-plus/vite';
import { defineConfig } from 'vite';
import SvgLoader from 'vite-svg-loader';

export default defineConfig({
  base: '',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [Vue(), UnpluginElementPlus({}), SvgLoader({ defaultImport: 'url' })]
});
