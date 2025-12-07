export type PrimaryFormType =
  | "zawiadomienie_o_wypadku"
  | "zapis_wyjasnien_poszkodowanego"
  | "zapis_informacji_od_swiadka";

export type SupportingDocumentType =
  | "proof_of_business"
  | "authorization"
  | "medical_records"
  | "traffic_police_note"
  | "prosecutor_decision"
  | "power_of_attorney"
  | "death_certificate"
  | "birth_marriage_certificate";

export type DocumentType = PrimaryFormType | SupportingDocumentType;

export type OcrStatus = "pending" | "processing" | "completed" | "failed";

export type UploadedDocument = {
  type: DocumentType;
  name: string;
  url: string;
  key: string;
  category: "primary" | "supporting";
  extractedData?: Record<string, unknown>;
  missingFields?: string[];
  ocrStatus?: OcrStatus;
  ocrError?: string;
};

export type CaseFormData = {
  name: string;
  description: string;
  documents: UploadedDocument[];
};

export type Case = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Document = {
  id: string;
  name: string;
  type: DocumentType | "other" | null;
  status: "pending" | "processing" | "completed" | "failed" | null;
  fileUrl: string;
  fileKey: string;
  extractedText: string | null;
  caseId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseWithDocuments = Case & {
  documents: Document[];
};

export type SimilarCase = {
  caseId: string;
  caseName: string;
  score: number;
  matchedDocuments: string[];
  summary: string;
};

export type CaseAnalysisResult = {
  similarCases: SimilarCase[];
  analysis: string;
  duplicateFlags: {
    isDuplicate: boolean;
    confidence: number;
    matchedCaseId?: string;
    reason?: string;
  } | null;
  suggestedOutcomes: {
    outcome: string;
    confidence: number;
    reasoning: string;
  }[];
};

export type CaseAnalysis = {
  id: string;
  caseId: string;
  similarCases: string;
  analysis: string;
  duplicateFlags: string | null;
  suggestedOutcomes: string | null;
  createdAt: Date;
};

export type PipelineStatus = "pending" | "processing" | "completed" | "failed";

export type DocumentPipelineResult = {
  status: PipelineStatus;
  processedDocuments: number;
  totalDocuments: number;
  error?: string;
};
