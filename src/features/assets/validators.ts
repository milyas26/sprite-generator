import { z } from "zod";

export const createAssetSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(2000, "Prompt must be under 2000 characters"),
  category: z.enum(["TILE", "WALL", "FURNITURE", "DECORATION", "ITEM", "VEGETATION", "BUILDING", "TERRAIN"]),
  style: z.object({
    artStyle: z.enum(["16bit", "32bit", "gbc", "nes"]),
    detailLevel: z.enum(["low", "medium", "high"]),
  }),
});

export const assetDNASchema = z.object({
  prompt: z.string(),
  name: z.string().default("Untitled Asset"),
  category: z.enum(["TILE", "WALL", "FURNITURE", "DECORATION", "ITEM", "VEGETATION", "BUILDING", "TERRAIN"]),
  pov: z.enum(["top-down", "side-scroller", "isometric"]).default("top-down"),
  style: z.object({
    artStyle: z.enum(["16bit", "32bit", "gbc", "nes"]).default("16bit"),
    palette: z.array(z.string()).default([]),
    detailLevel: z.enum(["low", "medium", "high"]).default("medium"),
  }),
  visual: z.object({
    colors: z.array(z.string()).default([]),
    material: z.string().default(""),
    scale: z.string().default(""),
    aesthetic: z.string().default(""),
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
  category: z.enum(["TILE", "WALL", "FURNITURE", "DECORATION", "ITEM", "VEGETATION", "BUILDING", "TERRAIN"]).optional(),
  search: z.string().optional(),
  sort: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
