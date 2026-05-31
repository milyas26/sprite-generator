import { getAssets } from "@/features/assets/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateAssetButton } from "@/features/assets/components/create-asset-button";
import type { AssetStatus, AssetCategory } from "@/features/assets/types";
import { ASSET_CATEGORIES } from "@/features/assets/types";

const categoryLabels: Record<string, string> = {};
for (const cat of ASSET_CATEGORIES) {
  categoryLabels[cat.category] = cat.label;
}

const statusConfig: Record<string, { colors: string; dot: string }> = {
  DRAFT: { colors: "text-amber-400 border-amber-500/20 bg-amber-500/5", dot: "bg-amber-500" },
  EXTRACTING_DNA: { colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", dot: "bg-sky-500 animate-sprite-pulse" },
  DNA_READY: { colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", dot: "bg-sky-500" },
  GENERATING_SHEET: { colors: "text-violet-400 border-violet-500/20 bg-violet-500/5", dot: "bg-violet-500 animate-sprite-pulse" },
  GENERATING: { colors: "text-primary border-primary/20 bg-primary/5", dot: "bg-primary animate-sprite-pulse" },
  READY: { colors: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", dot: "bg-emerald-500" },
  FAILED: { colors: "text-red-400 border-red-500/20 bg-red-500/5", dot: "bg-red-500" },
};

export default function AssetsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/15">
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground font-heading">Assets</h1>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Tiles, walls, furniture, and game world objects</p>
          </div>
        </div>
        <CreateAssetButton variant="header" />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg bg-card border border-border" />
            ))}
          </div>
        }
      >
        <AssetsGridWrapper />
      </Suspense>
    </div>
  );
}

async function AssetsGridWrapper() {
  const result = await getAssets({ page: 1, limit: 20 });

  if (result.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5 text-center border-2 border-dashed border-border rounded-lg">
        <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center">
          <Boxes className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-mono font-semibold text-muted-foreground">No assets yet</p>
          <p className="text-[11px] text-muted-foreground/50 font-mono max-w-xs">
            Create pixel art tiles, walls, furniture, items, vegetation, and buildings for your game worlds.
          </p>
        </div>
        <CreateAssetButton variant="empty" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {result.data.map((asset) => {
        const status = statusConfig[asset.status as string] || {
          colors: "text-muted-foreground border-border bg-transparent",
          dot: "bg-muted-foreground",
        };
        return (
          <Link key={asset.id} href={`/dashboard/assets/${asset.id}`}>
            <Card className="border-border bg-card hover:border-primary/30 transition-colors h-full overflow-hidden group cursor-pointer py-0">
              <div className="aspect-square bg-[#221e26] flex items-center justify-center border-b border-border overflow-hidden">
                {asset.sheetUrl ? (
                  <img
                    src={asset.sheetUrl}
                    alt={asset.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground/25" />
                )}
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-mono font-semibold text-foreground truncate">{asset.name}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-semibold border ${status.colors} flex-shrink-0`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {asset.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] border-border text-muted-foreground bg-transparent px-1.5 py-0">
                    {categoryLabels[asset.category as string] || asset.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
