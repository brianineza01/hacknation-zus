import type { PrimaryFormType } from "@/app/_types/case"

export const WIZARD_STEPS = [
  { 
    id: "case-info", 
    title: "Case Information", 
    documentType: null,
    stepType: "info" as const
  },
  { 
    id: "zawiadomienie_o_wypadku", 
    title: "Zawiadomienie o wypadku", 
    documentType: "zawiadomienie_o_wypadku" as PrimaryFormType,
    stepType: "primary" as const,
    description: "Accident notification form"
  },
  { 
    id: "zapis_wyjasnien_poszkodowanego", 
    title: "Zapis wyjaśnień poszkodowanego", 
    documentType: "zapis_wyjasnien_poszkodowanego" as PrimaryFormType,
    stepType: "primary" as const,
    description: "Record of victim's explanations"
  },
  { 
    id: "zapis_informacji_od_swiadka", 
    title: "Zapis informacji od świadka", 
    documentType: "zapis_informacji_od_swiadka" as PrimaryFormType,
    stepType: "primary" as const,
    description: "Witness statement record",
    optional: true
  },
  { 
    id: "supporting-documents", 
    title: "Supporting Documents", 
    documentType: null,
    stepType: "supporting" as const,
    description: "Upload additional supporting documents"
  },
] as const

