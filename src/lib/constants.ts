export const APP_NAME = "Sprite Pixelart";

export const RATE_LIMITS = {
  CREATE_CHARACTER: { window: 60_000, max: 5 },
  GENERATION: { window: 300_000, max: 10 },
  API: { window: 60_000, max: 60 },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
} as const;

export const JOB = {
  MAX_ATTEMPTS: 3,
  RETRY_BACKOFF_BASE_MS: 30_000,
  STALE_JOB_TIMEOUT_MS: 600_000,
} as const;

export const STORAGE = {
  MAX_VERSIONS: 3,
  UPLOAD_PREFIX: "characters",
  SHEET_FILENAME: "sheet",
  METADATA_FILENAME: "metadata.json",
} as const;

export const AI = {
  DNA_EXTRACTION_MODEL: "gpt-5.4-mini",
  SHEET_GENERATION_MODEL: "gpt-image-1.5",
  VISION_MODEL: "gpt-4o-mini",
  SHEET_SIZE: "1024x1024",
  MAX_PROMPT_LENGTH: 2000,
  DNA_TEMPERATURE: 0.2,
} as const;
