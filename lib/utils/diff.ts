import { diffWordsWithSpace, diffChars, Change } from "diff";

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface DiffSummary {
  parts: DiffPart[];
  additionsCount: number;
  deletionsCount: number;
  hasChanges: boolean;
}

/**
 * Calculates word-level diff between original and suggested text.
 */
export function computeWordDiff(original: string, suggested: string): DiffSummary {
  const changes: Change[] = diffWordsWithSpace(original, suggested);

  let additionsCount = 0;
  let deletionsCount = 0;

  const parts: DiffPart[] = changes.map((c) => {
    if (c.added) additionsCount++;
    if (c.removed) deletionsCount++;
    return {
      value: c.value,
      added: c.added,
      removed: c.removed,
    };
  });

  return {
    parts,
    additionsCount,
    deletionsCount,
    hasChanges: additionsCount > 0 || deletionsCount > 0,
  };
}

/**
 * Calculates character-level diff for granular spelling or punctuation checks.
 */
export function computeCharDiff(original: string, suggested: string): DiffSummary {
  const changes: Change[] = diffChars(original, suggested);

  let additionsCount = 0;
  let deletionsCount = 0;

  const parts: DiffPart[] = changes.map((c) => {
    if (c.added) additionsCount++;
    if (c.removed) deletionsCount++;
    return {
      value: c.value,
      added: c.added,
      removed: c.removed,
    };
  });

  return {
    parts,
    additionsCount,
    deletionsCount,
    hasChanges: additionsCount > 0 || deletionsCount > 0,
  };
}
