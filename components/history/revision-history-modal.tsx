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
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto p-2 space-y-1.5 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider">
            Revisions ({revisions.length})
          </div>

          {revisions.map((rev) => {
            const isSelected = rev.id === selectedRevisionId;
            return (
              <button
                key={rev.id}
                onClick={() => setSelectedRevisionId(rev.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border text-xs transition-all space-y-1 block",
                  isSelected
                    ? "border-[#0268cc] bg-white dark:bg-slate-800 shadow-xs ring-1 ring-[#0268cc]"
                    : "border-transparent hover:bg-white dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">
                    {rev.title || "Untitled"}
                  </span>
                  {getTriggerBadge(rev.trigger)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(rev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span>{rev.wordCount} words</span>
                </div>
                {rev.changeSummary && (
                  <p className="text-[10px] text-slate-500 italic truncate">{rev.changeSummary}</p>
                )}
              </button>
            );
          })}

          {revisions.length === 0 && !isLoading && (
            <div className="text-center p-6 text-slate-400 text-xs">No saved revisions yet.</div>
          )}
        </div>

        {/* Selected Revision Diff & Preview */}
        <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col h-full bg-white dark:bg-slate-900 shadow-2xs">
          {selectedRevision ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Snapshot from {new Date(selectedRevision.createdAt).toLocaleString()}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparing past revision against current document.
                  </p>
                </div>

                <button
                  disabled={isRestoring}
                  onClick={handleRestore}
                  className="h-8 px-3 rounded-lg bg-[#0268cc] hover:bg-[#0256a9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore</span>
                </button>
              </div>

              {/* Diff Viewer */}
              <div className="flex-1 overflow-y-auto text-xs leading-relaxed font-sans whitespace-pre-wrap select-text pr-2">
                {diff?.parts.map((part, index) => {
                  if (part.added) {
                    return (
                      <span
                        key={index}
                        className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-medium px-1 py-0.5 rounded"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  if (part.removed) {
                    return (
                      <span
                        key={index}
                        className="bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 line-through px-1 py-0.5 rounded opacity-80"
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
            <div className="flex items-center justify-center flex-1 text-xs text-slate-400">
              Select a revision from the left to preview changes.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
