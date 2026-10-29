"use client";

import React, { useState, useEffect } from "react";
import { DocumentRecord, DocumentRevision } from "@/types/document";
import { DocumentRepository } from "@/lib/documents/repository";
import { computeWordDiff } from "@/lib/utils/diff";
import { Modal } from "../shared/modal";
import { Button } from "../shared/button";
import { Badge } from "../shared/badge";
import { History, RotateCcw, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentText: string;
  onRestore: (restoredDoc?: DocumentRecord) => void;
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
      const restored = await DocumentRepository.restoreRevision(documentId, selectedRevision.id);
      onRestore(restored);
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
        return <Badge variant="brand">BEFORE AI</Badge>;
      case "restore":
        return <Badge variant="warning">RESTORE</Badge>;
      case "auto":
        return <Badge variant="outline">AUTOSAVE</Badge>;
      default:
        return <Badge variant="default">MANUAL</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="REVISION HISTORY & SNAPSHOTS"
      description="Inspect previous states, compare modifications, and restore any previous version."
      maxWidth="4xl"
    >
      <div className="flex h-[480px] border border-line font-mono text-xs">
        {/* Left: Revisions List */}
        <div className="w-72 border-r border-line overflow-y-auto bg-bg-raised p-3 space-y-1.5 shrink-0">
          {isLoading && (
            <div className="p-4 text-center text-muted">LOADING REVISIONS...</div>
          )}

          {!isLoading && revisions.length === 0 && (
            <div className="p-4 text-center text-muted text-[11px]">
              NO REVISIONS RECORDED YET. SNAPSHOTS OCCUR BEFORE MAJOR AI REWRITES.
            </div>
          )}

          {revisions.map((rev) => {
            const isSelected = rev.id === selectedRevisionId;
            return (
              <div
                key={rev.id}
                onClick={() => setSelectedRevisionId(rev.id)}
                className={cn(
                  "p-2.5 rounded-none cursor-pointer border transition-colors",
                  isSelected
                    ? "bg-invert-bg text-invert-fg border-transparent font-medium"
                    : "bg-bg border-line text-muted hover:text-ink hover:border-line-strong"
                )}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(rev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </span>
                  {getTriggerBadge(rev.trigger)}
                </div>

                <div className={cn("text-[11px] font-sans truncate mt-1", isSelected ? "text-invert-fg" : "text-ink")}>
                  {rev.changeSummary || "Automated Snapshot"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Revision Diff & Restore */}
        <div className="flex-1 flex flex-col bg-bg overflow-hidden">
          {selectedRevision ? (
            <>
              <div className="p-3 border-b border-line flex items-center justify-between bg-bg-raised">
                <div>
                  <div className="font-semibold text-ink uppercase tracking-wider text-[11px]">
                    SNAPSHOT FROM {new Date(selectedRevision.createdAt).toLocaleString()}
                  </div>
                  <p className="font-sans text-muted text-[11px]">{selectedRevision.changeSummary}</p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRestore}
                  isLoading={isRestoring}
                  className="h-7 text-[10px]"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  RESTORE THIS REVISION
                </Button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto font-sans text-xs leading-relaxed">
                {diff ? (
                  <div className="whitespace-pre-wrap">
                    {diff.parts.map((part, index) => {
                      if (part.added) {
                        return (
                          <span
                            key={index}
                            className="bg-accent/15 text-accent font-semibold px-0.5"
                          >
                            {part.value}
                          </span>
                        );
                      }
                      if (part.removed) {
                        return (
                          <span
                            key={index}
                            className="bg-danger/15 text-danger line-through px-0.5"
                          >
                            {part.value}
                          </span>
                        );
                      }
                      return <span key={index}>{part.value}</span>;
                    })}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-ink">{selectedRevision.plainText}</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted">
              SELECT A REVISION TO INSPECT.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
