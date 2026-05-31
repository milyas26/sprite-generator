import { prisma } from "@/lib/prisma";
import type { PaginationParams, RiggedSprite } from "./types";
import type { Prisma } from "@prisma/client";

export const riggedSpriteRepository = {
  async create(data: { name: string; status: string; dna: Record<string, unknown> }) {
    return prisma.character.create({
      data: {
        name: data.name,
        type: "RIGGED_SPRITE",
        status: data.status as string as Prisma.CharacterCreateInput["status"],
        dna: data.dna as Prisma.InputJsonValue,
      },
    });
  },

  async findById(id: string) {
    return prisma.character.findFirst({
      where: { id, type: "RIGGED_SPRITE" },
      include: {
        assets: { orderBy: { createdAt: "desc" } },
        jobs: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  async findMany(params: PaginationParams) {
    const where: Record<string, unknown> = { type: "RIGGED_SPRITE" };

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
      data: data as unknown as RiggedSprite[],
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
      where: { id, type: "RIGGED_SPRITE" },
      data,
    });
  },

  async delete(id: string) {
    return prisma.character.deleteMany({
      where: { id, type: "RIGGED_SPRITE" },
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

  async findAssetsByCharacterId(characterId: string) {
    return prisma.characterAsset.findMany({
      where: { characterId, type: "BODY_PART" },
      orderBy: { createdAt: "asc" },
    });
  },
};
