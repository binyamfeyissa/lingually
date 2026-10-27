import { db, CURRENT_SCHEMA_VERSION } from "./schema";
import { DocumentRecord, DocumentRevision, DocumentTrigger, FolderRecord } from "@/types/document";
import { calculateTextStatistics } from "@/lib/analysis/statistics";

const MAX_REVISIONS_PER_DOCUMENT = 30;

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const DocumentRepository = {
  /**
   * Retrieves all documents, sorted and filtered.
   */
  async getAllDocuments(options?: {
    search?: string;
    sortBy?: "updatedAt" | "createdAt" | "title";
    sortOrder?: "asc" | "desc";
    folderId?: string;
    favoritesOnly?: boolean;
  }): Promise<DocumentRecord[]> {
    let collection = db.documents.toCollection();

    let docs = await collection.toArray();

    if (options?.favoritesOnly) {
      docs = docs.filter((d) => d.favorite);
    }

    if (options?.folderId) {
      docs = docs.filter((d) => d.folderId === options.folderId);
    }

    if (options?.search?.trim()) {
      const q = options.search.toLowerCase().trim();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.plainText.toLowerCase().includes(q)
      );
    }

    const sortBy = options?.sortBy || "updatedAt";
    const sortOrder = options?.sortOrder || "desc";

    docs.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else {
        comparison = (a[sortBy] || 0) - (b[sortBy] || 0);
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return docs;
  },

  /**
   * Retrieves a single document by ID.
   */
  async getDocument(id: string): Promise<DocumentRecord | undefined> {
    return db.documents.get(id);
  },

  /**
   * Creates a new document.
   */
  async createDocument(data?: Partial<DocumentRecord>): Promise<DocumentRecord> {
    const now = Date.now();
    const id = data?.id || generateId();
    const title = data?.title?.trim() || "Untitled Document";
    const content = data?.content || "<p></p>";
    const plainText = data?.plainText || "";
    const stats = calculateTextStatistics(plainText);

    const doc: DocumentRecord = {
      id,
      title,
      content,
      jsonContent: data?.jsonContent,
      plainText,
      createdAt: data?.createdAt || now,
      updatedAt: data?.updatedAt || now,
      favorite: data?.favorite ?? false,
      folderId: data?.folderId,
      tags: data?.tags || [],
      wordCount: stats.wordCount,
      characterCount: stats.characterCount,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };

    await db.documents.put(doc);

    // Create initial revision
    await this.createRevision(id, "manual", "Created document");

    return doc;
  },

  /**
   * Updates an existing document and updates its stats and timestamp.
   */
  async updateDocument(
    id: string,
    updates: Partial<Omit<DocumentRecord, "id" | "createdAt">>
  ): Promise<DocumentRecord> {
    const existing = await db.documents.get(id);
    if (!existing) {
      throw new Error(`Document with ID "${id}" does not exist.`);
    }

    const now = Date.now();
    let plainText = updates.plainText !== undefined ? updates.plainText : existing.plainText;
    let wordCount = existing.wordCount;
    let characterCount = existing.characterCount;

    if (updates.plainText !== undefined) {
      const stats = calculateTextStatistics(plainText);
      wordCount = stats.wordCount;
      characterCount = stats.characterCount;
    }

    const updatedDoc: DocumentRecord = {
      ...existing,
      ...updates,
      plainText,
      wordCount,
      characterCount,
      updatedAt: now,
    };

    await db.documents.put(updatedDoc);
    return updatedDoc;
  },

  /**
   * Deletes a document and its revision history.
   */
  async deleteDocument(id: string): Promise<void> {
    await db.transaction("rw", db.documents, db.revisions, async () => {
      await db.documents.delete(id);
      await db.revisions.where("documentId").equals(id).delete();
    });
  },

  /**
   * Duplicates an existing document.
   */
  async duplicateDocument(id: string): Promise<DocumentRecord> {
    const source = await db.documents.get(id);
    if (!source) {
      throw new Error(`Cannot duplicate: document "${id}" not found.`);
    }

    const newDoc = await this.createDocument({
      title: `${source.title} (Copy)`,
      content: source.content,
      jsonContent: source.jsonContent,
      plainText: source.plainText,
      favorite: false,
      folderId: source.folderId,
      tags: source.tags ? [...source.tags] : [],
    });

    return newDoc;
  },

  /**
   * Toggles the favorite status of a document.
   */
  async toggleFavorite(id: string): Promise<boolean> {
    const doc = await db.documents.get(id);
    if (!doc) throw new Error("Document not found");
    const nextFavorite = !doc.favorite;
    await db.documents.update(id, { favorite: nextFavorite, updatedAt: Date.now() });
    return nextFavorite;
  },

  /**
   * Creates a revision snapshot for a document.
   */
  async createRevision(
    documentId: string,
    trigger: DocumentTrigger,
    changeSummary?: string
  ): Promise<DocumentRevision> {
    const doc = await db.documents.get(documentId);
    if (!doc) {
      throw new Error(`Cannot snapshot: document "${documentId}" not found.`);
    }

    const revId = generateId();
    const revision: DocumentRevision = {
      id: revId,
      documentId,
      title: doc.title,
      content: doc.content,
      plainText: doc.plainText,
      createdAt: Date.now(),
      trigger,
      changeSummary,
      wordCount: doc.wordCount,
    };

    await db.revisions.put(revision);

    // Prune excessive revisions to keep IndexedDB lean
    const revisions = await db.revisions
      .where("documentId")
      .equals(documentId)
      .sortBy("createdAt");

    if (revisions.length > MAX_REVISIONS_PER_DOCUMENT) {
      const toDelete = revisions.slice(0, revisions.length - MAX_REVISIONS_PER_DOCUMENT);
      const idsToDelete = toDelete.map((r) => r.id);
      await db.revisions.bulkDelete(idsToDelete);
    }

    return revision;
  },

  /**
   * Lists all revisions for a document, latest first.
   */
  async getRevisions(documentId: string): Promise<DocumentRevision[]> {
    const revs = await db.revisions
      .where("documentId")
      .equals(documentId)
      .toArray();
    return revs.sort((a, b) => b.createdAt - a.createdAt);
  },

  /**
   * Restores a document to the state of a specific revision.
   */
  async restoreRevision(documentId: string, revisionId: string): Promise<DocumentRecord> {
    const rev = await db.revisions.get(revisionId);
    if (!rev) {
      throw new Error(`Revision "${revisionId}" not found.`);
    }

    // Save a snapshot of the current state before restoring
    await this.createRevision(documentId, "restore", `Restored to revision from ${new Date(rev.createdAt).toLocaleTimeString()}`);

    return this.updateDocument(documentId, {
      title: rev.title,
      content: rev.content,
      plainText: rev.plainText,
    });
  },

  /**
   * Clear all stored documents and revisions.
   */
  async clearAllData(): Promise<void> {
    await db.transaction("rw", db.documents, db.revisions, db.folders, async () => {
      await db.documents.clear();
      await db.revisions.clear();
      await db.folders.clear();
    });
  },

  /**
   * Seed a welcome tutorial document if the library is empty.
   */
  async seedInitialDocumentIfEmpty(): Promise<DocumentRecord | undefined> {
    const count = await db.documents.count();
    if (count > 0) return undefined;

    const sampleContent = `<h2>Welcome to Lingually</h2>
<p><strong>Lingually</strong> is a complete, private, and open-source AI writing workbench. It pairs deep editing intelligence with the rewriting precision of modern language models—without requiring an expensive subscription or locking your private thoughts in someone else's cloud.</p>
<h3>How to use this editor:</h3>
<ul>
  <li><strong>Select text:</strong> Highlight any sentence or paragraph to trigger the contextual AI action menu.</li>
  <li><strong>Refine your writing:</strong> Fix grammar, rephrase in distinct styles, modulate tone, or condense complex paragraphs using the assistant panel on the right.</li>
  <li><strong>Bring Your Own Key (BYOK):</strong> Click <em>Settings</em> to configure OpenAI, Gemini, Claude, Groq, Ollama (local), or any OpenAI-compatible API endpoint.</li>
  <li><strong>Local-First Storage:</strong> All your documents stay stored in your browser's IndexedDB. Nothing is sent anywhere unless you trigger an AI action.</li>
</ul>
<p>Try highlighting this sentence right now and clicking <em>Improve Writing</em> or <em>Paraphrase</em> to see the side-by-side diff comparison in action!</p>`;

    const plainText = `Welcome to Lingually

Lingually is a complete, private, and open-source AI writing workbench. It pairs deep editing intelligence with the rewriting precision of modern language models—without requiring an expensive subscription or locking your private thoughts in someone else's cloud.

How to use this editor:
- Select text: Highlight any sentence or paragraph to trigger the contextual AI action menu.
- Refine your writing: Fix grammar, rephrase in distinct styles, modulate tone, or condense complex paragraphs using the assistant panel on the right.
- Bring Your Own Key (BYOK): Click Settings to configure OpenAI, Gemini, Claude, Groq, Ollama (local), or any OpenAI-compatible API endpoint.
- Local-First Storage: All your documents stay stored in your browser's IndexedDB. Nothing is sent anywhere unless you trigger an AI action.

Try highlighting this sentence right now and clicking Improve Writing or Paraphrase to see the side-by-side diff comparison in action!`;

    return this.createDocument({
      title: "Welcome to Lingually",
      content: sampleContent,
      plainText: plainText,
      favorite: true,
    });
  },
};
