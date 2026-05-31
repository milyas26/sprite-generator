"use client";

import { useState } from "react";
import { Search, ImageIcon, PackageOpen } from "lucide-react";
import { ASSET_CATEGORIES } from "@/features/assets/types";
import type { Asset } from "@/features/assets/types";

const categoryLabels: Record<string, string> = {};
for (const cat of ASSET_CATEGORIES) {
  categoryLabels[cat.category] = cat.label;
}

const ALL_CATEGORIES = "ALL";

interface AssetBucketProps {
  assets: Asset[];
  onAddToCanvas: (asset: Asset) => void;
}

export function AssetBucket({ assets, onAddToCanvas }: AssetBucketProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES);

  const filtered = assets.filter((asset) => {
    const matchSearch =
      !search || asset.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === ALL_CATEGORIES || asset.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-border bg-secondary/30 flex-shrink-0">
        <span className="text-[10px] font-mono font-semibold text-foreground">Asset Bucket</span>
      </div>

      <div className="px-2 py-2 space-y-1.5 flex-shrink-0 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-7 pl-6 pr-2 rounded-md border border-border bg-secondary/50 text-[10px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full h-7 rounded-md border border-border bg-secondary/50 text-[10px] font-mono text-foreground px-1.5 focus:outline-none focus:border-primary/40"
        >
          <option value={ALL_CATEGORIES}>All Categories</option>
          {ASSET_CATEGORIES.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <PackageOpen className="h-5 w-5 text-muted-foreground/30" />
            <p className="text-[9px] font-mono text-muted-foreground/50">No assets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {filtered.map((asset) => (
              <button
                key={asset.id}
                onClick={() => onAddToCanvas(asset)}
                disabled={!asset.sheetUrl}
                title={asset.name}
                className="group relative aspect-square rounded-md border border-border bg-[#1c1820] hover:border-primary/40 hover:bg-[#241f2a] transition-colors overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {asset.sheetUrl ? (
                  <img
                    src={asset.sheetUrl}
                    alt={asset.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                )}
                <span className="absolute bottom-0 left-0 right-0 truncate px-1 py-0.5 text-[7px] font-mono bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  {asset.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
