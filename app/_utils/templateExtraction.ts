import "dotenv/config";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";
import { templates } from "./templates";

type Template = (typeof templates)[0];
type TemplateWithSections = Template & {
  sections: NonNullable<Template["sections"]>;
};
type TemplateWithFields = Template & {
  fields: NonNullable<Template["fields"]>;
};

const MAX_OCR_TEXT_LENGTH = 30000;

function hasSections(template: Template): template is TemplateWithSections {
  return (
    "sections" in template &&
    template.sections !== undefined &&
    template.sections !== null
  );
}

function hasFields(template: Template): template is TemplateWithFields {
  return (
    "fields" in template &&
    template.fields !== undefined &&
    template.fields !== null
  );
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return (
    text.substring(0, maxLength) + "\n\n[... text truncated due to length ...]"
  );
}

function buildMinimalTemplateStructure(template: Template): {
  id_pl: string;
  sections?: Array<{
    id_pl: string;
    fields: Array<{ id_pl: string }>;
  }>;
  fields?: Array<{ id_pl: string }>;
} {
  if (hasSections(template)) {
    return {
      id_pl: template.id_pl,
      sections: template.sections.map((section) => ({
        id_pl: section.id_pl,
        fields: section.fields.map((field) => ({
          id_pl: field.id_pl,
        })),
      })),
    };
  }

  if (hasFields(template)) {
    return {
      id_pl: template.id_pl,
      fields: template.fields.map((field) => ({
        id_pl: field.id_pl,
      })),
    };
  }

  return {
    id_pl: (template as { id_pl: string }).id_pl,
  };
}

/**
 * Extracts structured data from OCR text based on a template schema using Gemini 2.0 Flash
 *
 * @param text - The OCR extracted text to extract data from
 * @param templateId - The template ID (can be id_pl or id_en)
 * @returns Extracted data in JSON format with Polish (id_pl) field IDs only
 * @throws Error if API key is missing, template is not found, or extraction fails
 */
export async function templateFieldsExtraction(
  text: string,
  templateId: string
) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const template = templates.find(
    (t) => t.id_pl === templateId || t.id_en === templateId
  );

  if (!template) {
    throw new Error(
      `Template with id "${templateId}" not found. Available templates: ${templates
        .map((t) => `${t.id_pl} / ${t.id_en}`)
        .join(", ")}`
    );
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const schema = buildZodSchema(template);

  const truncatedText = truncateText(text, MAX_OCR_TEXT_LENGTH);
  const wasTruncated = text.length > MAX_OCR_TEXT_LENGTH;
  const minimalTemplate = buildMinimalTemplateStructure(template);

  const systemPrompt =
    "You are an expert in data labeling and extraction.\n" +
    "You are to be given a template structure and ocr text. Your task is to extract the fields from the template using their field id (id_pl) and then extract the corresponding data in the ocr text and then combine it into a single json data. The JSON to return should have the following schema:\n\n" +
    '{\n  "data": {\n    "field_id_pl": "data_from_ocr"\n  }\n}\n\n' +
    "remember to keep section grouping and use the sectionId (id_pl) in the json as well. So it would be\n\n" +
    '{\n  "data": {\n    "sectionId_pl from template": {\n      "fieldId_pl from template": "Value from OCR"\n    }\n  }\n}\n\n' +
    "IMPORTANT: Use ONLY Polish (id_pl) field IDs and section IDs in the output JSON. Do not include English (id_en) fields.\n\n" +
    "Data Parsing:\n\n" +
    "1. Return all dates in JavaScript-friendly ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ).\n" +
    "   If the data represents a time or date range, return an array [start, end].\n" +
    "   If it is not a range, return a single ISO date value, not an array.\n" +
    "   Never return ambiguous or non-standard formats.\n\n" +
    "2. Return all the fields, if the field doesn't have any data return null.";

  const userPrompt = `Extract the info field from the TEMPLATE STRUCTURE below and extract the data from OCR_TEXT and combine it into a json you will return${
    wasTruncated
      ? "\n\nNOTE: The OCR text was truncated due to length. Extract what you can from the available text."
      : ""
  }

<TEMPLATE_STRUCTURE>
${JSON.stringify(minimalTemplate, null, 2)}
</TEMPLATE_STRUCTURE>

<OCR_TEXT>
${truncatedText}
</OCR_TEXT>`;

  try {
    const result = await generateObject({
      model: openrouter.chat("google/gemini-3-pro-preview"),
      schema,
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
      temperature: 0.2,
    });

    return result.object;
  } catch (error) {
    if (error instanceof Error) {
      const errorDetails: Record<string, unknown> = {
        message: error.message,
        name: error.name,
      };
      if (error.cause) {
        errorDetails.cause = error.cause;
      }
      if ("statusCode" in error) {
        errorDetails.statusCode = (
          error as { statusCode?: unknown }
        ).statusCode;
      }
      if ("response" in error) {
        errorDetails.response = String(
          (error as { response?: unknown }).response
        );
      }
      throw new Error(
        `Template extraction failed: ${
          error.message
        }. Details: ${JSON.stringify(errorDetails)}`,
        { cause: error }
      );
    }
    throw error;
  }
}

const fieldValueSchema = z.union([
  z.string().nullable(),
  z.array(z.string()).nullable(),
]);

/**
 * Builds a dynamic Zod schema from a template structure
 * Handles both templates with sections and templates with direct fields
 * Only includes Polish (id_pl) fields to reduce schema size
 */
function buildZodSchema(template: Template) {
  if (hasSections(template)) {
    const sectionSchema: Record<
      string,
      z.ZodNullable<z.ZodObject<Record<string, typeof fieldValueSchema>>>
    > = {};

    for (const section of template.sections) {
      const fieldSchema: Record<string, typeof fieldValueSchema> = {};

      for (const field of section.fields) {
        fieldSchema[field.id_pl] = fieldValueSchema;
      }

      sectionSchema[section.id_pl] = z.object(fieldSchema).nullable();
    }

    return z.object({
      data: z.object(sectionSchema),
    });
  }

  if (hasFields(template)) {
    const fieldSchema: Record<string, typeof fieldValueSchema> = {};

    for (const field of template.fields) {
      fieldSchema[field.id_pl] = fieldValueSchema;
    }

    return z.object({
      data: z.object(fieldSchema),
    });
  }

  return z.object({
    data: z.object({}),
  });
}
