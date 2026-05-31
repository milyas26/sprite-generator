import { z } from "zod";

export const createRiggedSpriteSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(2000, "Prompt must be under 2000 characters"),
  style: z.object({
    artStyle: z.enum(["16bit", "32bit", "gbc", "nes"]),
    detailLevel: z.enum(["low", "medium", "high"]),
  }),
  details: z.object({
    name: z.string().optional(),
    gender: z.string().optional(),
    race: z.string().optional(),
    class: z.string().optional(),
    build: z.string().optional(),
    height: z.string().optional(),
    skinTone: z.string().optional(),
    eyeColor: z.string().optional(),
    pov: z.enum(["top-down", "side-scroller", "isometric"]).optional(),
  }).optional(),
});

export const bodyPartDNASchema = z.object({
  name: z.string(),
  description: z.string().default(""),
  directions: z.object({
    up: z.string().default(""),
    down: z.string().default(""),
    left: z.string().default(""),
    right: z.string().default(""),
  }),
  colorPalette: z.array(z.string()).default([]),
  zOrder: z.number().int().min(0).max(20).default(0),
  anchorPoint: z.object({
    x: z.number().int().default(0),
    y: z.number().int().default(0),
  }),
});

export const riggedSpriteDNASchema = z.object({
  prompt: z.string(),
  name: z.string().default("Unknown"),
  race: z.string().default("human"),
  gender: z.string().default("male"),
  class: z.string().default("adventurer"),
  pov: z.enum(["top-down", "side-scroller", "isometric"]).default("top-down"),
  physical: z.object({
    build: z.string().default("athletic"),
    height: z.string().default("average"),
    skin: z.object({ tone: z.string().default("fair") }),
    eyes: z.object({ color: z.string().default("brown"), shape: z.string().default("round") }),
  }),
  style: z.object({
    artStyle: z.enum(["16bit", "32bit", "gbc", "nes"]).default("16bit"),
    palette: z.array(z.string()).default([]),
    detailLevel: z.enum(["low", "medium", "high"]).default("medium"),
  }),
  bodyParts: z.record(z.string(), bodyPartDNASchema),
  canvas: z.object({
    width: z.number().int().positive().default(64),
    height: z.number().int().positive().default(64),
  }),
  rigging: z.object({
    zOrder: z.array(z.string()).default([]),
    offsets: z.record(z.string(), z.object({
      x: z.number().int().default(0),
      y: z.number().int().default(0),
    })),
  }),
  directions: z.object({
    up: z.string().default(""),
    down: z.string().default(""),
    left: z.string().default(""),
    right: z.string().default(""),
  }),
  tags: z.array(z.string()).default([]),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  status: z.enum(["DRAFT", "EXTRACTING_DNA", "DNA_READY", "GENERATING_PARTS", "GENERATING", "READY", "FAILED"]).optional(),
  search: z.string().optional(),
  sort: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateRiggedSpriteInput = z.infer<typeof createRiggedSpriteSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
