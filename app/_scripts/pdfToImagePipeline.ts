import { promises as fs } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { pdf } from "pdf-to-img";

const DATA_DIR = join(process.cwd(), "data", "zus_cases");
const IMAGE_SCALE = 3;

interface ProcessingStats {
  processed: number;
  skipped: number;
  failed: number;
  failedFiles: Array<{ path: string; error: string }>;
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function shouldProcessPdf(pdfPath: string): Promise<boolean> {
  const pdfDir = dirname(pdfPath);
  const pdfName = basename(pdfPath, extname(pdfPath));
  const imagesDir = join(pdfDir, `${pdfName}-images`);
  
  try {
    await fs.access(imagesDir);
    const files = await fs.readdir(imagesDir);
    return files.length === 0;
  } catch {
    return true;
  }
}

async function processPdf(pdfPath: string): Promise<{ success: boolean; pageCount?: number; error?: string }> {
  try {
    const pdfDir = dirname(pdfPath);
    const pdfName = basename(pdfPath, extname(pdfPath));
    const imagesDir = join(pdfDir, `${pdfName}-images`);
    
    await ensureDirectoryExists(imagesDir);
    
    const document = await pdf(pdfPath, { scale: IMAGE_SCALE });
    let pageCount = 0;
    
    for await (const image of document) {
      pageCount++;
      await fs.writeFile(join(imagesDir, `page${pageCount}.png`), image);
    }
    
    return { success: true, pageCount };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

async function findPdfFiles(dir: string): Promise<string[]> {
  const pdfFiles: string[] = [];
  
  async function scanDirectory(currentDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
          pdfFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${currentDir}:`, error);
    }
  }
  
  await scanDirectory(dir);
  return pdfFiles;
}

async function runPipeline(): Promise<void> {
  console.log("[Pipeline] Starting PDF to image conversion...");
  
  try {
    await fs.access(DATA_DIR);
  } catch {
    console.error(`[Pipeline] Error: Data directory not found at ${DATA_DIR}`);
    process.exit(1);
  }
  
  const pdfFiles = await findPdfFiles(DATA_DIR);
  console.log(`[Pipeline] Found ${pdfFiles.length} PDF files`);
  
  const stats: ProcessingStats = {
    processed: 0,
    skipped: 0,
    failed: 0,
    failedFiles: []
  };
  
  for (const pdfPath of pdfFiles) {
    const relativePath = pdfPath.replace(DATA_DIR + "/", "");
    
    if (!(await shouldProcessPdf(pdfPath))) {
      console.log(`[Pipeline] Skipping ${relativePath} (images exist)`);
      stats.skipped++;
      continue;
    }
    
    console.log(`[Pipeline] Processing ${relativePath}...`);
    const result = await processPdf(pdfPath);
    
    if (result.success) {
      console.log(`[Pipeline] Processing ${relativePath}... done (${result.pageCount} pages)`);
      stats.processed++;
    } else {
      console.log(`[Pipeline] Failed: ${relativePath} - Error: ${result.error}`);
      stats.failed++;
      stats.failedFiles.push({
        path: relativePath,
        error: result.error || "Unknown error"
      });
    }
  }
  
  console.log(`[Pipeline] Complete: ${stats.processed} processed, ${stats.skipped} skipped, ${stats.failed} failed`);
  
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