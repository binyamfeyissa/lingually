export interface StreamCallbacks {
  onChunk: (delta: string, accumulatedText: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

/**
 * Consumes a normalized server-sent event (SSE) stream from the AI proxy.
 * Expected format per event: `data: {"delta": "...", "done": boolean}\n\n`
 */
export async function readSSEStream(
  stream: ReadableStream<Uint8Array>,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let accumulatedText = "";
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel("User aborted stream");
        throw new Error("AI request was canceled by the user.");
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        try {
          const payload = JSON.parse(trimmed.slice(6));
          if (payload.delta) {
            accumulatedText += payload.delta;
            callbacks.onChunk(payload.delta, accumulatedText);
          }
          if (payload.done) {
            callbacks.onDone(accumulatedText);
            return accumulatedText;
          }
        } catch {
          // Ignore partial or unparseable lines in stream
        }
      }
    }

    // Flush any remaining buffer text
    if (buffer.trim().startsWith("data: ")) {
      try {
        const payload = JSON.parse(buffer.trim().slice(6));
        if (payload.delta) {
          accumulatedText += payload.delta;
          callbacks.onChunk(payload.delta, accumulatedText);
        }
      } catch {
        // Ignore
      }
    }

    callbacks.onDone(accumulatedText);
    return accumulatedText;
  } catch (err: unknown) {
    if (signal?.aborted) {
      const abortError = new Error("AI request was canceled.");
      callbacks.onError(abortError);
      throw abortError;
    }
    const error = err instanceof Error ? err : new Error(String(err));
    callbacks.onError(error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
