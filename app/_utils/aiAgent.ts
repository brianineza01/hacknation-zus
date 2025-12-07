import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";
import type { SimilarCaseMatch } from "./pinecone";
import type { CaseAnalysisResult } from "../_types/case";

const DuplicateFlagsSchema = z.object({
  isDuplicate: z.boolean(),
  confidence: z.number().min(0).max(1),
  matchedCaseId: z.string().optional(),
  reason: z.string().optional(),
});

const SuggestedOutcomeSchema = z.object({
  outcome: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

const SimilarCaseSchema = z.object({
  caseId: z.string(),
  caseName: z.string(),
  score: z.number(),
  matchedDocuments: z.array(z.string()),
  summary: z.string(),
});

const CaseAnalysisSchema = z.object({
  similarCases: z.array(SimilarCaseSchema),
  analysis: z.string(),
  duplicateFlags: DuplicateFlagsSchema.nullable(),
  suggestedOutcomes: z.array(SuggestedOutcomeSchema),
});

type CaseContext = {
  caseId: string;
  caseName: string;
  description?: string;
  extractedData: Record<string, unknown>;
  ocrText: string;
};

const DUPLICATE_THRESHOLD = 0.9;

export async function analyzeCaseWithAgent(
  caseContext: CaseContext,
  similarMatches: SimilarCaseMatch[]
): Promise<CaseAnalysisResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const matchesContext = similarMatches
    .map(
      (match, idx) =>
        `Match ${idx + 1}:
- Case ID: ${match.caseId}
- Template: ${match.templateId}
- Similarity Score: ${(match.score * 100).toFixed(2)}%
- Extracted Data: ${match.extractedData ?? "N/A"}
- Text Preview: ${match.text.substring(0, 300)}...
`
    )
    .join("\n");

  const systemPrompt = `You are an expert case analysis AI specialized in Polish accident claims (ZUS).
Your task is to analyze a new case against similar existing cases found in the database.

Analyze the following:
1. Similarity patterns across cases
2. Potential duplicate detection (flag if any match > 90% similar)
3. Outcome predictions based on historical patterns

Provide comprehensive analysis with actionable insights.`;

  const userPrompt = `New Case Context:
- Case ID: ${caseContext.caseId}
- Case Name: ${caseContext.caseName}
- Description: ${caseContext.description ?? "N/A"}
- Extracted Data: ${JSON.stringify(caseContext.extractedData, null, 2)}
- OCR Text Preview: ${caseContext.ocrText.substring(0, 500)}...

Similar Cases Found (${similarMatches.length}):
${matchesContext}

Please analyze this case and provide:
1. Detailed similarity analysis for each matched case
2. Duplicate detection (flag if confidence > 90%)
3. At least 2-3 suggested outcomes based on patterns`;

  const result = await generateObject({
    model: openrouter.chat("google/gemini-3-pro-preview"),
    schema: CaseAnalysisSchema,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    maxOutputTokens: 8192,
    temperature: 0.7,
  });

  const analysis = result.object;

  if (
    analysis.duplicateFlags === null &&
    similarMatches.length > 0 &&
    similarMatches[0].score >= DUPLICATE_THRESHOLD
  ) {
    analysis.duplicateFlags = {
      isDuplicate: true,
      confidence: similarMatches[0].score,
      matchedCaseId: similarMatches[0].caseId,
      reason: `High similarity score (${(similarMatches[0].score * 100).toFixed(
        2
      )}%) detected with existing case`,
    };
  }

  return analysis;
}
