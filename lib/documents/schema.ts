import Dexie, { type Table } from "dexie";
import { DocumentRecord, DocumentRevision, FolderRecord } from "@/types/document";

export const CURRENT_SCHEMA_VERSION = 1;

export class LinguallyDatabase extends Dexie {
  documents!: Table<DocumentRecord, string>;
  revisions!: Table<DocumentRevision, string>;
  folders!: Table<FolderRecord, string>;

  constructor() {
    super("LinguallyDatabase");

    this.version(1).stores({
      documents: "id, title, updatedAt, createdAt, favorite, folderId, schemaVersion",
      revisions: "id, documentId, createdAt, trigger",
      folders: "id, name, createdAt",
    });
  }
}

// Singleton database instance
export const db = new LinguallyDatabase();
