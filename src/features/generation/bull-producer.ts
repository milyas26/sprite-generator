import { Queue } from "bullmq";
import type { ArtStyle, DetailLevel, SpritePackConfig, CharacterDetailsInput } from "@/features/characters/types";
import { prisma } from "@/lib/prisma";

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
