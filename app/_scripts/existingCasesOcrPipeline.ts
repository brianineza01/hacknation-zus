import "dotenv/config";
import { promises as fs } from "node:fs";
import { join, dirname, basename } from "node:path";
import { extractTextFromImages } from "../_utils/ocr";

const DATA_DIR = join(process.cwd(), "data", "zus_cases");
const MAX_DOCUMENTS = 50;

interface ProcessingStats {
  processed: number;
  skipped: number;
  failed: number;
  failedFiles: Array<{ path: string; error: string }>;
}

async function shouldProcessImages(imagesDir: string): Promise<boolean> {
  const parentDir = dirname(imagesDir);
  const imagesDirName = basename(imagesDir);
  const baseName = imagesDirName.replace("-images", "");
  const mdPath = join(parentDir, `${baseName}.md`);

  try {
    await fs.access(mdPath);
    return false; // Markdown file already exists, skip
  } catch {
    return true; // Markdown file doesn't exist, process
  }
}

async function getImageFiles(imagesDir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(imagesDir);
    const imageFiles = files
      .filter((file) => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
      .sort((a, b) => {
        // Natural sort: extract numbers from filenames for proper ordering
        const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      })
      .map((file) => join(imagesDir, file));

    return imageFiles;
  } catch (error) {
    throw new Error(
      `Failed to read images directory: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function processImages(
  imagesDir: string
): Promise<{ success: boolean; pageCount?: number; error?: string }> {
  try {
    const imageFiles = await getImageFiles(imagesDir);

    if (imageFiles.length === 0) {
      return {
        success: false,
        error: "No image files found in directory",
      };
    }

    const extractedText = await extractTextFromImages(imageFiles);

    const parentDir = dirname(imagesDir);
    const imagesDirName = basename(imagesDir);
    const baseName = imagesDirName.replace("-images", "");
    const mdPath = join(parentDir, `${baseName}.md`);

    await fs.writeFile(mdPath, extractedText, "utf-8");

    return { success: true, pageCount: imageFiles.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function findImageDirectories(dir: string): Promise<string[]> {
  const imageDirs: string[] = [];

  async function scanDirectory(currentDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name.endsWith("-images")) {
            imageDirs.push(fullPath);
          } else {
            await scanDirectory(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${currentDir}:`, error);
    }
  }

  await scanDirectory(dir);
  return imageDirs;
}

async function runPipeline(): Promise<void> {
  console.log("[Pipeline] Starting OCR processing for existing cases...");

  try {
    await fs.access(DATA_DIR);
  } catch {
    console.error(`[Pipeline] Error: Data directory not found at ${DATA_DIR}`);
    process.exit(1);
  }

  const imageDirs = await findImageDirectories(DATA_DIR);
  console.log(`[Pipeline] Found ${imageDirs.length} image directories`);

  const stats: ProcessingStats = {
    processed: 0,
    skipped: 0,
    failed: 0,
    failedFiles: [],
  };

  // Limit to first MAX_DOCUMENTS that need processing
  let processedCount = 0;

  for (const imagesDir of imageDirs) {
    console.log(`[Pipeline] Processing ${imagesDir}...`);
    if (processedCount >= MAX_DOCUMENTS) {
      break;
    }

    const relativePath = imagesDir.replace(DATA_DIR + "/", "");

    if (!(await shouldProcessImages(imagesDir))) {
      console.log(`[Pipeline] Skipping ${relativePath} (markdown file exists)`);
      stats.skipped++;
      continue;
    }

    console.log(`[Pipeline] Processing ${relativePath}...`);
    const result = await processImages(imagesDir);

    if (result.success) {
      console.log(
        `[Pipeline] Processing ${relativePath}... done (${result.pageCount} pages)`
      );
      stats.processed++;
      processedCount++;
    } else {
      console.log(
        `[Pipeline] Failed: ${relativePath} - Error: ${result.error}`
      );
      stats.failed++;
      stats.failedFiles.push({
        path: relativePath,
        error: result.error || "Unknown error",
      });
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
