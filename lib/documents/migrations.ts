import { db, CURRENT_SCHEMA_VERSION } from "./schema";

/**
 * Validates and migrates any stored records that may be from an earlier schema version.
 */
export async function runDocumentMigrations(): Promise<void> {
  const docs = await db.documents.toArray();
  const toUpdate: string[] = [];

  for (const doc of docs) {
    if (!doc.schemaVersion || doc.schemaVersion < CURRENT_SCHEMA_VERSION) {
      toUpdate.push(doc.id);
    }
  }

  if (toUpdate.length > 0) {
    await db.transaction("rw", db.documents, async () => {
      for (const id of toUpdate) {
        const doc = await db.documents.get(id);
        if (doc) {
          await db.documents.update(id, {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            tags: doc.tags || [],
            favorite: doc.favorite ?? false,
          });
        }
      }
    });
  }
}
