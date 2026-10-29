import { PlagiarismReport, PlagiarismMatch } from "@/types/suggestions";

/**
 * Extracts distinctive 5-to-8 word n-gram search queries from text to detect potential matches.
 */
export function extractDistinctiveQueries(text: string, maxQueries = 5): string[] {
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);

  const queries: string[] = [];
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter((w) => w.length > 2);
    if (words.length >= 6) {
      // Create a quoted 6-word phrase query for exact-phrase matching
      const phrase = words.slice(0, 6).join(" ").replace(/["'’]/g, "");
      queries.push(`"${phrase}"`);
      if (queries.length >= maxQueries) break;
    }
  }

  return queries;
}

/**
 * Computes word-level Jaccard similarity between two text excerpts.
 */
export function computeTextSimilarity(textA: string, textB: string): number {
  const setA = new Set(
    textA.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
  );
  const setB = new Set(
    textB.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
  );

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : Number((intersectionCount / unionCount).toFixed(2));
}

export interface PlagiarismCheckOptions {
  text: string;
  searchApiKey?: string;
  searchEndpoint?: string;
  referenceCorpus?: Array<{ title: string; url: string; content: string }>;
}

/**
 * Analyzes text for potential similarity matches against public web searches or local reference corpus.
 */
export async function checkPlagiarism(options: PlagiarismCheckOptions): Promise<PlagiarismReport> {
  const { text, searchApiKey, searchEndpoint, referenceCorpus = [] } = options;
  const trimmed = text.trim();
  const words = trimmed.match(/[\p{L}\p{N}'’]+/gu) || [];
  const totalWords = words.length;

  if (totalWords < 20) {
    return {
      overallSimilarityPercentage: 0,
      totalWords,
      matchedWords: 0,
      matches: [],
      checkedAt: Date.now(),
      isSearchApiConfigured: Boolean(searchApiKey),
      sourceCoverageNotice: "Text is too brief for statistical n-gram similarity analysis (minimum 20 words required).",
      summary: "Document is too brief to analyze.",
    };
  }

  const matches: PlagiarismMatch[] = [];
  let matchedWordCount = 0;
  const docSentences = trimmed.split(/(?<=[.?!])\s+/).filter((s) => s.length > 15);

  // 1. Check against provided reference corpus (such as local library, past revisions, or imported docs)
  if (referenceCorpus.length > 0) {
    for (const ref of referenceCorpus) {
      for (const sentence of docSentences) {
        const similarity = computeTextSimilarity(sentence, ref.content);
        if (similarity >= 0.7) {
          const offset = trimmed.indexOf(sentence);
          const sentenceWords = (sentence.match(/[\p{L}\p{N}'’]+/gu) || []).length;
          matchedWordCount += sentenceWords;

          matches.push({
            id: `match_${matches.length + 1}`,
            matchedText: sentence,
            similarityPercentage: Math.round(similarity * 100),
            sourceTitle: ref.title,
            sourceUrl: ref.url,
            matchContext: `High similarity (${Math.round(similarity * 100)}%) with internal document "${ref.title}".`,
            offset: Math.max(0, offset),
            length: sentence.length,
          });
        }
      }
    }
  }

  // 2. Query Wikipedia Public Search Corpus (Open API)
  try {
    const wikiQueries = extractDistinctiveQueries(trimmed, 4);
    const matchedSentences = new Set<string>();
    const checkedWikiTitles = new Set<string>();

    for (const query of wikiQueries) {
      const cleanQuery = query.replace(/["']/g, "").trim();
      if (!cleanQuery) continue;
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&origin=*`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        const items = data.query?.search || [];
        for (const item of items.slice(0, 2)) {
          const titleKey = (item.title || "").toLowerCase();
          if (checkedWikiTitles.has(titleKey)) continue;
          checkedWikiTitles.add(titleKey);

          const rawSnippet = (item.snippet || "").replace(/<[^>]+>/g, " ");
          const sim = computeTextSimilarity(cleanQuery, rawSnippet);
          if (sim >= 0.2) {
            // Fetch full article extract (omitting exintro=1) for comprehensive body passage matching (Bug 40)
            let articleText = rawSnippet;
            try {
              const extractRes = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(item.title)}&format=json&origin=*`,
                { headers: { Accept: "application/json" } }
              );
              if (extractRes.ok) {
                const extData = await extractRes.json();
                const pages = extData.query?.pages || {};
                const firstPage = Object.values(pages)[0] as { extract?: string } | undefined;
                if (firstPage?.extract) {
                  articleText = rawSnippet + " " + firstPage.extract.slice(0, 150000);
                }
              }
            } catch {
              // fallback to rawSnippet
            }

            // Normalize article text for robust punctuation-insensitive and citation-insensitive matching
            const normArticle = articleText
              .toLowerCase()
              .replace(/\[[0-9a-z\s]+\]/gi, " ")
              .replace(/[^\p{L}\p{N}\s]/gu, " ")
              .replace(/\s+/g, " ");

            let matchedForThisSource = 0;

            for (const sentence of docSentences) {
              if (matchedSentences.has(sentence)) continue;
              const normSentence = sentence
                .toLowerCase()
                .replace(/\[[0-9a-z\s]+\]/gi, " ")
                .replace(/[^\p{L}\p{N}\s]/gu, " ")
                .replace(/\s+/g, " ")
                .trim();

              if (normSentence.length < 15) continue;

              let isSentenceMatch = false;

              // Direct substring match
              if (normArticle.includes(normSentence)) {
                isSentenceMatch = true;
              } else {
                // Check 5-word shingle in article
                const words = normSentence.split(" ").filter((w) => w.length > 2);
                if (words.length >= 5) {
                  for (let i = 0; i <= words.length - 5; i++) {
                    const shingle = words.slice(i, i + 5).join(" ");
                    if (normArticle.includes(shingle)) {
                      isSentenceMatch = true;
                      break;
                    }
                  }
                }
                if (!isSentenceMatch && computeTextSimilarity(sentence, articleText) >= 0.35) {
                  isSentenceMatch = true;
                }
              }

              if (isSentenceMatch) {
                matchedSentences.add(sentence);
                const sWords = sentence.split(/\s+/).filter(Boolean).length;
                matchedForThisSource += sWords;
              }
            }

            if (matchedForThisSource === 0) {
              matchedForThisSource = cleanQuery.split(/\s+/).filter(Boolean).length;
            }

            matchedWordCount = Math.min(totalWords, matchedWordCount + matchedForThisSource);
            const simPct = Math.min(100, Math.round(Math.max(sim, matchedWordCount / Math.max(1, totalWords)) * 100));

            matches.push({
              id: `wiki_match_${matches.length + 1}`,
              matchedText: cleanQuery,
              similarityPercentage: simPct,
              sourceTitle: `Wikipedia: ${item.title}`,
              sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
              matchContext: rawSnippet,
              offset: Math.max(0, trimmed.toLowerCase().indexOf(cleanQuery.toLowerCase())),
              length: cleanQuery.length,
            });
            break;
          }
        }
      }
    }
  } catch {
    // Graceful offline fallback
  }

  // 2. Check if a live search API is provided
  const isSearchApiConfigured = Boolean(searchApiKey);
  let sourceCoverageNotice = "";

  if (isSearchApiConfigured && searchEndpoint) {
    try {
      const queries = extractDistinctiveQueries(trimmed, 3);
      for (const query of queries) {
        // Query external search endpoint with API key
        const response = await fetch(`${searchEndpoint}?q=${encodeURIComponent(query)}&key=${searchApiKey}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data.items) ? data.items : [];
          for (const item of items.slice(0, 2)) {
            const snippet = item.snippet || item.title || "";
            const similarity = computeTextSimilarity(query.replace(/"/g, ""), snippet);
            if (similarity >= 0.5) {
              const matchedText = query.replace(/"/g, "");
              const offset = trimmed.indexOf(matchedText);

              matches.push({
                id: `web_match_${matches.length + 1}`,
                matchedText,
                similarityPercentage: Math.round(similarity * 100),
                sourceTitle: item.title || "Public Web Source",
                sourceUrl: item.link || item.url || "#",
                matchContext: snippet,
                offset: Math.max(0, offset),
                length: matchedText.length,
              });
            }
          }
        }
      }
      sourceCoverageNotice = "Scanned against public web indexing engine via configured search API.";
    } catch {
      sourceCoverageNotice = "Web search endpoint connection failed. Reverted to local n-gram corpus comparison.";
    }
  } else {
    sourceCoverageNotice =
      "Local similarity mode active. Public web similarity scanning requires an optional search API key in Settings. The generated query phrases below can also be verified manually on search engines.";
  }

  const overallSimilarityPercentage = totalWords > 0
    ? Math.min(100, Math.round((matchedWordCount / totalWords) * 100))
    : 0;

  const summary = matches.length > 0
    ? `Identified ${matches.length} matching passage${matches.length === 1 ? "" : "s"} (${overallSimilarityPercentage}% overlap). Review matches and source attributions below.`
    : "No matching text passages detected in available reference sources. Writing appears original.";

  return {
    overallSimilarityPercentage,
    totalWords,
    matchedWords: matchedWordCount,
    matches,
    checkedAt: Date.now(),
    isSearchApiConfigured,
    sourceCoverageNotice,
    summary,
  };
}
