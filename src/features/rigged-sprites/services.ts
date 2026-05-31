import type { ArtStyle, DetailLevel, RiggedSprite, RiggedSpriteAggregate, PaginationParams, PaginatedResult, RiggedSpriteDetailsInput, RiggedSpriteDNA, RiggedSpriteAsset, GenerationJob } from "./types";
import { riggedSpriteRepository } from "./repository";
import { createEmptyRiggedDNA } from "./dna-template";
import { enqueueRiggedSpriteJob } from "@/features/generation/bull-producer";
import { storageService } from "@/features/storage/upload";

export const riggedSpriteService = {
  async createRiggedSprite(prompt: string, artStyle: ArtStyle, detailLevel: DetailLevel, details?: RiggedSpriteDetailsInput) {
    const dnaOverrides: Record<string, unknown> = { prompt, style: { artStyle, palette: [], detailLevel } };

    if (details) {
      if (details.name) dnaOverrides.name = details.name;
      if (details.gender) dnaOverrides.gender = details.gender;
      if (details.race) dnaOverrides.race = details.race;
      if (details.class) dnaOverrides.class = details.class;
      if (details.pov) dnaOverrides.pov = details.pov;
      if (details.build || details.height || details.skinTone || details.eyeColor) {
        const physical: Record<string, unknown> = {};
        if (details.build) physical.build = details.build;
        if (details.height) physical.height = details.height;
        if (details.skinTone) physical.skin = { tone: details.skinTone };
        if (details.eyeColor) physical.eyes = { color: details.eyeColor, shape: "" };
        dnaOverrides.physical = physical;
      }
    }

    const dna = createEmptyRiggedDNA(dnaOverrides as Partial<RiggedSpriteDNA>);

    const character = await riggedSpriteRepository.create({
      name: dna.name,
      status: "DRAFT",
      dna: dna as unknown as Record<string, unknown>,
    });

    const job = await enqueueRiggedSpriteJob({
      characterId: character.id,
      prompt,
      artStyle,
      detailLevel,
      details,
    });

    return { characterId: character.id, jobId: job.id };
  },

  async getRiggedSprites(params: PaginationParams) {
    return riggedSpriteRepository.findMany(params) as Promise<PaginatedResult<RiggedSprite>>;
  },

  async getRiggedSprite(id: string): Promise<RiggedSpriteAggregate | null> {
    const record = await riggedSpriteRepository.findById(id);
    if (!record) return null;
    const raw = record as unknown as {
      assets: RiggedSpriteAsset[];
      jobs: GenerationJob[];
      id: string;
      name: string;
      dna: Record<string, unknown> | null;
      status: string;
      sheetUrl: string | null;
      sheetKey: string | null;
      createdAt: string;
      updatedAt: string;
    };
    const { assets, jobs, ...character } = raw;
    return {
      character: {
        ...character,
        dna: character.dna as RiggedSprite["dna"],
        status: character.status as RiggedSprite["status"],
      },
      assets,
      jobs,
    };
  },

  async deleteRiggedSprite(id: string) {
    const character = await riggedSpriteRepository.findById(id);
    if (!character) throw new Error("Character not found");

    if (character.sheetKey) {
      await storageService.deleteDirectory(`${id}/`);
    }

    await riggedSpriteRepository.delete(id);
  },

  async updateRiggedSpriteDNA(id: string, dna: Record<string, unknown>) {
    const character = await riggedSpriteRepository.findById(id);
    if (!character) throw new Error("Character not found");
    await riggedSpriteRepository.update(id, { dna });
  },

  async regenerateRiggedSprite(id: string) {
    const character = await riggedSpriteRepository.findById(id);
    if (!character) throw new Error("Character not found");

    const dna = character.dna as unknown as RiggedSpriteDNA;
    await riggedSpriteRepository.update(id, { status: "GENERATING_PARTS" });

    const job = await enqueueRiggedSpriteJob({
      characterId: character.id,
      prompt: dna.prompt,
      artStyle: dna.style?.artStyle || "16bit",
      detailLevel: dna.style?.detailLevel || "medium",
    });

    return { characterId: character.id, jobId: job.id };
  },
};
