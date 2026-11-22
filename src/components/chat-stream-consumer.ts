/**
 * Processes server-sent events stream chunks from the grounded chat API.
 */
export async function consumeChatStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (chunk: string) => void
): Promise<void> {
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunkText = decoder.decode(value, { stream: true });
    const lines = chunkText.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const rawData = line.replace('data: ', '').trim();
        if (rawData === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(rawData) as { chunk?: string };
          if (parsed.chunk) {
            onChunk(parsed.chunk);
          }
        } catch {
          // Ignore non-json chunk lines
        }
      }
    }
  }
}
