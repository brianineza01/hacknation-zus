import { Pinecone } from "@pinecone-database/pinecone";

export interface DocumentMetadata {
  [key: string]: string | number | boolean | string[];
}

function chunkByParagraphs(markdownText: string): string[] {
  const paragraphs = markdownText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  const paragraphsPerChunk = 3;

  for (let i = 0; i < paragraphs.length; i += paragraphsPerChunk) {
    const chunk = paragraphs.slice(i, i + paragraphsPerChunk).join("\n\n");
    chunks.push(chunk);
  }

  return chunks.length > 0 ? chunks : [markdownText];
}

const MAX_BATCH_SIZE_TEXT = 96;
const DEFAULT_NAMESPACE = "__default__";
const DEFAULT_TEXT_FIELD = "text";

/**
 * Seeds a markdown document to Pinecone by chunking it and storing text directly.
 * Pinecone will handle vectorization server-side using integrated embedding.
 *
 * @param markdownText - The markdown text content to seed
 * @param metadata - Metadata to associate with all chunks from this document
 * @param options - Optional configuration
 * @param options.namespace - Namespace to upsert into (default: "__default__")
 * @param options.textField - Field name for text that matches index field_map (default: "text")
 * @throws Error if API key is missing or if seeding fails
 */
export async function seedDocumentToPinecone(
  markdownText: string,
  metadata: DocumentMetadata,
  options?: {
    namespace?: string;
    textField?: string;
  }
): Promise<void> {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY environment variable is not set");
  }

  const chunks = chunkByParagraphs(markdownText);
  const totalChunks = chunks.length;

  if (chunks.length === 0) {
    throw new Error("No chunks generated from markdown text");
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.index("zus-notification-better");
  const namespace = options?.namespace ?? DEFAULT_NAMESPACE;
  const textField = options?.textField ?? DEFAULT_TEXT_FIELD;

  const caseId = metadata.caseId as string;
  const templateId = metadata.templateId as string;

  if (!caseId || !templateId) {
    throw new Error(
      "Metadata must include 'caseId' and 'templateId' fields for record ID generation"
    );
  }

  const records = chunks.map((chunk, chunkIndex) => {
    const chunkMetadata = {
      ...metadata,
      chunkIndex,
      totalChunks,
    };

    const recordId = `${caseId}_${templateId}_chunk_${chunkIndex}`;

    return {
      _id: recordId,
      [textField]: chunk,
      ...chunkMetadata,
    };
  });

  const namespaceIndex = index.namespace(namespace);

  for (let i = 0; i < records.length; i += MAX_BATCH_SIZE_TEXT) {
    const batch = records.slice(i, i + MAX_BATCH_SIZE_TEXT);
    await namespaceIndex.upsertRecords(batch);
  }

  console.log(
    `Successfully seeded ${records.length} chunks to Pinecone index 'zus-notification-better' in namespace '${namespace}'`
  );
}
