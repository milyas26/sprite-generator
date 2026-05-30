import { prisma } from "@/lib/prisma";
import type { PaginationParams, Asset } from "./types";
import type { Prisma } from "@prisma/client";

export const assetRepository = {
  async create(data: { name: string; category: string; status: string; dna: Record<string, unknown> }) {
    return prisma.character.create({
      data: {
        name: data.name,
        type: "ASSET",
        category: data.category,
        status: data.status as any,
        dna: data.dna as Prisma.InputJsonValue,
      },
    });
  },

  async findById(id: string) {
    return prisma.character.findFirst({
      where: { id, type: "ASSET" },
      include: {
        assets: { orderBy: { createdAt: "desc" } },
        jobs: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  async findMany(params: PaginationParams) {
    const where: Record<string, unknown> = { type: "ASSET" };

    if (params.status) where.status = params.status;
    if (params.category) where.category = params.category;
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
      data: data as unknown as Asset[],
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
      where: { id, type: "ASSET" },
      data,
    });
  },

  async delete(id: string) {
    return prisma.character.deleteMany({
      where: { id, type: "ASSET" },
    });
  },
};
