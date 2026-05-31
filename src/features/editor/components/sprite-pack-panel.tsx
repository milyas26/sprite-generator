"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateSpritePack, deleteSpritePack } from "@/features/sprites/actions";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  User,
  Footprints,
  Zap,
  Swords,
  HeartCrack,
  Skull,
  Minus,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Download,
  Maximize2,
  ImageOff,
  X,
  Trash2,
} from "lucide-react";
import type { AnimationType, SpritePackConfig, CharacterAsset } from "@/features/sprites/types";

interface Props {
  characterId: string;
  assets: CharacterAsset[];
  characterName: string;
  onGenerated?: () => void;
}

const DIRECTION_LABELS: { dir: string; label: string; icon: React.ReactNode }[] = [
  { dir: "UP", label: "Up", icon: <ArrowUp className="h-3 w-3" /> },
  { dir: "DOWN", label: "Down", icon: <ArrowDown className="h-3 w-3" /> },
  { dir: "LEFT", label: "Left", icon: <ArrowLeft className="h-3 w-3" /> },
  { dir: "RIGHT", label: "Right", icon: <ArrowRight className="h-3 w-3" /> },
];

const ANIMATION_DEFS: {
  key: AnimationType;
  label: string;
  icon: React.ReactNode;
  description: string;
  defaultFrames: number;
}[] = [
  { key: "idle", label: "Idle", icon: <User className="h-4 w-4" />, description: "Standing / breathing", defaultFrames: 2 },
  { key: "walk", label: "Walk", icon: <Footprints className="h-4 w-4" />, description: "Walking cycle", defaultFrames: 4 },
  { key: "run", label: "Run", icon: <Zap className="h-4 w-4" />, description: "Running cycle", defaultFrames: 4 },
  { key: "attack", label: "Attack", icon: <Swords className="h-4 w-4" />, description: "Attack swing", defaultFrames: 4 },
  { key: "hit", label: "Hit", icon: <HeartCrack className="h-4 w-4" />, description: "Taking damage", defaultFrames: 2 },
  { key: "death", label: "Death", icon: <Skull className="h-4 w-4" />, description: "Death sequence", defaultFrames: 4 },
];

const ANIMATION_META: Record<string, { label: string; icon: React.ReactNode }> = {
  idle: { label: "Idle", icon: <User className="h-3 w-3" /> },
  walk: { label: "Walk", icon: <Footprints className="h-3 w-3" /> },
  run: { label: "Run", icon: <Zap className="h-3 w-3" /> },
  attack: { label: "Attack", icon: <Swords className="h-3 w-3" /> },
  hit: { label: "Hit", icon: <HeartCrack className="h-3 w-3" /> },
  death: { label: "Death", icon: <Skull className="h-3 w-3" /> },
};

const FRAME_RANGE = { min: 2, max: 8 };

function getAnimationName(key: string): string {
  const afterPrefix = key.split("sprite_packs/")[1];
  if (!afterPrefix) return key.split("/").pop()?.replace(".png", "") || "";
  const parts = afterPrefix.split("/");
  return parts[0].replace(".png", "");
}

function getDirectionFromKey(key: string): string | null {
  const afterPrefix = key.split("sprite_packs/")[1];
  if (!afterPrefix) return null;
  const parts = afterPrefix.split("/");
  if (parts.length >= 2) {
    return parts[1].replace(".png", "").toUpperCase();
  }
  return null;
}

  function getDirectionIcon(dir: string): React.ReactNode {
    switch (dir) {
      case "UP": return <ArrowUp className="h-2.5 w-2.5" />;
      case "DOWN": return <ArrowDown className="h-2.5 w-2.5" />;
      case "LEFT": return <ArrowLeft className="h-2.5 w-2.5" />;
      case "RIGHT": return <ArrowRight className="h-2.5 w-2.5" />;
      default: return null;
    }
  }

  function groupAssetsByAnimation(assets: CharacterAsset[]) {
    const groups: Record<string, { animation: string; directions: CharacterAsset[] }> = {};
    for (const asset of assets) {
      const anim = getAnimationName(asset.storageKey);
      if (!groups[anim]) {
        groups[anim] = { animation: anim, directions: [] };
      }
      groups[anim].directions.push(asset);
    }
    return Object.values(groups);
  }

function fileSizeLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)}K`;
  return `${bytes}B`;
}

export function SpritePackPanel({ characterId, assets, characterName, onGenerated }: Props) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<AnimationType, boolean>>({
    idle: false,
    walk: false,
    run: false,
    attack: false,
    hit: false,
    death: false,
  });
  const [frameCounts, setFrameCounts] = useState<Record<AnimationType, number>>({
    idle: 2,
    walk: 4,
    run: 4,
    attack: 4,
    hit: 2,
    death: 4,
  });
  const [activeAnim, setActiveAnim] = useState<AnimationType | null>(null);
  const [zoomAsset, setZoomAsset] = useState<CharacterAsset | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleAnimation(key: AnimationType) {
    setSelected((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (next[key]) setActiveAnim(key);
      else if (activeAnim === key) setActiveAnim(null);
      return next;
    });
  }

  function handleFrameChange(key: AnimationType, delta: number) {
    setFrameCounts((prev) => ({
      ...prev,
      [key]: Math.min(FRAME_RANGE.max, Math.max(FRAME_RANGE.min, prev[key] + delta)),
    }));
  }

  function setFrame(key: AnimationType, value: number) {
    setFrameCounts((prev) => ({ ...prev, [key]: value }));
  }

  const selectedList = Object.entries(selected).filter(([, v]) => v);
  const selectedCount = selectedList.length;

  const packAssets = assets.filter(
    (a) => a.type === "SPRITE" && a.storageKey.includes("sprite_packs")
  );

  const zoomName = zoomAsset ? getAnimationName(zoomAsset.storageKey) : "";
  const zoomDirection = zoomAsset ? getDirectionFromKey(zoomAsset.storageKey) : null;
  const zoomMeta = zoomName ? (ANIMATION_META[zoomName] || { label: zoomName, icon: <Package className="h-3 w-3" /> }) : null;

  async function handleGenerate() {
    const configs: SpritePackConfig[] = selectedList.map(([key]) => ({
      animation: key as AnimationType,
      frameCount: frameCounts[key as AnimationType],
    }));

    if (configs.length === 0) {
      toast.error("Select at least one animation");
      return;
    }

    setLoading(true);
    try {
      await generateSpritePack(characterId, configs);
      toast.success(`${configs.length} animation(s) × 4 directions queued for generation`);
      onGenerated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate sprite pack");
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteAsset(assetId: string, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setDeletingId(assetId);
    startTransition(async () => {
      try {
        await deleteSpritePack(assetId, characterId);
        toast.success("Sprite pack deleted");
        onGenerated?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete sprite pack");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="flex-1 bg-[#1c1820] overflow-y-auto flex flex-col">
      <div className="p-4 space-y-4 flex-1">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Package className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              Sprite Pack Generator
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {ANIMATION_DEFS.map(({ key, label, icon, description, defaultFrames }) => {
              const isSel = selected[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleAnimation(key)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSel
                      ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
                      : "border-border/30 bg-[#29242d] hover:border-border/60 hover:bg-[#342e3a]"
                  }`}
                >
                  <div className={`p-1.5 rounded-md inline-flex mb-2 ${
                    isSel ? "bg-primary/25 text-primary" : "bg-[#3a3341] text-muted-foreground"
                  }`}>
                    {icon}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-foreground mb-0.5">
                    {label}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono mb-1">
                    {description}
                  </div>
                  <div className="text-[8px] font-mono text-muted-foreground/60">
                    Default: {defaultFrames} frames
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {activeAnim && selected[activeAnim] && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-[#29242d] flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground uppercase shrink-0 font-semibold">
              {ANIMATION_DEFS.find((a) => a.key === activeAnim)?.label} Frames:
            </span>
            <button
              type="button"
              onClick={() => handleFrameChange(activeAnim, -1)}
              disabled={frameCounts[activeAnim] <= FRAME_RANGE.min}
              className="flex items-center justify-center w-6 h-6 rounded border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-30 transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-mono font-bold text-primary tabular-nums min-w-[20px] text-center">
              {frameCounts[activeAnim]}
            </span>
            <button
              type="button"
              onClick={() => handleFrameChange(activeAnim, 1)}
              disabled={frameCounts[activeAnim] >= FRAME_RANGE.max}
              className="flex items-center justify-center w-6 h-6 rounded border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-30 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
            <div className="flex gap-1">
              {[2, 3, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFrame(activeAnim, n)}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-colors ${
                    frameCounts[activeAnim] === n
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-transparent text-muted-foreground hover:border-border/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedCount > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                Preview Layout
              </span>
              <span className="text-[8px] font-mono text-muted-foreground/50">
                1 direction per API call
              </span>
            </div>

            <div className="flex gap-4 flex-wrap">
              {selectedList.map(([key]) => {
                const frames = frameCounts[key as AnimationType];
                return (
                  <div key={key} className="p-2 rounded-lg border border-border/30 bg-[#29242d]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-primary/70">
                        {ANIMATION_DEFS.find(a => a.key === key)?.icon}
                      </span>
                      <span className="text-[9px] font-mono font-semibold text-foreground/80 uppercase">
                        {ANIMATION_DEFS.find(a => a.key === key)?.label}
                      </span>
                      <span className="text-[7px] font-mono text-muted-foreground ml-auto">
                        {frames}f × 4 directions = {frames * 4} frames
                      </span>
                    </div>
                    <div className="space-y-1">
                      {DIRECTION_LABELS.map(({ dir, label, icon }) => (
                        <div key={dir} className="flex items-center gap-1">
                          <span className="flex items-center gap-0.5 w-7 text-[7px] font-mono text-muted-foreground">
                            {icon} <span className="w-3">{dir}</span>
                          </span>
                          <div
                            className="editor-grid grid flex-1 border border-border/40 rounded overflow-hidden"
                            style={{
                              gridTemplateColumns: `repeat(${frames}, minmax(0, 1fr))`,
                              gridTemplateRows: "1fr",
                              width: frames * 14,
                              height: 14,
                            }}
                          >
                            {Array.from({ length: frames }, (_, i) => (
                              <div
                                key={i}
                                className="aspect-square border border-dashed border-muted-foreground/10 bg-primary/3"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            size="sm"
            className="h-8 text-[11px] font-mono bg-emerald-600 hover:bg-emerald-500 text-white border-0 gap-1.5 font-semibold tracking-wider"
            onClick={handleGenerate}
            disabled={loading || selectedCount === 0}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                GENERATING...
              </>
            ) : (
              <>
                <Package className="h-3.5 w-3.5" />
                GENERATE PACK{selectedCount > 0 ? ` (${selectedCount} anims × 4 dirs)` : ""}
              </>
            )}
          </Button>
          {selectedCount > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground">
              {selectedCount} animation{selectedCount > 1 ? "s" : ""} · {selectedCount * 4} API calls
            </span>
          )}
        </div>

        {packAssets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 pt-2 border-t border-border/30">
              <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                Generated Packs
              </span>
              <span className="text-[9px] font-mono text-emerald-400/60">
                {new Set(packAssets.map(a => getAnimationName(a.storageKey))).size} anims / {packAssets.length} dirs
              </span>
            </div>
            <div className="space-y-3">
              {groupAssetsByAnimation(packAssets).map((group) => {
                const meta = ANIMATION_META[group.animation] || { label: group.animation, icon: <Package className="h-3 w-3" /> };
                return (
                  <div key={group.animation} className="p-3 rounded-lg border border-border/30 bg-[#29242d]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-primary/60">{meta.icon}</span>
                      <span className="text-[10px] font-mono font-semibold text-foreground uppercase">
                        {meta.label}
                      </span>
                      <span className="text-[8px] font-mono text-muted-foreground">
                        {group.directions.length} directions
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {DIRECTION_LABELS.map(({ dir, label, icon: dirIcon }) => {
                        const asset = group.directions.find((a) => {
                          const aDir = a.direction || getDirectionFromKey(a.storageKey);
                          return aDir === dir;
                        });
                        if (!asset) {
                          return (
                            <div key={dir} className="p-1.5 rounded-lg border border-dashed border-border/20 bg-[#1c1820]">
                              <div className="aspect-square rounded border border-border/10 flex items-center justify-center">
                                <span className="text-[7px] font-mono text-muted-foreground/20">{dir}</span>
                              </div>
                              <div className="flex items-center justify-center gap-0.5 mt-1">
                                {dirIcon}
                                <span className="text-[7px] font-mono text-muted-foreground/30">{label}</span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={asset.id}
                            className="p-1.5 rounded-lg border border-border/30 bg-[#1c1820] hover:border-primary/30 transition-colors group"
                          >
                            <button
                              onClick={() => setZoomAsset(asset)}
                              className="w-full text-left"
                            >
                              <div className="aspect-square rounded border border-border/20 overflow-hidden relative group/img bg-[#0d0b10]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={asset.url}
                                  alt={`${meta.label} ${dir}`}
                                  className="w-full h-full object-contain pixelated"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                                  <Maximize2 className="h-3 w-3 text-white/0 group-hover/img:text-white/60 transition-all" />
                                </div>
                              </div>
                            </button>
                            <div className="flex items-center justify-center gap-0.5 mt-1">
                              {dirIcon}
                              <span className="text-[7px] font-mono text-muted-foreground/60">{label}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/10">
                              <span className="text-[7px] font-mono text-muted-foreground/30">
                                {fileSizeLabel(asset.fileSize)}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <a
                                  href={asset.url}
                                  download={`${characterName.replace(/\s+/g, "_")}_${meta.label.toLowerCase()}_${dir.toLowerCase()}.png`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-0.5 p-0.5 rounded text-[7px] font-mono text-muted-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors"
                                >
                                  <Download className="h-2 w-2" />
                                </a>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteAsset(asset.id, e)}
                                  disabled={isPending}
                                  className="flex items-center justify-center w-4 h-4 rounded text-muted-foreground/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                  title={`Delete ${meta.label} ${dir} sprite`}
                                >
                                  {deletingId === asset.id ? (
                                    <Loader2 className="h-2 w-2 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-2 w-2" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!characterId && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <ImageOff className="h-6 w-6 text-muted-foreground/15" />
            </div>
            <p className="text-[11px] font-mono text-muted-foreground/30">
              Select a character to configure sprite packs
            </p>
          </div>
        </div>
      )}

      <Dialog open={!!zoomAsset} onOpenChange={() => setZoomAsset(null)}>
        <DialogContent className="border-0 bg-[#1c1820] p-0 gap-0 overflow-hidden w-auto max-w-[95vw] max-h-[90vh] grid-rows-[auto_1fr_auto] sm:max-w-none" showCloseButton={false}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
            <DialogTitle className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary/60">{zoomMeta?.icon}</span>
              {zoomMeta?.label} {zoomDirection && <span className="text-primary">({zoomDirection})</span>}
            </DialogTitle>
            <button
              onClick={() => setZoomAsset(null)}
              className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="editor-grid flex items-center justify-center overflow-auto min-h-0 p-4">
            {zoomAsset && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={zoomAsset.url}
                alt={zoomName}
                className="aspect-square max-w-full max-h-full object-contain pixelated"
                style={{ imageRendering: "pixelated" }}
              />
            )}
          </div>
          <div className="flex items-center justify-end px-4 py-2 border-t border-border bg-[#252028] shrink-0">
            {zoomAsset && (
              <a
                href={zoomAsset.url}
                download={`${characterName.replace(/\s+/g, "_")}_${zoomName}_${zoomDirection?.toLowerCase() || "sprite"}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border/50 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Download className="h-3 w-3" />
                Download PNG
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
