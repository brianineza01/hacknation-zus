import "dotenv/config";
import { promises as fs } from "node:fs";
import { join, basename } from "node:path";
import { templateFieldsExtraction } from "../_utils/templateExtraction";
import {
  seedDocumentToPinecone,
  type DocumentMetadata,
} from "../_utils/pinecone";

const DATA_DIR = join(process.cwd(), "data", "zus_cases");
const TRACKER_FILE = join(process.cwd(), "data", "seeded-documents.json");

type SeededTracker = Record<string, boolean>;

function normalizeCaseId(folderName: string): string {
  return folderName.replace(/\s+/g, "-");
}

function matchTemplateId(fileName: string): string | null {
  const normalizedName = fileName.toLowerCase().trim();

  if (normalizedName.startsWith("zawiadomienie o wypadku")) {
    return "zawiadomienie_o_wypadku";
  }

  if (
    normalizedName.startsWith("wyjaśnienia poszkodowanego") ||
    normalizedName.startsWith("zapis wyjaśnień poszkodowanego") ||
    normalizedName.startsWith("zapis wyjaśnien poszkodowanego")
  ) {
    return "zapis_wyjasnien_poszkodowanego";
  }

  if (
    normalizedName.startsWith("karta wypadku") ||
    normalizedName.startsWith("opinia")
  ) {
    return null;
  }

  return null;
}

async function loadTracker(): Promise<SeededTracker> {
  try {
    const content = await fs.readFile(TRACKER_FILE, "utf-8");
    return JSON.parse(content) as SeededTracker;
  } catch {
    return {};
  }
}

async function saveTracker(tracker: SeededTracker): Promise<void> {
  await fs.mkdir(join(process.cwd(), "data"), { recursive: true });
  await fs.writeFile(TRACKER_FILE, JSON.stringify(tracker, null, 2), "utf-8");
}

function getDocumentKey(caseId: string, templateId: string): string {
  return `${caseId}/${templateId}`;
}

async function findCaseDirectories(): Promise<string[]> {
  const caseDirs: string[] = [];

  try {
    const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        caseDirs.push(join(DATA_DIR, entry.name));
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to read case directories: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return caseDirs;
}

async function findMarkdownFiles(caseDir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(caseDir);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => join(caseDir, file));
  } catch (error) {
    throw new Error(
      `Failed to read markdown files in ${caseDir}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

interface ProcessingStats {
  processed: number;
  skipped: number;
  failed: number;
  failedFiles: Array<{ path: string; error: string }>;
}

async function runPipeline(): Promise<void> {
  console.log("[Pipeline] Starting document extraction and seeding...");

  try {
    await fs.access(DATA_DIR);
  } catch {
    console.error(`[Pipeline] Error: Data directory not found at ${DATA_DIR}`);
    process.exit(1);
  }

  const tracker = await loadTracker();
  const caseDirs = await findCaseDirectories();
  console.log(`[Pipeline] Found ${caseDirs.length} case directories`);

  const stats: ProcessingStats = {
    processed: 0,
    skipped: 0,
    failed: 0,
    failedFiles: [],
  };

  for (const caseDir of caseDirs) {
    const caseFolderName = basename(caseDir);
    const caseId = normalizeCaseId(caseFolderName);
    console.log(`[Pipeline] Processing case: ${caseId}`);

    const markdownFiles = await findMarkdownFiles(caseDir);

    for (const mdFile of markdownFiles) {
      const fileName = basename(mdFile, ".md");
      const templateId = matchTemplateId(fileName);

      if (!templateId) {
        console.log(
          `[Pipeline] Skipping ${fileName} (no template match or skipped type)`
        );
        stats.skipped++;
        continue;
      }

      const documentKey = getDocumentKey(caseId, templateId);

      if (tracker[documentKey]) {
        console.log(`[Pipeline] Skipping ${documentKey} (already seeded)`);
        stats.skipped++;
        continue;
      }

      try {
        console.log(`[Pipeline] Processing ${documentKey}...`);

        const markdownContent = await fs.readFile(mdFile, "utf-8");

        const extractedData = await templateFieldsExtraction(
          markdownContent,
          templateId
        );

        const metadata: DocumentMetadata = {
          caseId,
          templateId,
          extractedData: JSON.stringify(extractedData.data),
        };

        await seedDocumentToPinecone(markdownContent, metadata);

        tracker[documentKey] = true;
        await saveTracker(tracker);

        console.log(`[Pipeline] Successfully processed ${documentKey}`);
        stats.processed++;
      } catch (error) {
        let errorMessage: string;
        if (error instanceof Error) {
          errorMessage = error.message;
          if (error.cause) {
            errorMessage += ` (cause: ${String(error.cause)})`;
          }
          if (error.stack) {
            console.error(
              `[Pipeline] Error stack for ${documentKey}:`,
              error.stack
            );
          }
        } else {
          errorMessage = String(error);
        }
        console.error(
          `[Pipeline] Failed to process ${documentKey}: ${errorMessage}`
        );
        stats.failed++;
        stats.failedFiles.push({
          path: documentKey,
          error: errorMessage,
        });
      }
    }
  }

  console.log(
    `[Pipeline] Complete: ${stats.processed} processed, ${stats.skipped} skipped, ${stats.failed} failed`
  );

  if (stats.failedFiles.length > 0) {
    console.log("\n[Pipeline] Failed files:");
    stats.failedFiles.forEach(({ path, error }) => {
      console.log(`  - ${path}: ${error}`);
    });
  }
}

if (require.main === module) {
  runPipeline().catch((error) => {
    console.error("[Pipeline] Fatal error:", error);
    process.exit(1);
  });
}

export { runPipeline };
