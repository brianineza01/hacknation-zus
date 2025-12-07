"use client"

import { useState } from "react"
import { useUploadThing } from "@/app/_utils/uploadthing"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PrimaryFormType, UploadedDocument } from "@/app/_types/case"

type DocumentUploadStepProps = {
  title: string
  documentType: PrimaryFormType
  uploadedDocument: UploadedDocument | null
  onUploadComplete: (document: UploadedDocument | null) => void
  optional?: boolean
}

export function DocumentUploadStep({
  title,
  documentType,
  uploadedDocument,
  onUploadComplete,
  optional = false,
}: DocumentUploadStepProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { startUpload } = useUploadThing("pdfUploader", {
    onClientUploadComplete: (res) => {
      setIsUploading(false)
      if (res && res.length > 0) {
        const uploadedFile = res[0]
        onUploadComplete({
          type: documentType,
          name: uploadedFile.name,
          url: uploadedFile.url,
          key: uploadedFile.key,
          category: "primary",
        })
        setSelectedFile(null)
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false)
      console.error("Upload error:", error)
      alert(`Upload failed: ${error.message}`)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    await startUpload([selectedFile])
  }

  const handleRemoveSelected = () => {
    setSelectedFile(null)
  }

  const handleRemoveUploaded = () => {
    onUploadComplete(null)
  }

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
                  While witness statements can strengthen your case, you can skip this step if you don't have one available. You can click "Skip (Optional)" at the bottom to continue.
                </p>
              </div>
            </div>
          </div>
        )}

        {uploadedDocument ? (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{uploadedDocument.name}</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded successfully
                </p>
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
  )
}

