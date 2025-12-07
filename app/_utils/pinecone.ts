import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { embedMany } from "ai";
import { Pinecone } from "@pinecone-database/pinecone";

export interface DocumentMetadata {
  [key: string]: string | number | boolean | string[];
}

function chunkMarkdownByHeaders(markdownText: string): string[] {
  const chunks: string[] = [];
  const lines = markdownText.split("\n");
  let currentChunk: string[] = [];
  let currentHeader: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headerMatch) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join("\n"));
      }

      const headerLevel = headerMatch[1].length;

      currentHeader = currentHeader.filter((h) => {
        const hLevel = h.match(/^(#{1,6})/)?.[1].length || 0;
        return hLevel < headerLevel;
      });
      currentHeader.push(line);

      currentChunk = [...currentHeader, ""];
    } else {
      currentChunk.push(line);
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n"));
  }

  if (chunks.length === 0) {
    return [markdownText];
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
}

/**
 * Seeds a markdown document to Pinecone by chunking it, generating embeddings,
 * and storing them in the zus-notification index
 *
 * @param markdownText - The markdown text content to seed
 * @param metadata - Metadata to associate with all chunks from this document
 * @throws Error if API keys are missing or if seeding fails
 */
export async function seedDocumentToPinecone(
  markdownText: string,
  metadata: DocumentMetadata
): Promise<void> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY environment variable is not set");
  }

  const chunks = chunkMarkdownByHeaders(markdownText);
  const totalChunks = chunks.length;

  if (chunks.length === 0) {
    throw new Error("No chunks generated from markdown text");
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const embeddingResult = await embedMany({
    model: openrouter.textEmbeddingModel("openai/text-embedding-3-large"),
    values: chunks,
  });

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.index("zus-notification");

  const vectors = embeddingResult.embeddings.map((embedding, index) => {
    const chunkMetadata = {
      ...metadata,
      chunkIndex: index,
      totalChunks: totalChunks,
      text: chunks[index],
    };

    const metadataId = Object.entries(metadata)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join("_");
    const vectorId = `${metadataId}_chunk_${index}`;

    return {
      id: vectorId,
      values: embedding,
      metadata: chunkMetadata,
    };
  });

  await index.upsert(vectors);

  console.log(
    `Successfully seeded ${vectors.length} chunks to Pinecone index 'zus-notification'`
  );
}
