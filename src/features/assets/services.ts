import type { ArtStyle, DetailLevel, Asset, AssetCategory, POV, PaginationParams, PaginatedResult, AssetDNA } from "./types";
import { assetRepository } from "./repository";
import { enqueueAssetGenerationJob } from "@/features/generation/bull-producer";

export const assetService = {
  async createAsset(prompt: string, category: AssetCategory, artStyle: ArtStyle, detailLevel: DetailLevel, details?: { name?: string; pov?: POV }) {
    const dna: AssetDNA = {
      prompt,
      name: details?.name || "Untitled Asset",
      category,
      pov: details?.pov || "top-down",
      style: { artStyle, palette: [], detailLevel },
      visual: { colors: [], material: "", scale: "", aesthetic: "" },
      tags: [],
    };

    const asset = await assetRepository.create({
      name: dna.name,
      category,
      status: "DRAFT" as any,
      dna: dna as any,
    });

    const job = await enqueueAssetGenerationJob({
      characterId: asset.id,
      prompt,
      category,
      artStyle,
      detailLevel,
    });

    return { assetId: asset.id, jobId: job.id };
  },

  async getAssets(params: PaginationParams) {
    return assetRepository.findMany(params) as Promise<PaginatedResult<Asset>>;
  },

  async getAsset(id: string): Promise<Asset | null> {
    return assetRepository.findById(id) as Promise<Asset | null>;
  },

  async deleteAsset(id: string) {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new Error("Asset not found");
    await assetRepository.delete(id);
  },
};
