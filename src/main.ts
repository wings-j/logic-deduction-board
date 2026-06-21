import App from '@/app.vue';
import End from '@/components/shapes/end.vue';
import Start from '@/components/shapes/start.vue';
import { i18n } from '@/core/i18n';
import '@/style.css';
import { register } from '@antv/x6-vue-shape';
import { createApp } from 'vue';

register({ shape: 'start', component: Start });
register({ shape: 'end', component: End });

const app = createApp(App);

app.use(i18n);
app.mount('#app');
