"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type CaseInfoStepProps = {
  name: string
  description: string
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
}

export function CaseInfoStep({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: CaseInfoStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Information</CardTitle>
        <CardDescription>
          Enter the basic information for this case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="case-name">Case Name</Label>
          <Input
            id="case-name"
            placeholder="e.g., Wypadek 101"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="case-description">Description (Optional)</Label>
          <Input
            id="case-description"
            placeholder="Add any additional details..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

