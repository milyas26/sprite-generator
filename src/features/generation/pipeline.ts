import type { ArtStyle, DetailLevel, CharacterDNA, SpritePackConfig } from "@/features/characters/types";
import { extractCharacterDNA } from "./dna-extractor";
import { generateCharacterSheet } from "./sheet-generator";
import { generateSpritePack, generateAnimationSheet } from "./sprite-pack-generator";

import { storageService } from "@/features/storage/upload";
import { buildSheetKey, buildMetadataKey, buildSpritePackKey } from "@/features/storage/naming";
import { prisma } from "@/lib/prisma";

export interface GenerationResult {
  dna: CharacterDNA;
  sheetUrl: string;
  sheetKey: string;
  tokens: number;
}

export const generationPipeline = {
  async run(input: { prompt: string; artStyle: ArtStyle; detailLevel: DetailLevel; characterId?: string }): Promise<GenerationResult> {
    const startTime = Date.now();

    const { dna } = await extractCharacterDNA(input.prompt, input.artStyle, input.detailLevel);

    const result = await generateCharacterSheet(dna);

    let imageBuffer: Buffer;
    if (result.imageBuffer) {
      imageBuffer = result.imageBuffer;
    } else if (result.imageUrl) {
      const imageResponse = await fetch(result.imageUrl);
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } else {
      throw new Error("No image generated");
    }

    let sheetKey = "";
    let sheetUrl = "";
    if (input.characterId) {
      sheetKey = buildSheetKey(input.characterId, 1);
      sheetUrl = await storageService.upload(sheetKey, imageBuffer, "image/png");

      const metadataKey = buildMetadataKey(input.characterId);
      const metadata = {
        dna,
        generatedAt: new Date().toISOString(),
        model: "gpt-4o + dall-e-3",
      };
      await storageService.upload(metadataKey, Buffer.from(JSON.stringify(metadata, null, 2)), "application/json");
    }

    if (input.characterId) {
      await prisma.character.update({
        where: { id: input.characterId },
        data: {
          name: dna.name,
          dna: dna as any,
          sheetUrl,
          sheetKey,
          status: "READY",
        },
      });

      await prisma.characterAsset.create({
        data: {
          characterId: input.characterId,
          type: "SHEET",
          url: sheetUrl,
          storageKey: sheetKey,
          mimeType: "image/png",
          width: 0,
          height: 0,
          fileSize: imageBuffer.length,
          version: 1,
        },
      });
    }

    const durationMs = Date.now() - startTime;

    return { dna, sheetUrl, sheetKey, tokens: 0 };
  },

  async generateSpritePack(characterId: string, configs: SpritePackConfig[]): Promise<{ results: { animation: string; frameCount: number; storageKey: string; url: string }[] }> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { assets: true },
    });

    if (!character || !character.dna) {
      throw new Error("Character not found or has no DNA");
    }

    const dna = character.dna as unknown as CharacterDNA;
    const results: { animation: string; frameCount: number; storageKey: string; url: string }[] = [];

    for (const config of configs) {
      const sheet = await generateAnimationSheet(dna, config.animation, config.frameCount);

      const storageKey = buildSpritePackKey(characterId, config.animation);
      const url = await storageService.upload(storageKey, sheet.imageBuffer, "image/png");

      await prisma.characterAsset.create({
        data: {
          characterId,
          type: "SPRITE",
          url,
          storageKey,
          mimeType: "image/png",
          width: 0,
          height: 0,
          fileSize: sheet.imageBuffer.length,
          version: 1,
        },
      });

      results.push({
        animation: config.animation,
        frameCount: config.frameCount,
        storageKey,
        url,
      });
    }

    return { results };
  },
};
