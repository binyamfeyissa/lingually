import { describe, it, expect, vi } from "vitest";
import { providerRegistry } from "@/lib/ai/provider-registry";
import { readSSEStream } from "@/lib/ai/streaming";
import { parseGrammarOutput, parseAlternativesOutput } from "@/lib/ai/task-runner";

describe("Provider Adapters & Streaming Pipeline", () => {
  it("validates provider configurations correctly", () => {
    // OpenAI requires sk- key
    const openAIInvalid = providerRegistry.validate({
      id: "openai",
      name: "OpenAI",
      apiKey: "",
      defaultModel: "gpt-4o",
      enabled: true,
    });
    expect(openAIInvalid.isValid).toBe(false);

    const openAIValid = providerRegistry.validate({
      id: "openai",
      name: "OpenAI",
      apiKey: "sk-proj-1234567890",
      defaultModel: "gpt-4o",
      enabled: true,
    });
    expect(openAIValid.isValid).toBe(true);

    // Ollama does not require an API key
    const ollamaValid = providerRegistry.validate({
      id: "ollama",
      name: "Ollama",
      baseUrl: "http://localhost:11434",
      defaultModel: "llama3.2:latest",
      enabled: true,
    });
    expect(ollamaValid.isValid).toBe(true);

    // OpenAI compatible requires base URL
    const compatInvalid = providerRegistry.validate({
      id: "openai-compatible",
      name: "OpenAI-Compatible",
      baseUrl: "",
      defaultModel: "default",
      enabled: true,
    });
    expect(compatInvalid.isValid).toBe(false);
  });

  it("decodes SSE streams accurately", async () => {
    const ssePayload = [
      'data: {"delta": "Hello", "done": false}\n\n',
      'data: {"delta": " world!", "done": false}\n\n',
      'data: {"delta": "", "done": true}\n\n',
    ].join("");

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(ssePayload));
        controller.close();
      },
    });

    const chunks: string[] = [];
    const text = await readSSEStream(stream, {
      onChunk: (delta) => chunks.push(delta),
      onDone: () => {},
      onError: () => {},
    });

    expect(text).toBe("Hello world!");
    expect(chunks).toEqual(["Hello", " world!"]);
  });

  it("handles stream cancellation via AbortSignal", async () => {
    const controller = new AbortController();
    controller.abort();

    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array([1, 2, 3]));
      },
    });

    await expect(
      readSSEStream(
        stream,
        {
          onChunk: () => {},
          onDone: () => {},
          onError: () => {},
        },
        controller.signal
      )
    ).rejects.toThrow("canceled");
  });

  it("parses structured grammar JSON output correctly", () => {
    const raw = JSON.stringify({
      correctedText: "She does not like apples.",
      changes: [
        {
          original: "do not likes",
          replacement: "does not like",
          explanation: "Subject-verb agreement error with third-person singular.",
          category: "agreement",
        },
      ],
      summary: "Fixed subject-verb agreement.",
    });

    const parsed = parseGrammarOutput(raw, "Original");
    expect(parsed.correctedText).toBe("She does not like apples.");
    expect(parsed.changes.length).toBe(1);
    expect(parsed.changes[0].category).toBe("agreement");
  });

  it("falls back gracefully when grammar output is not strict JSON", () => {
    const nonJson = "Here is the corrected version: She does not like apples.";
    const parsed = parseGrammarOutput(nonJson, "Original");
    expect(parsed.correctedText).toContain("She does not like apples.");
  });

  it("parses multiple rewrite alternatives from JSON", () => {
    const raw = JSON.stringify({
      alternatives: [
        { id: "1", text: "First rewrite option", label: "Fluent" },
        { id: "2", text: "Second rewrite option", label: "Formal" },
      ],
    });

    const alts = parseAlternativesOutput(raw, 2);
    expect(alts.length).toBe(2);
    expect(alts[0].text).toBe("First rewrite option");
    expect(alts[1].label).toBe("Formal");
  });
});
