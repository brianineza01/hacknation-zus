"use client"

import { useState } from "react"
import { useUploadThing } from "@/app/_utils/uploadthing"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { SupportingDocumentType, UploadedDocument } from "@/app/_types/case"

type SupportingDocumentsStepProps = {
  uploadedDocuments: UploadedDocument[]
  onUploadComplete: (document: UploadedDocument) => void
  onRemoveDocument: (key: string) => void
}

const SUPPORTING_DOCUMENT_OPTIONS: { value: SupportingDocumentType; label: string; description: string }[] = [
  { 
    value: "proof_of_business", 
    label: "Proof of Business Activity", 
    description: "Contracts, invoices, service orders confirming business activity" 
  },
  { 
    value: "authorization", 
    label: "Authorization", 
    description: "Copy of license or concession (if required for business)" 
  },
  { 
    value: "medical_records", 
    label: "Medical Records", 
    description: "Hospital information card or first aid documentation" 
  },
  { 
    value: "traffic_police_note", 
    label: "Traffic Police Note", 
    description: "Official note for traffic accidents" 
  },
  { 
    value: "prosecutor_decision", 
    label: "Prosecutor's Decision", 
    description: "Decision on proceedings (initiation/suspension/dismissal)" 
  },
  { 
    value: "power_of_attorney", 
    label: "Power of Attorney", 
    description: "Legal authorization (if applicable)" 
  },
  { 
    value: "death_certificate", 
    label: "Death Certificate", 
    description: "Statistical death card or medical certificate (for fatal accidents)" 
  },
  { 
    value: "birth_marriage_certificate", 
    label: "Birth/Marriage Certificate", 
    description: "Condensed certificates (for fatal accidents)" 
  },
]

export function SupportingDocumentsStep({
  uploadedDocuments,
  onUploadComplete,
  onRemoveDocument,
}: SupportingDocumentsStepProps) {
  const [selectedDocumentType, setSelectedDocumentType] = useState<SupportingDocumentType>("proof_of_business")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { startUpload } = useUploadThing("pdfUploader", {
    onClientUploadComplete: (res) => {
      setIsUploading(false)
      if (res && res.length > 0) {
        const uploadedFile = res[0]
        onUploadComplete({
          type: selectedDocumentType,
          name: uploadedFile.name,
          url: uploadedFile.url,
          key: uploadedFile.key,
          category: "supporting",
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

  const selectedOption = SUPPORTING_DOCUMENT_OPTIONS.find(
    opt => opt.value === selectedDocumentType
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supporting Documents (Optional)</CardTitle>
        <CardDescription>
          Upload supporting documents as evidence. You can upload multiple documents or skip this step entirely by clicking "Create Case" below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadedDocuments.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Documents ({uploadedDocuments.length})</Label>
            <div className="space-y-2">
              {uploadedDocuments.map((doc) => {
                const docOption = SUPPORTING_DOCUMENT_OPTIONS.find(
                  opt => opt.value === doc.type
                )
                return (
                  <div
                    key={doc.key}
                    className="rounded-lg border p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {docOption?.label ?? doc.type}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveDocument(doc.key)}
                    >
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <select
              id="document-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value as SupportingDocumentType)}
              disabled={isUploading}
            >
              {SUPPORTING_DOCUMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedOption && (
              <p className="text-sm text-muted-foreground">
                {selectedOption.description}
              </p>
            )}
          </div>

          {selectedFile ? (
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
                  id="file-input-supporting"
                />
                <label
                  htmlFor="file-input-supporting"
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
        </div>
      </CardContent>
    </Card>
  )
}

