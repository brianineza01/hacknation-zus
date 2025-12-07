import { pdf } from "pdf-to-img";
import { extractTextFromImages } from "./ocr";
import { templateFieldsExtraction } from "./templateExtraction";
import { templates } from "./templates";
import type { PrimaryFormType } from "../_types/case";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

const IMAGE_SCALE = 3;

type OcrResult =
  | {
      success: true;
      templateId: PrimaryFormType;
      extractedData: Record<string, unknown>;
      missingFields: string[];
      ocrText: string;
    }
  | {
      success: false;
      error: string;
    };

const downloadPdfFromUrl = async (url: string): Promise<Buffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const convertPdfToImages = async (pdfBuffer: Buffer): Promise<string[]> => {
  const tempDir = join(tmpdir(), `pdf-ocr-${randomBytes(8).toString("hex")}`);
  await mkdir(tempDir, { recursive: true });

  const pdfPath = join(tempDir, "document.pdf");
  await writeFile(pdfPath, pdfBuffer);

  const imagePaths: string[] = [];
  const document = await pdf(pdfPath, { scale: IMAGE_SCALE });

  let pageNumber = 0;
  for await (const image of document) {
    pageNumber++;
    const imagePath = join(tempDir, `page${pageNumber}.png`);
    await writeFile(imagePath, image);
    imagePaths.push(imagePath);
  }

  return imagePaths;
};

const identifyMissingFields = (
  data: Record<string, unknown>,
  prefix = ""
): string[] => {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      missing.push(fullKey);
    } else if (typeof value === "object" && !Array.isArray(value)) {
      missing.push(
        ...identifyMissingFields(value as Record<string, unknown>, fullKey)
      );
    }
  }

  return missing;
};

export const processPrimaryFormOcr = async (
  pdfUrl: string,
  templateId: PrimaryFormType
): Promise<OcrResult> => {
  try {
    const pdfBuffer = await downloadPdfFromUrl(pdfUrl);

    const imagePaths = await convertPdfToImages(pdfBuffer);

    const ocrText = await extractTextFromImages(imagePaths);

    const extractionResult = await templateFieldsExtraction(
      ocrText,
      templateId
    );

    const missingFields = identifyMissingFields(extractionResult.data);

    return {
      success: true,
      templateId,
      extractedData: extractionResult.data,
      missingFields,
      ocrText,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[OCR] Failed to process PDF: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
};
