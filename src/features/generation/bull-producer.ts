import { Queue } from "bullmq";
import type { ArtStyle, DetailLevel, SpritePackConfig, CharacterDetailsInput } from "@/features/sprites/types";
import type { AssetCategory } from "@/features/assets/types";
import type { RiggedSpriteDetailsInput } from "@/features/rigged-sprites/types";
import { prisma } from "@/lib/prisma";
import { generationPipeline } from "./pipeline";
import { riggedGenerationPipeline } from "./rigged-pipeline";
import { jobQueue } from "./job-queue";
import type { Prisma } from "@prisma/client";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const GENERATION_QUEUE = "generation";

function getQueue() {
  const url = new URL(REDIS_URL);

  return new Queue(GENERATION_QUEUE, {
    connection: {
      host: url.hostname,
      port: Number(url.port) || 6379,
      password: url.password || undefined,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 30_000 },
      removeOnComplete: { age: 86400 },
      removeOnFail: { age: 604800 },
    },
  });
}

interface EnqueueInput {
  characterId: string;
  prompt: string;
  artStyle: ArtStyle;
  detailLevel: DetailLevel;
  details?: CharacterDetailsInput;
}

interface EnqueueSpritePackInput {
  characterId: string;
  animations: SpritePackConfig[];
}

interface EnqueueAssetInput {
  characterId: string;
  prompt: string;
  category: AssetCategory;
  artStyle: ArtStyle;
  detailLevel: DetailLevel;
}

interface EnqueueRiggedSpriteInput {
  characterId: string;
  prompt: string;
  artStyle: ArtStyle;
  detailLevel: DetailLevel;
  details?: RiggedSpriteDetailsInput;
}

export async function enqueueGenerationJob(input: EnqueueInput) {
  const dbJob = await prisma.generationJob.create({
    data: {
      characterId: input.characterId,
      type: "COMPOSITE",
      status: "PENDING",
      input: {
        prompt: input.prompt,
        artStyle: input.artStyle,
        detailLevel: input.detailLevel,
        ...(input.details ? { details: { ...input.details } } : {}),
      } as any,
      maxAttempts: 3,
    },
  });

  const queue = getQueue();
  await queue.add(GENERATION_QUEUE, {
    characterId: input.characterId,
    prompt: input.prompt,
    artStyle: input.artStyle,
    detailLevel: input.detailLevel,
    details: input.details ? { ...input.details } : undefined,
  }, {
    jobId: dbJob.id,
  });

  await queue.close();

  import("./job-processor").then(({ processNextJob }) =>
    processNextJob().catch((err) =>
      console.error("Auto-process job failed:", err)
    )
  );

  return dbJob;
}

export async function enqueueSpritePackJob(input: EnqueueSpritePackInput) {
  const dbJob = await prisma.generationJob.create({
    data: {
      characterId: input.characterId,
      type: "SPRITE_PACK" as any,
      status: "PENDING" as any,
      input: {
        animations: input.animations,
      } as any,
      maxAttempts: 3,
    },
  });

  const queue = getQueue();
  await queue.add(GENERATION_QUEUE, {
    characterId: input.characterId,
    animations: input.animations,
    type: "SPRITE_PACK",
  }, {
    jobId: dbJob.id,
  });

  await queue.close();

  import("./job-processor").then(({ processNextJob }) =>
    processNextJob().catch((err) =>
      console.error("Auto-process sprite pack job failed:", err)
    )
  );

  return dbJob;
}

export async function enqueueAssetGenerationJob(input: EnqueueAssetInput) {
  const dbJob = await prisma.generationJob.create({
    data: {
      characterId: input.characterId,
      type: "ASSET_GENERATION",
      status: "PROCESSING",
      input: {
        prompt: input.prompt,
        category: input.category,
        artStyle: input.artStyle,
        detailLevel: input.detailLevel,
      } as any,
      maxAttempts: 3,
      startedAt: new Date(),
    },
  });

  try {
    const result = await generationPipeline.runAsset({
      assetId: input.characterId,
      prompt: input.prompt,
      category: input.category,
      artStyle: input.artStyle,
      detailLevel: input.detailLevel,
    });

    await jobQueue.complete(dbJob.id, { dna: result.dna, sheetUrl: result.sheetUrl });

    return dbJob;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await prisma.generationJob.update({
      where: { id: dbJob.id },
      data: {
        status: "FAILED",
        error: errorMessage,
        completedAt: new Date(),
      },
    });

    await prisma.character.updateMany({
      where: { id: input.characterId },
      data: { status: "FAILED" },
    });

    throw error;
  }
}

export async function enqueueRiggedSpriteJob(input: EnqueueRiggedSpriteInput) {
  const dbJob = await prisma.generationJob.create({
    data: {
      characterId: input.characterId,
      type: "BODY_PART_GENERATION",
      status: "PROCESSING",
      input: {
        prompt: input.prompt,
        artStyle: input.artStyle,
        detailLevel: input.detailLevel,
        ...(input.details ? { details: { ...input.details } } : {}),
      } as Prisma.InputJsonValue,
      maxAttempts: 3,
      startedAt: new Date(),
    },
  });

  try {
    const result = await riggedGenerationPipeline.run({
      characterId: input.characterId,
      prompt: input.prompt,
      artStyle: input.artStyle,
      detailLevel: input.detailLevel,
      details: input.details,
    });

    await jobQueue.complete(dbJob.id, { dna: result.dna, parts: result.parts });

    return dbJob;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await prisma.generationJob.update({
      where: { id: dbJob.id },
      data: {
        status: "FAILED",
        error: errorMessage,
        completedAt: new Date(),
      },
    });

    await prisma.character.updateMany({
      where: { id: input.characterId },
      data: { status: "FAILED" },
    });

    throw error;
  }
}
