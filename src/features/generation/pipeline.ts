import type { ArtStyle, DetailLevel, CharacterDNA, CharacterStatus, SpritePackConfig, CharacterDetailsInput } from "@/features/sprites/types";
import type { AssetCategory } from "@/features/assets/types";
import { extractCharacterDNA } from "./dna-extractor";
import { generateCharacterSheet } from "./sheet-generator";
import { generateSpritePack, generateAnimationSheet, analyzeMasterSheet } from "./sprite-pack-generator";
import { extractAssetDNA } from "./asset-dna-extractor";
import { generateAssetSheet } from "./asset-sheet-generator";

import { storageService } from "@/features/storage/upload";
import { buildSheetKey, buildMetadataKey, buildSpritePackKey } from "@/features/storage/naming";
import { prisma } from "@/lib/prisma";

function readPngDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length < 24) return { width: 0, height: 0 };
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

export interface GenerationResult {
  dna: CharacterDNA;
  sheetUrl: string;
  sheetKey: string;
  tokens: number;
}

export const generationPipeline = {
  async run(input: { prompt: string; artStyle: ArtStyle; detailLevel: DetailLevel; characterId?: string; existingDNA?: CharacterDNA; details?: CharacterDetailsInput }): Promise<GenerationResult> {
    const startTime = Date.now();

    const updateStatus = async (status: CharacterStatus) => {
      if (input.characterId) {
        await prisma.character.update({
          where: { id: input.characterId },
          data: { status },
        });
      }
    };

    await updateStatus("EXTRACTING_DNA");

    const dna = input.existingDNA?.directions?.up
      ? input.existingDNA
      : (await extractCharacterDNA(input.prompt, input.artStyle, input.detailLevel, input.details)).dna;

    await updateStatus("GENERATING_SHEET");

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
      const dims = readPngDimensions(imageBuffer);

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
          width: dims.width,
          height: dims.height,
          fileSize: imageBuffer.length,
          version: 1,
        },
      });
    }

    const durationMs = Date.now() - startTime;

    return { dna, sheetUrl, sheetKey, tokens: 0 };
  },

  async runAsset(input: { assetId: string; prompt: string; category: AssetCategory; artStyle: ArtStyle; detailLevel: DetailLevel }): Promise<{ dna: Record<string, unknown>; sheetUrl: string; sheetKey: string }> {
    const startTime = Date.now();

    const updateStatus = async (status: CharacterStatus) => {
      await prisma.character.update({
        where: { id: input.assetId },
        data: { status },
      });
    };

    await updateStatus("EXTRACTING_DNA");

    const { dna } = await extractAssetDNA(input.prompt, input.category, input.artStyle, input.detailLevel);

    await updateStatus("GENERATING_SHEET");

    const result = await generateAssetSheet(dna);

    let imageBuffer: Buffer;
    if (result.imageBuffer) {
      imageBuffer = result.imageBuffer;
    } else if (result.imageUrl) {
      const imageResponse = await fetch(result.imageUrl);
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } else {
      throw new Error("No image generated");
    }

    const sheetKey = buildSheetKey(input.assetId, 1);
    const sheetUrl = await storageService.upload(sheetKey, imageBuffer, "image/png");

    const metadataKey = buildMetadataKey(input.assetId);
    const metadata = {
      dna,
      generatedAt: new Date().toISOString(),
      model: "gpt-4o + dall-e-3",
    };
    await storageService.upload(metadataKey, Buffer.from(JSON.stringify(metadata, null, 2)), "application/json");

    const dims = readPngDimensions(imageBuffer);

    await prisma.character.update({
      where: { id: input.assetId },
      data: {
        name: (dna as any).name || "Untitled Asset",
        dna: dna as any,
        sheetUrl,
        sheetKey,
        status: "READY",
      },
    });

    await prisma.characterAsset.create({
      data: {
        characterId: input.assetId,
        type: "SHEET",
        url: sheetUrl,
        storageKey: sheetKey,
        mimeType: "image/png",
        width: dims.width,
        height: dims.height,
        fileSize: imageBuffer.length,
        version: 1,
      },
    });

    return { dna, sheetUrl, sheetKey };
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

    let masterSheetReference: string | null = null;
    if (character.sheetKey) {
      try {
        const sheetBuffer = await storageService.getBuffer(character.sheetKey);
        const base64 = sheetBuffer.toString("base64");
        const dataUrl = `data:image/png;base64,${base64}`;
        masterSheetReference = await analyzeMasterSheet(dataUrl);
      } catch {
        masterSheetReference = null;
      }
    }

    const results: { animation: string; frameCount: number; storageKey: string; url: string }[] = [];

    for (const config of configs) {
      const sheet = await generateAnimationSheet(dna, config.animation, config.frameCount, masterSheetReference);

      const storageKey = buildSpritePackKey(characterId, config.animation);
      const url = await storageService.upload(storageKey, sheet.imageBuffer, "image/png");
      const dims = readPngDimensions(sheet.imageBuffer);

      await prisma.characterAsset.create({
        data: {
          characterId,
          type: "SPRITE",
          url,
          storageKey,
          mimeType: "image/png",
          width: dims.width,
          height: dims.height,
          fileSize: sheet.imageBuffer.length,
          frameCount: config.frameCount,
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
