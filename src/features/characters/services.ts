import type { ArtStyle, DetailLevel, Character, CharacterAggregate, PaginationParams, PaginatedResult, SpritePackConfig } from "./types";
import { characterRepository } from "./repository";
import { createEmptyDNA } from "./dna-template";
import { enqueueGenerationJob, enqueueSpritePackJob } from "@/features/generation/bull-producer";
import { storageService } from "@/features/storage/upload";

export const characterService = {
  async createCharacter(prompt: string, artStyle: ArtStyle, detailLevel: DetailLevel) {
    const dna = createEmptyDNA({ prompt, style: { ...createEmptyDNA().style, artStyle, detailLevel } });

    const character = await characterRepository.create({
      name: "Untitled Character",
      status: "DRAFT" as any,
      dna: dna as any,
    });

    const job = await enqueueGenerationJob({
      characterId: character.id,
      prompt,
      artStyle,
      detailLevel,
    });

    return { characterId: character.id, jobId: job.id };
  },

  async getCharacters(params: PaginationParams) {
    return characterRepository.findMany(params) as Promise<PaginatedResult<Character>>;
  },

  async getCharacter(id: string): Promise<CharacterAggregate | null> {
    const record = await characterRepository.findById(id);
    if (!record) return null;
    const { assets, jobs, ...character } = record as any;
    return { character, assets, jobs };
  },

  async deleteCharacter(id: string) {
    const character = await characterRepository.findById(id);
    if (!character) throw new Error("Character not found");

    if (character.sheetKey) {
      await storageService.deleteDirectory(`${id}/`);
    }

    await characterRepository.delete(id);
  },

  async regenerateCharacter(id: string) {
    const character = await characterRepository.findById(id);
    if (!character) throw new Error("Character not found");

    const dna = character.dna as any;
    await characterRepository.update(id, { status: "GENERATING" as any });

    const job = await enqueueGenerationJob({
      characterId: character.id,
      prompt: dna.prompt,
      artStyle: dna.style?.artStyle || "16bit",
      detailLevel: dna.style?.detailLevel || "medium",
    });

    return { characterId: character.id, jobId: job.id };
  },

  async generateSpritePack(characterId: string, animations: SpritePackConfig[]) {
    const character = await characterRepository.findById(characterId);
    if (!character) throw new Error("Character not found");
    if (!character.dna) throw new Error("Character has no DNA — generate the base sprite sheet first");

    const job = await enqueueSpritePackJob({ characterId, animations });

    return { characterId, jobId: job.id };
  },
};
