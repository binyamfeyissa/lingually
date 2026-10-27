export type DocumentTrigger = "manual" | "auto" | "before-ai-apply" | "restore";

export interface DocumentRecord {
  id: string;
  title: string;
  content: string; // Serialized HTML from Tiptap
  jsonContent?: Record<string, unknown>; // Prosemirror JSON representation
  plainText: string;
  createdAt: number;
  updatedAt: number;
  favorite: boolean;
  folderId?: string;
  tags?: string[];
  wordCount: number;
  characterCount: number;
  schemaVersion: number;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  title: string;
  content: string;
  plainText: string;
  createdAt: number;
  trigger: DocumentTrigger;
  changeSummary?: string;
  wordCount: number;
}

export interface FolderRecord {
  id: string;
  name: string;
  createdAt: number;
  color?: string;
}

export interface DocumentBackup {
  version: number;
  exportedAt: number;
  app: "lingually";
  documents: DocumentRecord[];
  revisions?: DocumentRevision[];
  folders?: FolderRecord[];
}
