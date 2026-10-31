import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { WritingSuggestion } from "@/types/suggestions";

export const issueDecorationsKey = new PluginKey("issueDecorations");

export interface IssueDecorationsOptions {
  suggestions: WritingSuggestion[];
}

export function mapPlainTextOffsetToDocPos(
  doc: any,
  offset: number,
  length: number
): { from: number; to: number } | null {
  if (offset < 0 || length <= 0) return null;

  const blockSeparator = "\n\n";
  let currentPlainOffset = 0;
  let from: number | null = null;
  let to: number | null = null;

  doc.nodesBetween(0, doc.content.size, (node: any, pos: number) => {
    if (to !== null) return false;

    if (node.isBlock && pos > 0) {
      currentPlainOffset += blockSeparator.length;
    }

    if (node.isText && node.text) {
      const nodeStart = currentPlainOffset;
      const nodeEnd = nodeStart + node.text.length;

      if (from === null && offset >= nodeStart && offset < nodeEnd) {
        from = pos + (offset - nodeStart);
      }

      const targetEnd = offset + length;
      if (from !== null && targetEnd > nodeStart && targetEnd <= nodeEnd) {
        to = pos + (targetEnd - nodeStart);
        return false;
      }

      currentPlainOffset = nodeEnd;
    }
  });

  if (from !== null && to !== null && from < to && to <= doc.content.size) {
    return { from, to };
  }
  return null;
}

export function buildDecorations(doc: any, suggestions: WritingSuggestion[]): DecorationSet {
  if (!suggestions || suggestions.length === 0) {
    return DecorationSet.empty;
  }

  const decos: any[] = [];
  const occupiedRanges: Array<{ from: number; to: number }> = [];

  for (const s of suggestions) {
    if (s.ignored || !s.originalText) continue;

    let range: { from: number; to: number } | null = null;

    // 1. Try position-based mapping using suggestion offset & length (Bug 42)
    if (typeof s.offset === "number" && typeof s.length === "number" && s.length > 0) {
      const mapped = mapPlainTextOffsetToDocPos(doc, s.offset, s.length);
      if (mapped) {
        try {
          const docText = doc.textBetween(mapped.from, mapped.to);
          const isWhitespace = /^\s+$/.test(s.originalText);
          if (
            docText === s.originalText ||
            (isWhitespace && docText.replace(/\u00a0/g, " ") === s.originalText.replace(/\u00a0/g, " "))
          ) {
            range = mapped;
          }
        } catch {
          //
        }
      }
    }

    // 2. Fallback: search for exact word/phrase boundary occurrence if offset mapping fails
    if (!range) {
      const target = s.originalText;
      const isWord = /^\w+$/.test(target);
      const searchPattern = isWord ? new RegExp(`\\b${target}\\b`) : null;

      doc.descendants((node: any, pos: number) => {
        if (range) return false;
        if (node.isText && node.text) {
          let idx = -1;
          if (searchPattern) {
            const m = searchPattern.exec(node.text);
            if (m) idx = m.index;
          } else if (/^\s+$/.test(target)) {
            const normNodeText = node.text.replace(/\u00a0/g, " ");
            const normTarget = target.replace(/\u00a0/g, " ");
            idx = normNodeText.indexOf(normTarget);
          } else {
            idx = node.text.indexOf(target);
          }

          if (idx !== -1) {
            const from = pos + idx;
            const to = from + target.length;
            const overlaps = occupiedRanges.some(
              (r) => (from >= r.from && from < r.to) || (to > r.from && to <= r.to)
            );
            if (!overlaps) {
              range = { from, to };
              return false;
            }
          }
        }
      });
    }

    if (range) {
      const { from, to } = range;
      const overlaps = occupiedRanges.some(
        (r) => (from >= r.from && from < r.to) || (to > r.from && to <= r.to)
      );

      if (!overlaps) {
        let underlineClass =
          "underline decoration-wavy decoration-2 underline-offset-4 cursor-pointer transition-opacity hover:opacity-80 ";
        switch (s.category) {
          case "correctness":
            underlineClass += "decoration-danger";
            break;
          case "clarity":
            underlineClass += "decoration-accent";
            break;
          case "engagement":
            underlineClass += "decoration-emerald-500";
            break;
          case "delivery":
            underlineClass += "decoration-purple-500";
            break;
          default:
            underlineClass += "decoration-danger";
        }

        try {
          decos.push(
            Decoration.inline(from, to, {
              class: underlineClass,
              "data-suggestion-id": s.id,
              "data-category": s.category,
              title: `${s.category.toUpperCase()}: ${s.explanation}`,
            })
          );
          occupiedRanges.push({ from, to });
        } catch {
          // Ignore if out of bounds
        }
      }
    }
  }

  return DecorationSet.create(doc, decos);
}

export const IssueDecorations = Extension.create<IssueDecorationsOptions>({
  name: "issueDecorations",

  addOptions() {
    return {
      suggestions: [],
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: issueDecorationsKey,
        state: {
          init(_, { doc }) {
            return buildDecorations(doc, extension.options.suggestions);
          },
          apply(tr, oldSet, oldState, newState) {
            const meta = tr.getMeta(issueDecorationsKey);
            if (meta && meta.suggestions !== undefined) {
              return buildDecorations(newState.doc, meta.suggestions);
            }
            if (tr.docChanged) {
              return oldSet.map(tr.mapping, tr.doc);
            }
            return oldSet;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
