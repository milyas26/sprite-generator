import { jobQueue } from "./job-queue";
import { generationPipeline } from "./pipeline";
import { prisma } from "@/lib/prisma";

export async function processNextJob(): Promise<{ processed: number }> {
  await jobQueue.resetStaleJobs();

  const job = await jobQueue.claimNext();
  if (!job) return { processed: 0 };

  const character = job.character as any;

  try {
    if (job.type === "COMPOSITE") {
      const existingDNA = character.dna?.directions?.up ? (character.dna as any) : undefined;
      const details = job.input?.details as any;

      const result = await generationPipeline.run({
        prompt: character.dna?.prompt || job.input?.prompt as string,
        artStyle: job.input?.artStyle as any || character.dna?.style?.artStyle || "16bit",
        detailLevel: job.input?.detailLevel as any || character.dna?.style?.detailLevel || "medium",
        characterId: job.characterId,
        existingDNA,
        details,
      });

      await jobQueue.complete(job.id, { dna: result.dna, sheetUrl: result.sheetUrl });
    } else if (job.type === "SPRITE_PACK") {
      const animations = (job.input?.animations as any[]) || [];

      const result = await generationPipeline.generateSpritePack(job.characterId, animations);

      await jobQueue.complete(job.id, {
        type: "SPRITE_PACK",
        results: result.results,
      });
    } else if (job.type === "ASSET_GENERATION") {
      const result = await generationPipeline.runAsset({
        assetId: job.characterId,
        prompt: (job.input?.prompt as string) || "a game asset",
        category: (job.input?.category as any) || "TILE",
        artStyle: (job.input?.artStyle as any) || "16bit",
        detailLevel: (job.input?.detailLevel as any) || "medium",
      });

      await jobQueue.complete(job.id, { dna: result.dna, sheetUrl: result.sheetUrl });
    }

    return { processed: 1 };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await jobQueue.fail(job.id, errorMessage, job.attempts);

    if (job.attempts + 1 >= job.maxAttempts) {
      await prisma.character.updateMany({
        where: { id: job.characterId },
        data: { status: "FAILED" },
      });
    }

    return { processed: 0 };
  }
}
