"use client";

import React, { useState, useEffect } from "react";
import { DocumentRevision } from "@/types/document";
import { DocumentRepository } from "@/lib/documents/repository";
import { computeWordDiff } from "@/lib/utils/diff";
import { Modal } from "../shared/modal";
import { Button } from "../shared/button";
import { Badge } from "../shared/badge";
import { History, RotateCcw, Clock, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentText: string;
  onRestore: () => void;
}

export function RevisionHistoryModal({
  isOpen,
  onClose,
  documentId,
  currentText,
  onRestore,
}: RevisionHistoryModalProps) {
  const [revisions, setRevisions] = useState<DocumentRevision[]>([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && documentId) {
      loadRevisions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, documentId]);

  const loadRevisions = async () => {
    setIsLoading(true);
    try {
      const list = await DocumentRepository.getRevisions(documentId);
      setRevisions(list);
      if (list.length > 0 && !selectedRevisionId) {
        setSelectedRevisionId(list[0].id);
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRevision = revisions.find((r) => r.id === selectedRevisionId);

  const handleRestore = async () => {
    if (!selectedRevision) return;
    setIsRestoring(true);
    try {
      await DocumentRepository.restoreRevision(documentId, selectedRevision.id);
      onRestore();
      onClose();
    } catch {
      //
    } finally {
      setIsRestoring(false);
    }
  };

  const diff = selectedRevision ? computeWordDiff(selectedRevision.plainText, currentText) : null;

  const getTriggerBadge = (trigger: DocumentRevision["trigger"]) => {
    switch (trigger) {
      case "before-ai-apply":
        return <Badge variant="brand">Before AI Edit</Badge>;
      case "restore":
        return <Badge variant="warning">Restoration</Badge>;
      case "auto":
        return <Badge variant="outline">Auto-save</Badge>;
      default:
        return <Badge variant="default">Manual</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revision History & Recovery"
      description="Compare and restore previous versions of this document."
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[480px]">
        {/* Revisions Timeline List */}
        <div className="border border-surface-border rounded-lg overflow-y-auto p-2 space-y-1.5 bg-surface-muted/30">
          <div className="text-[11px] font-semibold text-foreground/60 px-2 py-1 uppercase tracking-wider">
            Revisions ({revisions.length})
          </div>

          {revisions.map((rev) => {
            const isSelected = rev.id === selectedRevisionId;
            return (
              <button
                key={rev.id}
                onClick={() => setSelectedRevisionId(rev.id)}
                className={cn(
                  "w-full text-left p-2.5 rounded-md border text-xs transition-colors space-y-1 block",
                  isSelected
                    ? "border-brand-500 bg-surface shadow-sm"
                    : "border-transparent hover:bg-surface hover:border-surface-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground truncate max-w-[140px]">
                    {rev.title || "Untitled"}
                  </span>
                  {getTriggerBadge(rev.trigger)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-foreground/50">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(rev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span>{rev.wordCount} words</span>
                </div>
                {rev.changeSummary && (
                  <p className="text-[10px] text-foreground/60 italic truncate">{rev.changeSummary}</p>
                )}
              </button>
            );
          })}

          {revisions.length === 0 && !isLoading && (
            <div className="text-center p-6 text-foreground/50 text-xs">No saved revisions yet.</div>
          )}
        </div>

        {/* Selected Revision Diff & Preview */}
        <div className="md:col-span-2 border border-surface-border rounded-lg p-4 flex flex-col h-full bg-surface">
          {selectedRevision ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Snapshot from {new Date(selectedRevision.createdAt).toLocaleString()}
                  </h3>
                  <p className="text-xs text-foreground/60">
                    Comparing past revision against current document.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isRestoring}
                  onClick={handleRestore}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore Revision
                </Button>
              </div>

              {/* Diff Viewer */}
              <div className="flex-1 overflow-y-auto text-xs leading-relaxed font-sans whitespace-pre-wrap select-text pr-2">
                {diff?.parts.map((part, index) => {
                  if (part.added) {
                    return (
                      <span
                        key={index}
                        className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 font-medium px-0.5 rounded-sm"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  if (part.removed) {
                    return (
                      <span
                        key={index}
                        className="bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 line-through opacity-70 px-0.5 rounded-sm"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  return <span key={index}>{part.value}</span>;
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-xs text-foreground/50">
              Select a revision from the left to preview changes.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
