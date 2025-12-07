import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { processPrimaryFormOcr } from "@/app/_utils/pdfOcr";
import type { PrimaryFormType } from "@/app/_types/case";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
  })
    .input(z.object({ templateId: z.string().optional() }))
    .middleware(async ({ req, input }) => {
      return { userId: "temp-user-id", templateId: input?.templateId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      console.log("file key", file.key);
      console.log("file name", file.name);

      if (!metadata.templateId) {
        return {
          uploadedBy: metadata.userId,
          ocrProcessed: false,
        };
      }

      console.log(
        `[OCR] Starting OCR processing for ${file.name} with template ${metadata.templateId}...`
      );

      const ocrResult = await processPrimaryFormOcr(
        file.url,
        metadata.templateId as PrimaryFormType
      );

      if (ocrResult.success) {
        console.log(`[OCR] Successfully processed ${file.name}`);
        console.log(
          `[OCR] Missing fields count: ${ocrResult.missingFields.length}`
        );
        return {
          uploadedBy: metadata.userId,
          ocrProcessed: true,
          templateId: ocrResult.templateId,
          extractedData: JSON.parse(JSON.stringify(ocrResult.extractedData)),
          missingFields: ocrResult.missingFields,
          ocrStatus: "completed" as const,
        };
      } else {
        console.error(
          `[OCR] Failed to process ${file.name}: ${ocrResult.error}`
        );
        return {
          uploadedBy: metadata.userId,
          ocrProcessed: false,
          ocrStatus: "failed" as const,
          ocrError: ocrResult.error,
        };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
