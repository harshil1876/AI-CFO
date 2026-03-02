/**
 * Configuration for each field that can be AI-generated
 * Defines what context inputs are needed for each field
 */

import type { FieldType } from "@/types/ai.types";

export interface FieldConfig {
  field: FieldType;
  label: string;
  description: string;
  contextInputs: ContextInput[];
}

export interface ContextInput {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "select";
  options?: string[];
  required: boolean;
}

export const FIELD_CONFIGS: Record<FieldType, FieldConfig> = {
  persona: {
    field: "persona",
    label: "AI Persona",
    description: "Generate a comprehensive AI personality description",
    contextInputs: [
      {
        name: "brand_voice",
        label: "Brand Voice",
        placeholder: "e.g., professional, friendly, casual",
        type: "select",
        options: ["formal", "professional", "friendly", "casual", "humorous"],
        required: false,
      },
      {
        name: "userInput",
        label: "Additional Context (Optional)",
        placeholder: "Any specific traits or expertise areas...",
        type: "textarea",
        required: false,
      },
    ],
  },
  
  botthesis: {
    field: "botthesis",
    label: "Bot Thesis",
    description: "Generate the core mission and purpose statement",
    contextInputs: [
      {
        name: "problem",
        label: "Problem Being Solved",
        placeholder: "What problem does your product solve?",
        type: "textarea",
        required: false,
      },
      {
        name: "target_audience",
        label: "Target Audience",
        placeholder: "Who are your users?",
        type: "text",
        required: false,
      },
      {
        name: "userInput",
        label: "Additional Context (Optional)",
        placeholder: "Any specific mission details...",
        type: "textarea",
        required: false,
      },
    ],
  },
  
  greetings: {
    field: "greetings",
    label: "Greeting Message",
    description: "Generate a warm, welcoming greeting",
    contextInputs: [
      {
        name: "brand_voice",
        label: "Brand Voice",
        placeholder: "e.g., professional, friendly",
        type: "select",
        options: ["formal", "professional", "friendly", "casual", "humorous"],
        required: false,
      },
      {
        name: "userInput",
        label: "Additional Context (Optional)",
        placeholder: "Any specific tone or message...",
        type: "textarea",
        required: false,
      },
    ],
  },
  
  fallback_message: {
    field: "fallback_message",
    label: "Fallback Message",
    description: "Generate a helpful fallback response",
    contextInputs: [
      {
        name: "brand_voice",
        label: "Brand Voice",
        placeholder: "e.g., professional, friendly",
        type: "select",
        options: ["formal", "professional", "friendly", "casual", "humorous"],
        required: false,
      },
      {
        name: "userInput",
        label: "Additional Context (Optional)",
        placeholder: "Any specific guidance...",
        type: "textarea",
        required: false,
      },
    ],
  },
  
  business_name: {
    field: "business_name",
    label: "Business Name",
    description: "Generate a professional business name",
    contextInputs: [
      {
        name: "userInput",
        label: "Business Description",
        placeholder: "Describe what your business does...",
        type: "textarea",
        required: true,
      },
    ],
  },
  
  business_type: {
    field: "business_type",
    label: "Business Type",
    description: "Determine the business category",
    contextInputs: [
      {
        name: "userInput",
        label: "Business Description",
        placeholder: "Describe your business...",
        type: "textarea",
        required: true,
      },
    ],
  },
  
  business_description: {
    field: "business_description",
    label: "Business Description",
    description: "Generate a concise business description",
    contextInputs: [
      {
        name: "userInput",
        label: "Business Details",
        placeholder: "What does your business do? Key services?",
        type: "textarea",
        required: true,
      },
    ],
  },
  
  product_name: {
    field: "product_name",
    label: "Product Name",
    description: "Generate a product or service name",
    contextInputs: [
      {
        name: "userInput",
        label: "Product Description",
        placeholder: "Describe your product or service...",
        type: "textarea",
        required: true,
      },
    ],
  },
  
  product_description: {
    field: "product_description",
    label: "Product Description",
    description: "Generate a detailed product description",
    contextInputs: [
      {
        name: "target_audience",
        label: "Target Audience",
        placeholder: "Who is this for?",
        type: "text",
        required: false,
      },
      {
        name: "userInput",
        label: "Product Details",
        placeholder: "Key features, benefits, use cases...",
        type: "textarea",
        required: true,
      },
    ],
  },
  
  quick_questions: {
    field: "quick_questions",
    label: "Quick Questions",
    description: "Generate 5 relevant customer questions",
    contextInputs: [
      {
        name: "target_audience",
        label: "Target Audience",
        placeholder: "Who are your customers?",
        type: "text",
        required: false,
      },
      {
        name: "userInput",
        label: "Additional Context (Optional)",
        placeholder: "Any specific topics to cover...",
        type: "textarea",
        required: false,
      },
    ],
  },
  
  welcome_message: {
    field: "welcome_message",
    label: "Welcome Message",
    description: "Generate a welcoming chat message",
    contextInputs: [
      {
        name: "brand_voice",
        label: "Brand Voice",
        placeholder: "e.g., professional, friendly",
        type: "select",
        options: ["formal", "professional", "friendly", "casual", "humorous"],
        required: false,
      },
      {
        name: "userInput",
        label: "Additional Context (Optional)",
        placeholder: "Any specific tone...",
        type: "textarea",
        required: false,
      },
    ],
  },
};

export function getFieldConfig(field: FieldType): FieldConfig {
  const config = FIELD_CONFIGS[field];
  if (!config) {
    throw new Error(`No configuration found for field: ${field}`);
  }
  return config;
}

