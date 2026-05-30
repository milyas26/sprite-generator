import { z } from "zod";

export const createCharacterSchema = z.object({
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
    hairStyle: z.string().optional(),
    hairColor: z.string().optional(),
    skinTone: z.string().optional(),
    eyeColor: z.string().optional(),
    build: z.string().optional(),
    height: z.string().optional(),
    pov: z.enum(["top-down", "side-scroller", "isometric"]).optional(),
  }).optional(),
});

export const characterDNASchema = z.object({
  prompt: z.string(),
  name: z.string().default("Unknown"),
  race: z.string().default("human"),
  gender: z.string().default("male"),
  class: z.string().default("warrior"),
  pov: z.enum(["top-down", "side-scroller", "isometric"]).default("top-down"),
  physical: z.object({
    hair: z.object({ style: z.string().default("short"), color: z.string().default("brown") }),
    eyes: z.object({ color: z.string().default("brown"), shape: z.string().default("round") }),
    skin: z.object({ tone: z.string().default("fair") }),
    build: z.string().default("athletic"),
    height: z.string().default("average"),
  }),
  equipment: z.object({
    head: z.string().nullable().default(null),
    body: z.string().default(""),
    legs: z.string().default(""),
    mainHand: z.string().nullable().default(null),
    offHand: z.string().nullable().default(null),
    accessories: z.array(z.string()).default([]),
  }),
  style: z.object({
    artStyle: z.enum(["16bit", "32bit", "gbc", "nes"]).default("16bit"),
    palette: z.array(z.string()).default([]),
    detailLevel: z.enum(["low", "medium", "high"]).default("medium"),
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
  status: z.enum(["DRAFT", "EXTRACTING_DNA", "DNA_READY", "GENERATING_SHEET", "GENERATING", "READY", "FAILED"]).optional(),
  search: z.string().optional(),
  sort: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
