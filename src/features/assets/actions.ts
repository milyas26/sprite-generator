"use server";

import { assetService } from "./services";
import { createAssetSchema } from "./validators";
import { revalidatePath } from "next/cache";
import type { AssetCategory } from "./types";

export async function createAsset(prompt: string, category: AssetCategory, artStyle: string, detailLevel: string) {
  const validated = createAssetSchema.parse({ prompt, category, style: { artStyle, detailLevel } });
  const result = await assetService.createAsset(validated.prompt, validated.category, validated.style.artStyle, validated.style.detailLevel);
  revalidatePath("/dashboard/assets");
  return result;
}

export async function getAssets(params: { status?: string; category?: string; search?: string; page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }) {
  return assetService.getAssets({
    page: params.page || 1,
    limit: params.limit || 12,
    status: params.status as any,
    category: params.category as any,
    search: params.search,
    sort: params.sort || "createdAt",
    order: params.order || "desc",
  });
}

export async function getAsset(assetId: string) {
  return assetService.getAsset(assetId);
}

export async function deleteAsset(assetId: string) {
  await assetService.deleteAsset(assetId);
  revalidatePath("/dashboard/assets");
}
