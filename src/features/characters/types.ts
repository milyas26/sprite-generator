export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type ArtStyle = "16bit" | "32bit" | "gbc" | "nes";

export type DetailLevel = "low" | "medium" | "high";

export type POV = "top-down" | "side-scroller" | "isometric";

export type CharacterStatus = "DRAFT" | "EXTRACTING_DNA" | "DNA_READY" | "GENERATING_SHEET" | "GENERATING" | "READY" | "FAILED";

export type JobType = "DNA_EXTRACTION" | "SHEET_GENERATION" | "COMPOSITE" | "SPRITE_PACK";

export type AnimationType = "idle" | "walk" | "run" | "attack" | "hit" | "death";

export interface SpritePackConfig {
  animation: AnimationType;
  frameCount: number;
}

export interface GenerateSpritePackInput {
  characterId: string;
  animations: SpritePackConfig[];
}

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type AssetType = "SHEET" | "LAYER" | "SPRITE" | "ANIMATION_FRAME";

export interface CharacterDNA {
  prompt: string;
  name: string;
  race: string;
  gender: string;
  class: string;
  pov: POV;
  physical: {
    hair: { style: string; color: string };
    eyes: { color: string; shape: string };
    skin: { tone: string };
    build: string;
    height: string;
  };
  equipment: {
    head: string | null;
    body: string;
    legs: string;
    mainHand: string | null;
    offHand: string | null;
    accessories: string[];
  };
  style: {
    artStyle: ArtStyle;
    palette: string[];
    detailLevel: DetailLevel;
  };
  directions: {
    up: string;
    down: string;
    left: string;
    right: string;
  };
  tags: string[];
}

export interface CharacterStyleInput {
  artStyle: ArtStyle;
  detailLevel: DetailLevel;
}

export interface CharacterDetailsInput {
  name?: string;
  gender?: string;
  race?: string;
  class?: string;
  hairStyle?: string;
  hairColor?: string;
  skinTone?: string;
  eyeColor?: string;
  build?: string;
  height?: string;
  pov?: POV;
}

export interface CreateCharacterInput {
  prompt: string;
  style: CharacterStyleInput;
  details?: CharacterDetailsInput;
}

export interface Character {
  id: string;
  name: string;
  dna: CharacterDNA | null;
  status: CharacterStatus;
  sheetUrl: string | null;
  sheetKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterAsset {
  id: string;
  characterId: string;
  type: AssetType;
  direction: Direction | null;
  layerName: string | null;
  url: string;
  storageKey: string;
  mimeType: string;
  width: number;
  height: number;
  fileSize: number;
  version: number;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  characterId: string;
  type: JobType;
  status: JobStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  metrics: { model: string; promptTokens: number; completionTokens: number; totalTokens: number; cost: number; durationMs: number } | null;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface CharacterAggregate {
  character: Character;
  assets: CharacterAsset[];
  jobs: GenerationJob[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  status?: CharacterStatus;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
