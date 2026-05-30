export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type ArtStyle = "16bit" | "32bit" | "gbc" | "nes";

export type DetailLevel = "low" | "medium" | "high";

export type POV = "top-down" | "side-scroller" | "isometric";

export type AssetCategory = "TILE" | "WALL" | "FURNITURE" | "DECORATION" | "ITEM" | "VEGETATION" | "BUILDING" | "TERRAIN";

export type AssetStatus = "DRAFT" | "EXTRACTING_DNA" | "DNA_READY" | "GENERATING_SHEET" | "GENERATING" | "READY" | "FAILED";

export interface AssetDNA {
  prompt: string;
  name: string;
  category: AssetCategory;
  pov: POV;
  style: {
    artStyle: ArtStyle;
    palette: string[];
    detailLevel: DetailLevel;
  };
  visual: {
    colors: string[];
    material: string;
    scale: string;
    aesthetic: string;
  };
  directions: {
    up: string;
    down: string;
    left: string;
    right: string;
  };
  tags: string[];
}

export interface AssetCategoryConfig {
  category: AssetCategory;
  label: string;
  description: string;
  hasDirections: boolean;
}

export const ASSET_CATEGORIES: AssetCategoryConfig[] = [
  { category: "TILE", label: "Tile", description: "Ground/floor tiles for building levels", hasDirections: true },
  { category: "WALL", label: "Wall", description: "Wall segments and barriers", hasDirections: true },
  { category: "FURNITURE", label: "Furniture", description: "Tables, chairs, beds, shelves", hasDirections: true },
  { category: "DECORATION", label: "Decoration", description: "Paintings, rugs, torches, banners", hasDirections: true },
  { category: "ITEM", label: "Item", description: "Pickups, weapons, potions, treasure", hasDirections: true },
  { category: "VEGETATION", label: "Vegetation", description: "Trees, bushes, grass, flowers", hasDirections: true },
  { category: "BUILDING", label: "Building", description: "Houses, castles, shops, towers", hasDirections: true },
  { category: "TERRAIN", label: "Terrain", description: "Mountains, rivers, cliffs, paths", hasDirections: true },
];

export interface CharacterStyleInput {
  artStyle: ArtStyle;
  detailLevel: DetailLevel;
}

export interface CreateAssetInput {
  prompt: string;
  category: AssetCategory;
  style: CharacterStyleInput;
}

export interface Asset {
  id: string;
  name: string;
  dna: AssetDNA | null;
  category: AssetCategory;
  status: AssetStatus;
  sheetUrl: string | null;
  sheetKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  status?: AssetStatus;
  category?: AssetCategory;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
