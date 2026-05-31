"use server";

import { riggedSpriteService } from "./services";
import { createRiggedSpriteSchema } from "./validators";
import { revalidatePath } from "next/cache";
import type { RiggedSpriteDetailsInput, RiggedSpriteStatus } from "./types";

export async function createRiggedSprite(prompt: string, artStyle: string, detailLevel: string, details?: RiggedSpriteDetailsInput) {
  const validated = createRiggedSpriteSchema.parse({ prompt, style: { artStyle, detailLevel }, details });

  const result = await riggedSpriteService.createRiggedSprite(
    validated.prompt,
    validated.style.artStyle,
    validated.style.detailLevel,
    validated.details
  );

  revalidatePath("/dashboard/rigged-sprites");
  return result;
}

export async function getRiggedSprites(params: { status?: string; search?: string; page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }) {
  return riggedSpriteService.getRiggedSprites({
    page: params.page || 1,
    limit: params.limit || 12,
    status: params.status as RiggedSpriteStatus,
    search: params.search,
    sort: params.sort || "createdAt",
    order: params.order || "desc",
  });
}

export async function getRiggedSprite(characterId: string) {
  return riggedSpriteService.getRiggedSprite(characterId);
}

export async function deleteRiggedSprite(characterId: string) {
  await riggedSpriteService.deleteRiggedSprite(characterId);
  revalidatePath("/dashboard/rigged-sprites");
}

export async function updateRiggedSpriteDNA(characterId: string, dna: Record<string, unknown>) {
  await riggedSpriteService.updateRiggedSpriteDNA(characterId, dna);
  revalidatePath("/dashboard/rigged-sprites");
}

export async function regenerateRiggedSprite(characterId: string) {
  const result = await riggedSpriteService.regenerateRiggedSprite(characterId);
  revalidatePath("/dashboard/rigged-sprites");
  return result;
}
