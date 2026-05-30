"use server";

import { characterService } from "./services";
import { createCharacterSchema } from "./validators";
import { revalidatePath } from "next/cache";
import type { SpritePackConfig } from "./types";

export async function createCharacter(prompt: string, artStyle: string, detailLevel: string) {
  const validated = createCharacterSchema.parse({ prompt, style: { artStyle, detailLevel } });

  const result = await characterService.createCharacter(validated.prompt, validated.style.artStyle, validated.style.detailLevel);

  revalidatePath("/dashboard");
  return result;
}

export async function getCharacters(params: { status?: string; search?: string; page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }) {
  return characterService.getCharacters({
    page: params.page || 1,
    limit: params.limit || 12,
    status: params.status as any,
    search: params.search,
    sort: params.sort || "createdAt",
    order: params.order || "desc",
  });
}

export async function getCharacter(characterId: string) {
  return characterService.getCharacter(characterId);
}

export async function deleteCharacter(characterId: string) {
  await characterService.deleteCharacter(characterId);
  revalidatePath("/dashboard");
}

export async function generateSpritePack(characterId: string, animations: SpritePackConfig[]) {
  const result = await characterService.generateSpritePack(characterId, animations);
  revalidatePath(`/dashboard/characters/${characterId}`);
  return result;
}
