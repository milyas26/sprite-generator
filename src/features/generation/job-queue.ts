import { prisma } from "@/lib/prisma";
import { JOB } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export const jobQueue = {
  async enqueue(data: { characterId: string; type: string; input: Record<string, unknown> }) {
    return prisma.generationJob.create({
      data: {
        characterId: data.characterId,
        type: data.type as any,
        status: "PENDING",
        input: data.input as Prisma.InputJsonValue,
        maxAttempts: JOB.MAX_ATTEMPTS,
      },
    });
  },

  async claimNext(): Promise<any | null> {
    const job = await prisma.generationJob.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { character: true },
    });

    if (!job) return null;

    const claimed = await prisma.generationJob.updateMany({
      where: { id: job.id, status: "PENDING" },
      data: { status: "PROCESSING", startedAt: new Date() },
    });

    if (claimed.count === 0) return null;

    return job;
  },

  async complete(jobId: string, output: Record<string, unknown>) {
    return prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED", output: output as Prisma.InputJsonValue, completedAt: new Date() },
    });
  },

  async fail(jobId: string, error: string, attempts: number) {
    const shouldRetry = attempts + 1 < JOB.MAX_ATTEMPTS;

    return prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: shouldRetry ? "PENDING" : "FAILED",
        attempts: { increment: 1 },
        error,
        completedAt: shouldRetry ? null : new Date(),
      },
    });
  },

  async resetStaleJobs() {
    const staleTime = new Date(Date.now() - JOB.STALE_JOB_TIMEOUT_MS);
    await prisma.generationJob.updateMany({
      where: {
        status: "PROCESSING",
        startedAt: { lt: staleTime },
      },
      data: {
        status: "PENDING",
        startedAt: null,
      },
    });
  },
};
