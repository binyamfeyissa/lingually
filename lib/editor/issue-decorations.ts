import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { WritingSuggestion } from "@/types/suggestions";

export const issueDecorationsKey = new PluginKey("issueDecorations");

export interface IssueDecorationsOptions {
  suggestions: WritingSuggestion[];
}

export function buildDecorations(doc: any, suggestions: WritingSuggestion[]): DecorationSet {
  if (!suggestions || suggestions.length === 0) {
    return DecorationSet.empty;
  }

  const decos: any[] = [];
  const textNodes: Array<{ pos: number; text: string }> = [];

  doc.descendants((node: any, pos: number) => {
    if (node.isText && node.text) {
      textNodes.push({ pos, text: node.text });
    }
  });

  const occupiedRanges: Array<{ from: number; to: number }> = [];

  for (const s of suggestions) {
    if (s.ignored || !s.originalText) continue;

    const target = s.originalText;
    let placed = false;

    for (const tn of textNodes) {
      if (placed) break;
      let searchIdx = 0;
      while ((searchIdx = tn.text.indexOf(target, searchIdx)) !== -1) {
        const from = tn.pos + searchIdx;
        const to = from + target.length;

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
            placed = true;
            break;
          } catch {
            // Ignore if out of bounds
          }
        }
        searchIdx += target.length;
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
