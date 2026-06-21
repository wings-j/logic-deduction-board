import type { Graph, Node } from '@antv/x6';
import type { PortManager } from '@antv/x6/lib/model/port';

declare global {
  interface Window {
    __x6_instances__: Graph[];

    showOpenFilePicker: (option?: {
      multiple?: boolean;
      excludeAcceptAllOption?: boolean;
      types?: Array<{ description?: string; accept: Record<string, string[]> }>;
    }) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker: (option?: {
      excludeAcceptAllOption?: boolean;
      suggestedName?: string;
      startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
      types?: Array<{ description?: string; accept: Record<string, string[]> }>;
    }) => Promise<FileSystemFileHandle>;
  }

  interface GetNode {
    (): Node;
  }
}

declare module '@antv/x6' {
  interface Cell {
    port: PortManager;
  }
}
