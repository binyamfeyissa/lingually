# Plagiarism & AI Text Verification Methodology

Lingually includes a transparent, privacy-first plagiarism and AI text verification engine designed to verify original authorship without surrendering your documents to third-party databases.

---

## 1. Plagiarism Detection Architecture

Traditional plagiarism checkers (e.g. Turnitin) ingest your entire document into proprietary databases, indexing your private drafts without consent. Lingually operates locally and on-demand using a three-tier analysis pipeline:

### 1.1 Multi-Scale N-Gram Extraction
The document text is normalized and decomposed into overlapping word sequences (5-grams through 8-grams). Punctuation, capitalization, and minor stopwords are handled consistently to detect both verbatim copying and light paraphrasing.

### 1.2 Local Corpus Comparison
When running inside Lingually, your active document is compared against:
1. **Your Local Document Repository**: Compares text against all your existing drafts stored in local IndexedDB storage to identify cross-document duplication or self-plagiarism.
2. **Benchmark Open Text Sets**: Matches against common open-access texts and literature snippets.

### 1.3 Targeted Attribution Query Generation
For sections with high repetition or distinctive phrasing, Lingually generates targeted search attribution phrases (exact quote queries). Users can verify individual matches directly on the web or through their connected BYOK search provider.

---

## 2. AI Text Detection & Perplexity Analysis

### 2.1 Perplexity & Burstiness Scoring
Large Language Models exhibit distinctive statistical signatures:
- **Perplexity**: A measure of how predictable the next token is given preceding context. AI-generated text typically displays uniform, low-to-medium perplexity.
- **Burstiness**: Human writing exhibits high variance in sentence length, structural complexity, and vocabulary choice ("burstiness"). AI text tends to maintain uniform sentence cadence.

Lingually evaluates these linguistic metrics across sentence boundaries, generating:
- **Estimated AI Probability Score** (0% to 100%).
- **Sentence-by-Sentence Breakdown**: Highlights sentences that exhibit typical synthetic patterns versus dynamic human variations.

### 2.2 Ethical Transparency & Caveats
> [!IMPORTANT]
> **No AI text detector is 100% reliable.**
> Stylistic analysis can produce false positives on formal academic writing, technical documentation, legal agreements, and non-native English writing. Lingually explicitly marks all AI detection scores as heuristic estimates and does not store or share your text.
