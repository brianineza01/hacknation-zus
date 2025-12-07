"use server";

import { after } from "next/server";
import { db } from "@/app/_db";
import { cases, documents } from "@/app/_db/schema";
import type { CaseFormData } from "@/app/_types/case";
import { desc } from "drizzle-orm";
import { runDocumentPipeline } from "@/app/_utils/documentPipeline";

export async function createCaseWithDocuments(data: CaseFormData) {
  try {
    const result = await db.transaction(async (tx) => {
      const [newCase] = await tx
        .insert(cases)
        .values({
          name: data.name,
          description: data.description ?? null,
        })
        .returning();

      const documentsToInsert = data.documents.map((doc) => ({
        name: doc.name,
        type: doc.type,
        status: "pending" as const,
        fileUrl: doc.url,
        fileKey: doc.key,
        caseId: newCase.id,
      }));

      const insertedDocuments = await tx
        .insert(documents)
        .values(documentsToInsert)
        .returning();

      return {
        case: newCase,
        documents: insertedDocuments,
      };
    });

    after(async () => {
      console.log(`[After] Triggering pipeline for case ${result.case.id}`);
      try {
        const pipelineResult = await runDocumentPipeline(result.case.id);
        console.log(`[After] Pipeline result:`, pipelineResult);
      } catch (error) {
        console.error(
          `[After] Pipeline error for case ${result.case.id}:`,
          error
        );
      }
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating case with documents:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create case",
    };
  }
}

export async function getAllCasesWithDocuments() {
  try {
    const allCases = await db.query.cases.findMany({
      with: {
        documents: true,
      },
      orderBy: [desc(cases.createdAt)],
    });

    return { success: true, data: allCases };
  } catch (error) {
    console.error("Error fetching cases:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch cases",
    };
  }
}

export async function getCaseAnalysis(caseId: string) {
  try {
    const analysis = await db.query.caseAnalysis.findFirst({
      where: (caseAnalysis, { eq }) => eq(caseAnalysis.caseId, caseId),
    });

    if (!analysis) {
      return { success: true, data: null };
    }

    return { success: true, data: analysis };
  } catch (error) {
    console.error("Error fetching case analysis:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch analysis",
    };
  }
}
