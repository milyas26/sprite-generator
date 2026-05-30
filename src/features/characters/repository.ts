import { prisma } from "@/lib/prisma";
import type { PaginationParams, PaginatedResult, Character } from "./types";
import type { Prisma } from "@prisma/client";

export const characterRepository = {
  async create(data: { name: string; status: string; dna: Record<string, unknown> }) {
    return prisma.character.create({
      data: {
        name: data.name,
        status: data.status as any,
        dna: data.dna as Prisma.InputJsonValue,
      },
    });
  },

  async findById(id: string) {
    return prisma.character.findFirst({
      where: { id },
      include: {
        assets: { orderBy: { createdAt: "desc" } },
        jobs: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  async findMany(params: PaginationParams) {
    const where: Record<string, unknown> = {};

    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.character.findMany({
        where,
        orderBy: { [params.sort || "createdAt"]: params.order || "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.character.count({ where }),
    ]);

    return {
      data: data as unknown as Character[],
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },

  async update(id: string, data: Record<string, unknown>) {
    return prisma.character.updateMany({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.character.deleteMany({
      where: { id },
    });
  },

  async findAssetById(assetId: string) {
    return prisma.characterAsset.findUnique({
      where: { id: assetId },
    });
  },

  async deleteAsset(assetId: string) {
    return prisma.characterAsset.delete({
      where: { id: assetId },
    });
  },
};
