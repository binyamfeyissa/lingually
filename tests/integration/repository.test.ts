import { describe, it, expect, beforeEach } from "vitest";
import { DocumentRepository } from "@/lib/documents/repository";
import { db } from "@/lib/documents/schema";

describe("DocumentRepository (Local-First IndexedDB)", () => {
  beforeEach(async () => {
    await DocumentRepository.clearAllData();
  });

  it("creates, updates, and fetches documents", async () => {
    const doc = await DocumentRepository.createDocument({
      title: "Test Draft",
      content: "<p>Initial text</p>",
      plainText: "Initial text",
    });

    expect(doc.id).toBeDefined();
    expect(doc.title).toBe("Test Draft");
    expect(doc.wordCount).toBe(2);

    const fetched = await DocumentRepository.getDocument(doc.id);
    expect(fetched?.title).toBe("Test Draft");

    const updated = await DocumentRepository.updateDocument(doc.id, {
      title: "Updated Title",
      plainText: "Initial text with more words added",
    });
    expect(updated.title).toBe("Updated Title");
    expect(updated.wordCount).toBe(6);
  });

  it("creates revision snapshots and restores previous revisions", async () => {
    const doc = await DocumentRepository.createDocument({
      title: "Version 1",
      content: "<p>Original version</p>",
      plainText: "Original version",
    });

    // Create a revision before editing
    const rev1 = await DocumentRepository.createRevision(doc.id, "manual", "First revision");
    expect(rev1.documentId).toBe(doc.id);

    // Update document to Version 2
    await DocumentRepository.updateDocument(doc.id, {
      title: "Version 2",
      content: "<p>Second modified version</p>",
      plainText: "Second modified version",
    });

    // Restore to Version 1
    const restored = await DocumentRepository.restoreRevision(doc.id, rev1.id);
    expect(restored.title).toBe("Version 1");
    expect(restored.plainText).toBe("Original version");
  });

  it("duplicates documents accurately", async () => {
    const doc = await DocumentRepository.createDocument({
      title: "Original Work",
      content: "<p>Content to copy</p>",
      plainText: "Content to copy",
    });

    const copy = await DocumentRepository.duplicateDocument(doc.id);
    expect(copy.id).not.toBe(doc.id);
    expect(copy.title).toBe("Original Work (Copy)");
    expect(copy.plainText).toBe(doc.plainText);
  });

  it("toggles favorite status", async () => {
    const doc = await DocumentRepository.createDocument({ title: "Fav Doc" });
    expect(doc.favorite).toBe(false);

    const isFav = await DocumentRepository.toggleFavorite(doc.id);
    expect(isFav).toBe(true);

    const isNotFav = await DocumentRepository.toggleFavorite(doc.id);
    expect(isNotFav).toBe(false);
  });
});
