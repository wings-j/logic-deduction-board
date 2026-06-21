import En from '@/assets/i18n/en.json';
import Zh from '@/assets/i18n/zh.json';
import { ref, watch } from 'vue';
import { createI18n } from 'vue-i18n';

type Language = 'en' | 'zh';

const key = 'language';
const languages: { name: string; value: Language }[] = [
  { name: 'English', value: 'en' },
  { name: '简体中文', value: 'zh' }
];

let language = ref<Language>((window.localStorage.getItem(key) ?? window.navigator.language.slice(0, 2)) as Language);
let i18n = createI18n({
  locale: language.value,
  fallbackLocale: 'en',
  messages: {
    zh: Zh,
    en: En
  }
});

watch(language, () => {
  i18n.global.locale = language.value;

  window.localStorage.setItem(key, language.value);
});

export { i18n, language, languages };
