"use server";

import { processNextJob } from "./job-processor";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function processNextJobAction() {
  const result = await processNextJob();
  revalidatePath("/dashboard");
  return result;
}

export async function getPendingJobCount() {
  return prisma.generationJob.count({ where: { status: "PENDING" } });
}

export async function retryFailedJob(jobId: string) {
  const job = await prisma.generationJob.findUnique({
    where: { id: jobId },
    include: { character: true },
  });

  if (!job) throw new Error("Job not found");
  if (job.status !== "FAILED") throw new Error("Only failed jobs can be retried");

  await prisma.$transaction([
    prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "PENDING",
        attempts: 0,
        error: null,
        startedAt: null,
        completedAt: null,
      },
    }),
    prisma.character.updateMany({
      where: { id: job.characterId },
      data: { status: "DRAFT" },
    }),
  ]);

  processNextJob().catch((err) =>
    console.error("Retry job processing failed:", err)
  );

  revalidatePath("/dashboard");
  return { success: true };
}
