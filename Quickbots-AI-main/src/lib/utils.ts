import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function normalizePgDate(pgDate: string) {
  // Example: "2025-11-25 09:03:37.48834+00"

  // Replace space with T
  let iso = pgDate.replace(" ", "T");

  // Convert timezone +00 → +00:00 (required for JS)
  iso = iso.replace(/(\+\d{2})$/, "$1:00");

  return new Date(iso);
}

export function formatDate(pgDate: string) {
  const date = normalizePgDate(pgDate);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Default bot configuration templates
 * These are applied when a new bot is created
 */

export const DEFAULT_BOT_CONFIGS = {
  persona:
    "You are a professional, concise, and knowledgeable business assistant representing Enterprise Management Solutions. You have expertise in business operations, management practices, and helping organizations optimize their workflows. You communicate clearly and efficiently, always maintaining a professional demeanor while being approachable and helpful. You understand the complexities of modern business environments and provide practical, actionable guidance.",
  botthesis:
    "As the AI assistant for SmartManage, my core mission is to empower businesses by providing intelligent guidance on management practices, operational efficiency, and strategic decision-making. I serve as a knowledgeable resource that helps users understand how modern management tools can transform their organizational effectiveness.",
  greetings:
    "Welcome! I'm here to assist with any business or product questions. How can I help you today?",
  fallback_message:
    "I want to make sure I understand you correctly. Could you rephrase your question? I'm here to help with business management and operational inquiries.",
  version: 1,
};

export const DEFAULT_BOT_SETTINGS = {
  business_name: "Enterprise Management Solutions",
  business_type: "SaaS",
  business_description:
    "Professional business management and operational efficiency platform",
  product_name: "SmartManage AI Assistant",
  product_description:
    "Intelligent assistant for business operations, management guidance, and organizational efficiency",
  support_email: null,
  contacts: null,
  supported_languages: ["en"],
};

export const DEFAULT_BOT_RUNTIME_SETTINGS = {
  rate_limit_per_min: 60,
  token_quota: 50000,
  api_calls_this_month: 0,
};

export const DEFAULT_BOT_UI_SETTINGS = {
  theme: "modern",
  chatbot_name: "Smart Assistant",
  welcome_message:
    "Welcome! I'm here to assist with any business or product questions. How can I help you today?",
  quick_questions: [
    "What services do you provide?",
    "How can I integrate your product?",
    "What pricing plans are available?",
    "How does SmartManage improve efficiency?",
    "What support options are available?",
  ],
  support_info: null,
  position: "bottom-right",
  auto_open_delay_ms: 0,
  auto_greet_on_open: false,
  ask_email_before_chat: false,
  persist_chat: true,
  show_timestamps: true,
};

export function getDefaultBotData() {
  return {
    bot_configs: DEFAULT_BOT_CONFIGS,
    bot_settings: DEFAULT_BOT_SETTINGS,
    bot_runtime_settings: DEFAULT_BOT_RUNTIME_SETTINGS,
    bot_ui_settings: DEFAULT_BOT_UI_SETTINGS,
  };
}
