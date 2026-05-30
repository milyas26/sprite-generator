import { getAsset } from "@/features/assets/actions";
import { CharacterSheetViewer } from "@/features/sprites/components/character-sheet-viewer";
import { DNAViewer } from "@/features/sprites/components/dna-viewer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DeleteAssetButton } from "@/features/assets/components/delete-asset-dialog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, Info, Clock } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { colors: string; label: string; dot: string }> = {
  DRAFT: { colors: "text-amber-400 border-amber-500/20 bg-amber-500/5", label: "Draft", dot: "bg-amber-500" },
  EXTRACTING_DNA: { colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", label: "Extracting DNA", dot: "bg-sky-500 animate-sprite-pulse" },
  DNA_READY: { colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", label: "DNA Ready", dot: "bg-sky-500" },
  GENERATING_SHEET: { colors: "text-violet-400 border-violet-500/20 bg-violet-500/5", label: "Generating Sheet", dot: "bg-violet-500 animate-sprite-pulse" },
  GENERATING: { colors: "text-primary border-primary/20 bg-primary/5", label: "Generating", dot: "bg-primary animate-sprite-pulse" },
  READY: { colors: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", label: "Ready", dot: "bg-emerald-500" },
  FAILED: { colors: "text-red-400 border-red-500/20 bg-red-500/5", label: "Failed", dot: "bg-red-500" },
};

function getCategoryLabel(category: string | null) {
  if (!category) return null;
  const labels: Record<string, string> = {
    TILE: "Tile",
    WALL: "Wall",
    FURNITURE: "Furniture",
    DECORATION: "Decoration",
    ITEM: "Item",
    VEGETATION: "Vegetation",
    BUILDING: "Building",
    TERRAIN: "Terrain",
  };
  return labels[category] || category;
}

const jobLabels: Record<string, string> = {
  DNA_EXTRACTION: "DNA Extraction",
  SHEET_GENERATION: "Sheet Generation",
  COMPOSITE: "Full Pipeline",
  SPRITE_PACK: "Sprite Pack",
  ASSET_GENERATION: "Asset Generation",
};

export default async function AssetDetailPage({ params }: Props) {
  const { id } = await params;
  const record = await getAsset(id);

  if (!record) notFound();

  const asset = record as any;
  const jobs = asset?.jobs ?? [];
  const status = statusConfig[asset.status] || {
    colors: "text-muted-foreground border-border bg-transparent",
    label: asset.status,
    dot: "bg-muted-foreground",
  };

  const categoryLabel = getCategoryLabel(asset.category);
  const hasSheet = !!asset.sheetUrl;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/assets"
          className="flex items-center justify-center w-7 h-7 rounded border border-border bg-[#1a1a28] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground font-heading truncate">{asset.name}</h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold border ${status.colors}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          {categoryLabel && (
            <Badge variant="outline" className="text-[9px] border-border bg-transparent text-muted-foreground px-2 py-0.5">
              {categoryLabel}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Created {new Date(asset.createdAt).toLocaleDateString()}
        </span>
        {asset.dna && (
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            DNA extracted
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          {hasSheet && (
            <Card className="border-border bg-card overflow-hidden">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">ASSET SHEET</CardTitle>
              </div>
              <CardContent className="p-0">
                <CharacterSheetViewer imageUrl={asset.sheetUrl} characterName={asset.name} />
              </CardContent>
            </Card>
          )}

          {!hasSheet && asset.status !== "FAILED" && (
            <Card className="border-dashed border-border bg-card">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center">
                  <Layers className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <div>
                  <p className="text-sm font-mono font-semibold text-muted-foreground">No sheet yet</p>
                  <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">
                    {asset.status === "GENERATING" ? "Generation in progress..." : "Asset is being processed"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {asset.status === "FAILED" && (
            <Card className="border-red-500/20 bg-card">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <p className="text-xs text-red-400 font-mono">Generation failed. Delete and try creating again.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {asset.dna && (
            <Card className="border-border bg-card overflow-hidden">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Info className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">ASSET DNA</CardTitle>
              </div>
              <CardContent className="p-3">
                <DNAViewer dna={asset.dna} />
              </CardContent>
            </Card>
          )}

          {jobs && jobs.length > 0 && (
            <Card className="border-border bg-card overflow-hidden">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">JOB HISTORY</CardTitle>
              </div>
              <CardContent className="p-2 space-y-1">
                {jobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between text-[10px] font-mono py-1.5 px-2.5 rounded-md bg-background/40 border border-border/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="border-border bg-transparent text-muted-foreground text-[9px] flex-shrink-0 px-1.5 py-0">
                        {jobLabels[job.type] || job.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[9px] flex-shrink-0 px-1.5 py-0 ${
                          job.status === "COMPLETED"
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                            : job.status === "FAILED"
                              ? "text-red-400 border-red-500/20 bg-red-500/5"
                              : "text-muted-foreground border-border bg-transparent"
                        }`}
                      >
                        {job.status}
                      </Badge>
                      {job.error && <span className="text-red-400/70 truncate">{job.error}</span>}
                    </div>
                    <span className="text-muted-foreground/60 flex-shrink-0 ml-2">
                      {job.completedAt
                        ? new Date(job.completedAt).toLocaleString()
                        : new Date(job.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
