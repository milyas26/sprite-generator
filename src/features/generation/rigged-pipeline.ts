import type { ArtStyle, DetailLevel, RiggedSpriteDNA, BodyPartName, RiggedSpriteStatus, RiggedSpriteDetailsInput } from "@/features/rigged-sprites/types";
import { extractRiggedSpriteDNA } from "./rigged-dna-extractor";
import { generateBodyPartSheet } from "./body-part-generator";
import { storageService } from "@/features/storage/upload";
import { buildBodyPartKey } from "@/features/storage/naming";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function readPngDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length < 24) return { width: 0, height: 0 };
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const GENERATION_PART_ORDER: BodyPartName[] = [
  "head", "hair", "torso", "arms", "legs", "weapon", "shield", "accessory",
];

export interface RiggedGenerationResult {
  dna: RiggedSpriteDNA;
  parts: { partName: BodyPartName; storageKey: string; url: string }[];
  tokens: number;
}

export const riggedGenerationPipeline = {
  async run(input: {
    prompt: string;
    artStyle: ArtStyle;
    detailLevel: DetailLevel;
    characterId?: string;
    details?: RiggedSpriteDetailsInput;
  }): Promise<RiggedGenerationResult> {
    const updateStatus = async (status: RiggedSpriteStatus) => {
      if (input.characterId) {
        await prisma.character.update({
          where: { id: input.characterId },
          data: { status },
        });
      }
    };

    await updateStatus("EXTRACTING_DNA");

    const { dna } = await extractRiggedSpriteDNA(
      input.prompt,
      input.artStyle,
      input.detailLevel,
      input.details
    );

    await updateStatus("GENERATING_PARTS");

    const parts = dna.bodyParts;
    const partsToGenerate: BodyPartName[] = GENERATION_PART_ORDER.filter(
      (name) => parts[name]
    );

    const results: { partName: BodyPartName; storageKey: string; url: string }[] = [];

    for (const partName of partsToGenerate) {
      const partDNA = parts[partName];
      const result = await generateBodyPartSheet(dna, partName, partDNA);

      let imageBuffer: Buffer;
      if (result.imageBuffer) {
        imageBuffer = result.imageBuffer;
      } else if (result.imageUrl) {
        const imageResponse = await fetch(result.imageUrl);
        imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      } else {
        throw new Error(`No image generated for body part: ${partName}`);
      }

      const storageKey = input.characterId
        ? buildBodyPartKey(input.characterId, partName)
        : "";
      const url = input.characterId
        ? await storageService.upload(storageKey, imageBuffer, "image/png")
        : "";

      if (input.characterId) {
        const dims = readPngDimensions(imageBuffer);

        await prisma.characterAsset.create({
          data: {
            characterId: input.characterId,
            type: "BODY_PART",
            layerName: partName,
            url,
            storageKey,
            mimeType: "image/png",
            width: dims.width,
            height: dims.height,
            fileSize: imageBuffer.length,
            frameCount: null,
            version: 1,
          },
        });
      }

      results.push({ partName, storageKey, url });
    }

    if (input.characterId) {
      await prisma.character.update({
        where: { id: input.characterId },
        data: {
          name: dna.name,
          dna: dna as unknown as Prisma.InputJsonValue,
          status: "READY",
        },
      });
    }

    return { dna, parts: results, tokens: 0 };
  },
};
