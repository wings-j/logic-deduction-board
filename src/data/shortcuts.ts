import { t } from '@/core/i18n';

const shortcuts = {
  delete: { name: 'Delete', keys: ['Delete'] },
  undo: { name: 'Undo', keys: ['Ctrl', 'Z'] },
  redo: { name: 'Redo', keys: ['Ctrl', 'Shift', 'Z'] },
  copy: { name: 'Copy', keys: ['Ctrl', 'C'] },
  paste: { name: 'Paste', keys: ['Ctrl', 'V'] },
  selectSingle: { name: 'SelectSingle', keys: ['Ctrl', t('MouseClick')] },
  selectMultiple: { name: 'SelectMultiple', keys: ['Ctrl', t('MouseMove')] }
};

export { shortcuts };
