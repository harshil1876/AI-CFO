/**
 * Centralized constants and enums for the application
 * These match the database schema exactly
 */

export const TONE_STYLE = [
  "formal",
  "friendly",
  "professional",
  "casual",
  "humorous",
] as const;

export const WRITING_STYLE = [
  "concise",
  "elaborate",
  "technical",
  "narrative",
] as const;

export const RESPONSE_STYLE = [
  "direct",
  "indirect",
  "balanced",
  "inquisitive",
] as const;

export const EXPERTISE = [
  "finance",
  "health",
  "technology",
  "education",
  "custom",
] as const;

export const AVATAR_SHAPE = ["circle", "rounded", "square"] as const;

export const POSITION = ["bottom-right", "bottom-left"] as const;

export const TYPING_INDICATOR_STYLE = ["dots", "wave", "pulse"] as const;

export const MESSAGE_BUBBLE_SHAPE = ["rounded", "pill", "square"] as const;

export const OPEN_ANIMATION = ["scale", "slide", "fade"] as const;

export const MESSAGE_ANIMATION = ["fade", "bounce", "pop"] as const;

export const WIDGET_MODE = ["floating", "inline"] as const;

export const CONTRAST_LEVEL = ["low", "normal", "high"] as const;

export const SHADOW_DEPTH = ["none", "small", "medium", "large"] as const;

export const API_KEY_PERMISSIONS = ["prod", "dev"] as const;

// Type exports
export type ToneStyle = (typeof TONE_STYLE)[number];
export type WritingStyle = (typeof WRITING_STYLE)[number];
export type ResponseStyle = (typeof RESPONSE_STYLE)[number];
export type Expertise = (typeof EXPERTISE)[number];
export type AvatarShape = (typeof AVATAR_SHAPE)[number];
export type Position = (typeof POSITION)[number];
export type TypingIndicatorStyle = (typeof TYPING_INDICATOR_STYLE)[number];
export type MessageBubbleShape = (typeof MESSAGE_BUBBLE_SHAPE)[number];
export type OpenAnimation = (typeof OPEN_ANIMATION)[number];
export type MessageAnimation = (typeof MESSAGE_ANIMATION)[number];
export type WidgetMode = (typeof WIDGET_MODE)[number];
export type ContrastLevel = (typeof CONTRAST_LEVEL)[number];
export type ShadowDepth = (typeof SHADOW_DEPTH)[number];
export type ApiKeyPermission = (typeof API_KEY_PERMISSIONS)[number];

