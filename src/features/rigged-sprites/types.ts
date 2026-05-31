export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type ArtStyle = "16bit" | "32bit" | "gbc" | "nes";

export type DetailLevel = "low" | "medium" | "high";

export type POV = "top-down" | "side-scroller" | "isometric";

export type RiggedSpriteStatus =
  | "DRAFT"
  | "EXTRACTING_DNA"
  | "DNA_READY"
  | "GENERATING_PARTS"
  | "GENERATING"
  | "READY"
  | "FAILED";

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type BodyPartName =
  | "head"
  | "hair"
  | "torso"
  | "arms"
  | "legs"
  | "weapon"
  | "shield"
  | "accessory";

export const BODY_PART_NAMES: BodyPartName[] = [
  "head", "hair", "torso", "arms", "legs", "weapon", "shield", "accessory",
];

export const CORE_BODY_PARTS: BodyPartName[] = [
  "head", "hair", "torso", "arms", "legs",
];

export const OPTIONAL_BODY_PARTS: BodyPartName[] = [
  "weapon", "shield", "accessory",
];

export interface BodyPartDNA {
  name: string;
  description: string;
  directions: {
    up: string;
    down: string;
    left: string;
    right: string;
  };
  colorPalette: string[];
  zOrder: number;
  anchorPoint: { x: number; y: number };
}

export interface RiggingConfig {
  zOrder: BodyPartName[];
  offsets: Record<BodyPartName, { x: number; y: number }>;
}

export interface RiggedSpriteDNA {
  prompt: string;
  name: string;
  race: string;
  gender: string;
  class: string;
  pov: POV;
  physical: {
    build: string;
    height: string;
    skin: { tone: string };
    eyes: { color: string; shape: string };
  };
  style: {
    artStyle: ArtStyle;
    palette: string[];
    detailLevel: DetailLevel;
  };
  bodyParts: Record<BodyPartName, BodyPartDNA>;
  canvas: { width: number; height: number };
  rigging: RiggingConfig;
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

export interface RiggedSpriteDetailsInput {
  name?: string;
  gender?: string;
  race?: string;
  class?: string;
  build?: string;
  height?: string;
  skinTone?: string;
  eyeColor?: string;
  pov?: POV;
}

export interface CreateRiggedSpriteInput {
  prompt: string;
  style: CharacterStyleInput;
  details?: RiggedSpriteDetailsInput;
}

export interface RiggedSprite {
  id: string;
  name: string;
  dna: RiggedSpriteDNA | null;
  status: RiggedSpriteStatus;
  sheetUrl: string | null;
  sheetKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RiggedSpriteAsset {
  id: string;
  characterId: string;
  type: "BODY_PART" | "SHEET";
  direction: Direction | null;
  layerName: BodyPartName | null;
  url: string;
  storageKey: string;
  mimeType: string;
  width: number;
  height: number;
  fileSize: number;
  frameCount: number | null;
  version: number;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  characterId: string;
  type: "DNA_EXTRACTION" | "BODY_PART_GENERATION";
  status: JobStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  metrics: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    durationMs: number;
  } | null;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface RiggedSpriteAggregate {
  character: RiggedSprite;
  assets: RiggedSpriteAsset[];
  jobs: GenerationJob[];
}

export type AnimationType = "idle" | "walk" | "run" | "attack" | "hit" | "death";

export const ANIMATION_TYPES: AnimationType[] = [
  "idle", "walk", "run", "attack", "hit", "death",
];

export const ANIMATION_DEFAULTS: Record<AnimationType, { frameCount: number; loop: boolean }> = {
  idle: { frameCount: 1, loop: true },
  walk: { frameCount: 4, loop: true },
  run: { frameCount: 4, loop: true },
  attack: { frameCount: 3, loop: false },
  hit: { frameCount: 2, loop: false },
  death: { frameCount: 4, loop: false },
};

export interface RiggedAnimationFrame {
  frameIndex: number;
  duration: number;
  offsets: Record<BodyPartName, { x: number; y: number }>;
  visible: Record<BodyPartName, boolean>;
}

export interface RiggedAnimation {
  name: AnimationType;
  frameCount: number;
  frames: RiggedAnimationFrame[];
  loop: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  status?: RiggedSpriteStatus;
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
