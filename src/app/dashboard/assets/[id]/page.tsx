import { getAsset } from "@/features/assets/actions";
import { CharacterSheetViewer } from "@/features/sprites/components/character-sheet-viewer";
import { DNAViewer } from "@/features/sprites/components/dna-viewer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DeleteAssetButton } from "@/features/assets/components/delete-asset-dialog";
import { RegenerateAssetButton } from "@/features/assets/components/regenerate-asset-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Layers, Info, Clock, Palette,
  Box, Hash, Eye, Sparkles, AlertCircle,
  ChevronRight, Calendar, Tag, Brush, Grid3X3
} from "lucide-react";

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
    TILE: "Tile", WALL: "Wall", FURNITURE: "Furniture", DECORATION: "Decoration",
    ITEM: "Item", VEGETATION: "Vegetation", BUILDING: "Building", TERRAIN: "Terrain",
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

const artStyleLabels: Record<string, string> = {
  "16bit": "16-Bit",
  "32bit": "32-Bit",
  gbc: "Game Boy Color",
  nes: "NES",
};

const povLabels: Record<string, string> = {
  "top-down": "Top-Down",
  "side-scroller": "Side-Scroller",
  isometric: "Isometric",
};

export default async function AssetDetailPage({ params }: Props) {
  const { id } = await params;
  const record = await getAsset(id);

  if (!record) notFound();

  const asset = record as any;
  const jobs = asset?.jobs ?? [];
  const dna = asset.dna;
  const status = statusConfig[asset.status] ?? {
    colors: "text-muted-foreground border-border bg-transparent",
    label: asset.status,
    dot: "bg-muted-foreground",
  };

  const categoryLabel = getCategoryLabel(asset.category);
  const hasSheet = !!asset.sheetUrl;
  const hasDna = !!dna;
  const isProcessing = asset.status === "GENERATING" || asset.status === "GENERATING_SHEET" || asset.status === "EXTRACTING_DNA";

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04]" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

        <div className="relative px-6 py-5">
          <div className="flex items-start gap-4">
            <Link
              href="/dashboard/assets"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-popover text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all mt-0.5"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground font-heading truncate">
                  {asset.name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${status.colors}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2.5 text-[11px] font-mono text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground/60" />
                  {new Date(asset.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {categoryLabel && (
                  <span className="inline-flex items-center gap-1.5">
                    <Box className="h-3 w-3 text-muted-foreground/60" />
                    {categoryLabel}
                  </span>
                )}
                {dna?.style?.artStyle && (
                  <span className="inline-flex items-center gap-1.5">
                    <Brush className="h-3 w-3 text-muted-foreground/60" />
                    {artStyleLabels[dna.style.artStyle] ?? dna.style.artStyle}
                  </span>
                )}
                {dna?.pov && (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3 w-3 text-muted-foreground/60" />
                    {povLabels[dna.pov] ?? dna.pov}
                  </span>
                )}
                {dna?.style?.detailLevel && (
                  <span className="inline-flex items-center gap-1.5">
                    <Grid3X3 className="h-3 w-3 text-muted-foreground/60" />
                    {dna.style.detailLevel.charAt(0).toUpperCase() + dna.style.detailLevel.slice(1)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RegenerateAssetButton assetId={asset.id} hasDna={hasDna} />
              <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
            </div>
          </div>

          {dna?.tags?.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3 ml-12 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground/40" />
              {dna.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-[9px] border-border/50 bg-popover/50 text-muted-foreground px-2 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          {hasSheet && (
            <Card className="border-border bg-card overflow-hidden gap-0 animate-fade-slide-up stagger-1 py-0">
              <CardContent className="p-0">
                <CharacterSheetViewer imageUrl={asset.sheetUrl} characterName={asset.name} />
              </CardContent>
            </Card>
          )}

          {!hasSheet && asset.status !== "FAILED" && (
            <Card className="border-dashed border-border bg-card animate-fade-slide-up stagger-1 py-0">
              <CardContent className="p-14 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl border border-border flex items-center justify-center bg-popover">
                  <Layers className="h-8 w-8 text-muted-foreground/25" />
                </div>
                <div>
                  <p className="text-sm font-mono font-semibold text-muted-foreground">No sheet yet</p>
                  <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">
                    {isProcessing ? "Generation in progress..." : "Asset is being processed"}
                  </p>
                </div>
                {isProcessing && (
                  <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-progress-indeterminate w-1/3" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {asset.status === "FAILED" && (
            <Card className="border-red-500/20 bg-card animate-fade-slide-up stagger-1 py-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-red-400 font-mono font-semibold">Generation Failed</p>
                  <p className="text-[10px] text-red-400/60 font-mono mt-0.5">Delete this asset and try creating it again.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {dna?.visual?.colors?.length > 0 && (
            <Card className="border-border bg-card overflow-hidden gap-0 animate-fade-slide-up stagger-2 py-0">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Palette className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">COLOR PALETTE</CardTitle>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground/50">{dna.visual.colors.length} colors</span>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {dna.visual.colors.map((color: string, i: number) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 group">
                      <div
                        className="w-11 h-11 rounded-xl border-2 border-border shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md group-hover:border-primary/30"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[9px] font-mono text-muted-foreground/70">{color}</span>
                    </div>
                  ))}
                  {dna.style?.palette?.filter((p: string) => !dna.visual.colors.includes(p)).map((p: string, i: number) => (
                    <div key={`pal-${i}`} className="flex flex-col items-center gap-1.5 group opacity-50">
                      <div
                        className="w-11 h-11 rounded-xl border border-dashed border-border/60 shadow-sm transition-transform group-hover:scale-110"
                        style={{ backgroundColor: p }}
                      />
                      <span className="text-[9px] font-mono text-muted-foreground/50">{p}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {dna?.directions && (
            <Card className="border-border bg-card overflow-hidden gap-0 animate-fade-slide-up stagger-3 py-0">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <ChevronRight className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">DIRECTIONS</CardTitle>
              </div>
              <CardContent className="p-4 grid grid-cols-2 gap-3">
                {(["up", "down", "left", "right"] as const).map((dir) => (
                  <div key={dir} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-popover/40 border border-border/40">
                    <span className="text-[10px] font-mono font-semibold text-accent-foreground uppercase w-7">{dir}</span>
                    <span className="text-[11px] font-mono text-muted-foreground leading-relaxed">{dna.directions[dir]}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {hasDna && (
            <Card className="border-border bg-card overflow-hidden gap-0 animate-fade-slide-up stagger-1 py-0">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Info className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">ASSET DNA</CardTitle>
                <Badge variant="outline" className="ml-auto text-[9px] border-border/50 bg-transparent text-muted-foreground/50 px-1.5 py-0 font-mono">
                  {dna.category}/{dna.pov}
                </Badge>
              </div>
              <CardContent className="p-3">
                <DNAViewer dna={dna} />
              </CardContent>
            </Card>
          )}

          {hasDna && (dna.visual?.material || dna.visual?.scale || dna.visual?.aesthetic) && (
            <Card className="border-border bg-card overflow-hidden gap-0 animate-fade-slide-up stagger-2 py-0">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Hash className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">METADATA</CardTitle>
              </div>
              <CardContent className="p-3 space-y-1.5">
                {dna.visual?.material && (
                  <div className="flex items-center justify-between text-[11px] font-mono py-2 px-3 rounded-lg bg-popover/40 border border-border/30">
                    <span className="text-muted-foreground">Material</span>
                    <span className="text-foreground">{dna.visual.material}</span>
                  </div>
                )}
                {dna.visual?.scale && (
                  <div className="flex items-center justify-between text-[11px] font-mono py-2 px-3 rounded-lg bg-popover/40 border border-border/30">
                    <span className="text-muted-foreground">Scale</span>
                    <span className="text-foreground">{dna.visual.scale}</span>
                  </div>
                )}
                {dna.visual?.aesthetic && (
                  <div className="flex items-center justify-between text-[11px] font-mono py-2 px-3 rounded-lg bg-popover/40 border border-border/30">
                    <span className="text-muted-foreground">Aesthetic</span>
                    <span className="text-foreground">{dna.visual.aesthetic}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {jobs.length > 0 && (
            <Card className="border-border bg-card overflow-hidden gap-0 animate-fade-slide-up stagger-3 py-0">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">JOB HISTORY</CardTitle>
              </div>
              <CardContent className="p-3">
                <div className="relative pl-6">
                  <div className="absolute left-[8px] top-1 bottom-1 w-px bg-border/60" />
                  <div className="space-y-2.5">
                    {jobs.map((job: any) => {
                      const isCompleted = job.status === "COMPLETED";
                      const isFailed = job.status === "FAILED";
                      return (
                        <div key={job.id} className="relative">
                          <div className={`absolute -left-[22px] top-2 w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                            isCompleted ? "bg-emerald-500/10 border-emerald-500/30" :
                            isFailed ? "bg-red-500/10 border-red-500/30" :
                            "bg-popover border-border"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted ? "bg-emerald-500" : isFailed ? "bg-red-500" : "bg-muted-foreground/40"
                            }`} />
                          </div>
                          <div className={`p-2.5 rounded-lg ${
                            isCompleted ? "border border-emerald-500/10 bg-emerald-500/[0.03]" :
                            isFailed ? "border border-red-500/10 bg-red-500/[0.03]" :
                            "border border-border/40 bg-popover/30"
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[11px] font-mono font-semibold text-foreground/90">
                                  {jobLabels[job.type] || job.type}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] flex-shrink-0 px-1.5 py-0 ${
                                    isCompleted ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                                    isFailed ? "text-red-400 border-red-500/20 bg-red-500/5" :
                                    "text-muted-foreground border-border bg-transparent"
                                  }`}
                                >
                                  {job.status}
                                </Badge>
                              </div>
                              <span className="text-[9px] font-mono text-muted-foreground/40 flex-shrink-0">
                                {job.completedAt
                                  ? new Date(job.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                  : new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                            {job.error && (
                              <p className="text-[10px] text-red-400/60 font-mono mt-1.5 leading-relaxed">{job.error}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!hasDna && jobs.length === 0 && (
            <Card className="border-dashed border-border bg-card animate-fade-slide-up stagger-1 py-0">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-3">
                <Sparkles className="h-6 w-6 text-muted-foreground/15" />
                <p className="text-[11px] text-muted-foreground/40 font-mono">No data available yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
