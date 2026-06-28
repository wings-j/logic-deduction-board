import { t } from '@/core/i18n';

const shortcuts = {
  delete: { name: 'Delete', keys: ['Delete'] },
  save: { name: 'Save', keys: ['Ctrl', 'S'] },
  undo: { name: 'Undo', keys: ['Ctrl', 'Z'] },
  redo: { name: 'Redo', keys: ['Ctrl', 'Shift', 'Z'] },
  copy: { name: 'Copy', keys: ['Ctrl', 'C'] },
  paste: { name: 'Paste', keys: ['Ctrl', 'V'] },
  selectSingle: { name: 'SelectSingle', keys: ['Ctrl', t('MouseClick')] },
  selectMultiple: { name: 'SelectMultiple', keys: ['Ctrl', t('MouseMove')] }
};

export { shortcuts };

// TODO 节点快捷键
