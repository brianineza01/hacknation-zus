import { db } from "../_db";
import { caseAnalysis, documents } from "../_db/schema";
import { eq } from "drizzle-orm";
import { processPrimaryFormOcr } from "./pdfOcr";
import { seedDocumentToPinecone, searchSimilarCases } from "./pinecone";
import { analyzeCaseWithAgent } from "./aiAgent";
import type { DocumentPipelineResult, PrimaryFormType } from "../_types/case";
import type { DocumentMetadata } from "./pinecone";

type CaseDocument = {
  id: string;
  name: string;
  fileUrl: string;
  type: string | null;
  caseId: string;
};

const PRIMARY_FORM_TYPES: PrimaryFormType[] = [
  "zawiadomienie_o_wypadku",
  "zapis_wyjasnien_poszkodowanego",
  "zapis_informacji_od_swiadka",
];

const isPrimaryFormType = (type: string | null): type is PrimaryFormType => {
  return type !== null && PRIMARY_FORM_TYPES.includes(type as PrimaryFormType);
};

export async function runDocumentPipeline(
  caseId: string
): Promise<DocumentPipelineResult> {
  console.log(`[Pipeline] Starting pipeline for case ${caseId}`);

  try {
    const caseData = await db.query.cases.findFirst({
      where: (cases, { eq }) => eq(cases.id, caseId),
      with: {
        documents: true,
      },
    });

    if (!caseData) {
      throw new Error(`Case ${caseId} not found`);
    }

    const primaryForms = caseData.documents.filter((doc) =>
      isPrimaryFormType(doc.type)
    );

    if (primaryForms.length === 0) {
      console.log(`[Pipeline] No primary forms found for case ${caseId}`);
      return {
        status: "completed",
        processedDocuments: 0,
        totalDocuments: caseData.documents.length,
      };
    }

    console.log(
      `[Pipeline] Found ${primaryForms.length} primary forms to process`
    );

    let processedCount = 0;
    const processedDocuments: Array<{
      documentId: string;
      templateId: PrimaryFormType;
      ocrText: string;
      extractedData: Record<string, unknown>;
    }> = [];

    for (const doc of primaryForms) {
      try {
        await db
          .update(documents)
          .set({ status: "processing" })
          .where(eq(documents.id, doc.id));

        console.log(`[Pipeline] Processing document ${doc.name} (${doc.type})`);

        const templateId = doc.type as PrimaryFormType;
        const ocrResult = await processPrimaryFormOcr(doc.fileUrl, templateId);

        if (!ocrResult.success) {
          console.error(
            `[Pipeline] OCR failed for ${doc.name}: ${ocrResult.error}`
          );
          await db
            .update(documents)
            .set({ status: "failed" })
            .where(eq(documents.id, doc.id));
          continue;
        }

        await db
          .update(documents)
          .set({
            status: "completed",
            extractedText: ocrResult.ocrText,
          })
          .where(eq(documents.id, doc.id));

        const metadata: DocumentMetadata = {
          caseId,
          templateId,
          documentId: doc.id,
          extractedData: JSON.stringify(ocrResult.extractedData),
        };

        await seedDocumentToPinecone(ocrResult.ocrText, metadata);

        processedDocuments.push({
          documentId: doc.id,
          templateId,
          ocrText: ocrResult.ocrText,
          extractedData: ocrResult.extractedData,
        });

        processedCount++;
        console.log(`[Pipeline] Successfully processed ${doc.name}`);
      } catch (error) {
        console.error(`[Pipeline] Error processing ${doc.name}:`, error);
        await db
          .update(documents)
          .set({ status: "failed" })
          .where(eq(documents.id, doc.id));
      }
    }

    if (processedDocuments.length === 0) {
      console.log(
        `[Pipeline] No documents successfully processed for case ${caseId}`
      );
      return {
        status: "failed",
        processedDocuments: 0,
        totalDocuments: primaryForms.length,
        error: "Failed to process any documents",
      };
    }

    console.log(`[Pipeline] Starting AI agent analysis for case ${caseId}`);

    const combinedText = processedDocuments
      .map((doc) => doc.ocrText)
      .join("\n\n");
    const combinedExtractedData = processedDocuments.reduce(
      (acc, doc) => ({
        ...acc,
        [doc.templateId]: doc.extractedData,
      }),
      {} as Record<string, Record<string, unknown>>
    );

    const similarMatches = await searchSimilarCases(combinedText, {
      topK: 10,
      minScore: 0.7,
      excludeCaseId: caseId,
    });

    console.log(
      `[Pipeline] Found ${similarMatches.length} similar cases for case ${caseId}`
    );

    if (similarMatches.length === 0) {
      console.log(
        `[Pipeline] No similar cases found, skipping AI analysis for case ${caseId}`
      );
      return {
        status: "completed",
        processedDocuments: processedCount,
        totalDocuments: primaryForms.length,
      };
    }

    const analysisResult = await analyzeCaseWithAgent(
      {
        caseId,
        caseName: caseData.name,
        description: caseData.description ?? undefined,
        extractedData: combinedExtractedData,
        ocrText: combinedText,
      },
      similarMatches
    );

    await db.insert(caseAnalysis).values({
      caseId,
      similarCases: JSON.stringify(analysisResult.similarCases),
      analysis: analysisResult.analysis,
      duplicateFlags: analysisResult.duplicateFlags
        ? JSON.stringify(analysisResult.duplicateFlags)
        : null,
      suggestedOutcomes: analysisResult.suggestedOutcomes
        ? JSON.stringify(analysisResult.suggestedOutcomes)
        : null,
    });

    console.log(
      `[Pipeline] Successfully completed pipeline for case ${caseId}`
    );
    console.log(
      `[Pipeline] Analysis summary: ${analysisResult.similarCases.length} similar cases found`
    );
    if (analysisResult.duplicateFlags?.isDuplicate) {
      console.log(
        `[Pipeline] ⚠️  DUPLICATE DETECTED: Confidence ${(analysisResult.duplicateFlags.confidence * 100).toFixed(2)}%`
      );
    }

    return {
      status: "completed",
      processedDocuments: processedCount,
      totalDocuments: primaryForms.length,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(`[Pipeline] Pipeline failed for case ${caseId}:`, error);
    return {
      status: "failed",
      processedDocuments: 0,
      totalDocuments: 0,
      error: errorMessage,
    };
  }
}

