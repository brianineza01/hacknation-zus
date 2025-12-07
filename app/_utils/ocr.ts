import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { promises as fs } from "node:fs";
import { extname } from "node:path";

/**
 * Maps file extensions to MIME types for images
 */
function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "image/png";
}

/**
 * Converts an image file to base64 data URL
 */
async function imageToBase64DataUrl(imagePath: string): Promise<string> {
  const imageBuffer = await fs.readFile(imagePath);
  const base64 = imageBuffer.toString("base64");
  const mimeType = getMimeType(imagePath);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Extracts text from an array of images using google/gemini-3-pro-preview via OpenRouter
 *
 * @param imagePaths - Array of file paths to images
 * @returns Extracted text content from all images
 * @throws Error if API key is missing or if extraction fails
 */
export async function extractTextFromImages(
  imagePaths: string[]
): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  if (imagePaths.length === 0) {
    throw new Error("At least one image path is required");
  }

  // Convert all images to base64 data URLs
  const imageDataUrls = await Promise.all(
    imagePaths.map((path) => imageToBase64DataUrl(path))
  );

  // Initialize OpenRouter provider
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  // Build the content array with text prompt and all images
  const content: Array<
    { type: "text"; text: string } | { type: "image"; image: string }
  > = [
    {
      type: "text",
      text: "Extract all text content from these images and preserve the original formatting. Return only the extracted text without any additional commentary. Return the data in markdown formatting and preserve all formatting as much as possible.You task is OCR. If the data looks redacted or it's personal identified data, add [redacted].",
    },
    ...imageDataUrls.map((dataUrl) => ({
      type: "image" as const,
      image: dataUrl,
    })),
  ];

  const result = await generateText({
    model: openrouter.chat("google/gemini-3-pro-preview"),
    messages: [
      {
        role: "user",
        content,
      },
    ],
    maxOutputTokens: 65536,
    temperature: 1,
  });

  return result.text;
}
