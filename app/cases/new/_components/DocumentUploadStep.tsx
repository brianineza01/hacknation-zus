"use client";

import { useState, useEffect } from "react";
import { useUploadThing } from "@/app/_utils/uploadthing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { PrimaryFormType, UploadedDocument } from "@/app/_types/case";

type DocumentUploadStepProps = {
  title: string;
  documentType: PrimaryFormType;
  uploadedDocument: UploadedDocument | null;
  onUploadComplete: (document: UploadedDocument | null) => void;
  onDataUpdate?: (data: Record<string, unknown>) => void;
  optional?: boolean;
};

type UploadStage =
  | "idle"
  | "uploading"
  | "converting"
  | "extracting"
  | "complete";

export function DocumentUploadStep({
  title,
  documentType,
  uploadedDocument,
  onUploadComplete,
  onDataUpdate,
  optional = false,
}: DocumentUploadStepProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [editedData, setEditedData] = useState<Record<string, unknown>>({});
  const [showExtractedData, setShowExtractedData] = useState(false);

  useEffect(() => {
    if (uploadedDocument?.extractedData) {
      setEditedData(uploadedDocument.extractedData);
    }
  }, [uploadedDocument]);

  useEffect(() => {
    if (uploadStage === "uploading") {
      setProgress(20);
    } else if (uploadStage === "converting") {
      setProgress(50);
    } else if (uploadStage === "extracting") {
      setProgress(80);
    } else if (uploadStage === "complete") {
      setProgress(100);
    }
  }, [uploadStage]);

  const { startUpload } = useUploadThing("pdfUploader", {
    onClientUploadComplete: (res) => {
      setUploadStage("complete");
      setIsUploading(false);
      if (res && res.length > 0) {
        const uploadedFile = res[0];
        const serverData = uploadedFile.serverData as {
          uploadedBy: string;
          ocrProcessed?: boolean;
          templateId?: string;
          extractedData?: Record<string, unknown>;
          missingFields?: string[];
          ocrStatus?: "completed" | "failed";
          ocrError?: string;
        };

        onUploadComplete({
          type: documentType,
          name: uploadedFile.name,
          url: uploadedFile.url,
          key: uploadedFile.key,
          category: "primary",
          extractedData: serverData?.extractedData,
          missingFields: serverData?.missingFields,
          ocrStatus: serverData?.ocrStatus,
          ocrError: serverData?.ocrError,
        });
        setSelectedFile(null);
        setShowExtractedData(true);
      }
    },
    onUploadError: (error: Error) => {
      setUploadStage("idle");
      setIsUploading(false);
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    },
    onUploadProgress: (progress) => {
      if (progress < 100) {
        setUploadStage("uploading");
      } else {
        setUploadStage("converting");
        setTimeout(() => setUploadStage("extracting"), 1000);
      }
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStage("uploading");
    setProgress(10);
    await startUpload([selectedFile], { templateId: documentType });
  };

  const handleRemoveSelected = () => {
    setSelectedFile(null);
  };

  const handleRemoveUploaded = () => {
    onUploadComplete(null);
    setShowExtractedData(false);
    setEditedData({});
  };

  const handleFieldUpdate = (path: string, value: string) => {
    const newData = { ...editedData };
    const pathParts = path.split(".");

    let current = newData;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]] as Record<string, unknown>;
    }

    current[pathParts[pathParts.length - 1]] = value;
    setEditedData(newData);
    onDataUpdate?.(newData);
  };

  const renderFieldValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const flattenData = (
    data: Record<string, unknown>,
    prefix = ""
  ): Array<{
    path: string;
    label: string;
    value: unknown;
    isMissing: boolean;
  }> => {
    const result: Array<{
      path: string;
      label: string;
      value: unknown;
      isMissing: boolean;
    }> = [];

    for (const [key, value] of Object.entries(data)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const isMissing =
        uploadedDocument?.missingFields?.includes(path) ?? false;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        result.push(...flattenData(value as Record<string, unknown>, path));
      } else {
        result.push({
          path,
          label: key.replace(/_/g, " "),
          value,
          isMissing: isMissing || value === null || value === undefined,
        });
      }
    }

    return result;
  };

  const getStageText = (stage: UploadStage): string => {
    switch (stage) {
      case "uploading":
        return "Uploading document...";
      case "converting":
        return "Converting PDF to images...";
      case "extracting":
        return "Extracting data from document...";
      case "complete":
        return "Processing complete!";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title}
          {optional && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (Optional)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Select a PDF document and click upload to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {optional && !uploadedDocument && (
          <div className="rounded-lg border border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/20">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
                  This document is optional
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  While witness statements can strengthen your case, you can
                  skip this step if you don't have one available. You can click
                  "Skip (Optional)" at the bottom to continue.
                </p>
              </div>
            </div>
          </div>
        )}

        {isUploading && uploadStage !== "idle" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{getStageText(uploadStage)}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}

        {uploadedDocument ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{uploadedDocument.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {uploadedDocument.ocrStatus === "completed" && (
                      <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        OCR Complete
                      </span>
                    )}
                    {uploadedDocument.ocrStatus === "failed" && (
                      <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        OCR Failed
                      </span>
                    )}
                    {uploadedDocument.missingFields &&
                      uploadedDocument.missingFields.length > 0 && (
                        <span className="text-sm text-amber-600 dark:text-amber-400">
                          {uploadedDocument.missingFields.length} field
                          {uploadedDocument.missingFields.length !== 1
                            ? "s"
                            : ""}{" "}
                          missing
                        </span>
                      )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveUploaded}
                >
                  Remove
                </Button>
              </div>
            </div>

            {uploadedDocument.ocrStatus === "completed" &&
              uploadedDocument.extractedData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Extracted Data</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExtractedData(!showExtractedData)}
                    >
                      {showExtractedData ? "Hide" : "Show"} Fields
                    </Button>
                  </div>

                  {showExtractedData && (
                    <div className="rounded-lg border p-4 max-h-96 overflow-y-auto space-y-3">
                      {flattenData(uploadedDocument.extractedData).map(
                        (field) => (
                          <div key={field.path} className="space-y-1">
                            <Label
                              htmlFor={field.path}
                              className={
                                field.isMissing
                                  ? "text-amber-600 dark:text-amber-400"
                                  : ""
                              }
                            >
                              {field.label}
                              {field.isMissing && (
                                <span className="ml-1 text-xs font-normal">
                                  (Missing)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={field.path}
                              value={renderFieldValue(field.value)}
                              onChange={(e) =>
                                handleFieldUpdate(field.path, e.target.value)
                              }
                              placeholder={
                                field.isMissing ? "Enter value..." : ""
                              }
                              className={
                                field.isMissing ? "border-amber-500" : ""
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

            {uploadedDocument.ocrError && (
              <div className="rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-950/20">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {uploadedDocument.ocrError}
                </p>
              </div>
            )}
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveSelected}
                  disabled={isUploading}
                >
                  Remove
                </Button>
              </div>
            </div>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id={`file-input-${documentType}`}
              />
              <label
                htmlFor={`file-input-${documentType}`}
                className="cursor-pointer"
              >
                <div className="space-y-2">
                  <p className="text-lg font-medium">Select PDF File</p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag and drop
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
