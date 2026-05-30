"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Maximize2,
  Grid3X3,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Info,
  Trash2,
  Loader2,
} from "lucide-react";
import type { CharacterAsset } from "@/features/characters/types";
import { deleteSpritePack } from "@/features/characters/actions";
import { toast } from "sonner";

interface Props {
  assets: CharacterAsset[];
  characterName: string;
  characterId: string;
}

const ANIMATION_LABELS: Record<string, { label: string; icon: string }> = {
  idle: { label: "Idle", icon: "🧍" },
  walk: { label: "Walk", icon: "🚶" },
  run: { label: "Run", icon: "🏃" },
  attack: { label: "Attack", icon: "⚔️" },
  hit: { label: "Hit", icon: "💥" },
  death: { label: "Death", icon: "💀" },
};

const DIRECTION_ORDER = ["UP", "DOWN", "LEFT", "RIGHT"];

function getAnimationName(key: string): string {
  const fileName = key.split("/").pop() || "";
  return fileName.replace(".png", "");
}

export function SpritePackViewer({ assets, characterName, characterId }: Props) {
  const packAssets = assets.filter(
    (a) => a.type === "SPRITE" && a.storageKey.includes("sprite_packs")
  );
  const [activeTab, setActiveTab] = useState<string | null>(
    packAssets.length > 0 ? packAssets[0].id : null
  );
  const [showOverlay, setShowOverlay] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeAsset = packAssets.find((a) => a.id === activeTab) || null;

  function handleDelete(assetId: string, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setDeletingId(assetId);
    startTransition(async () => {
      try {
        await deleteSpritePack(assetId, characterId);
        if (assetId === activeTab) {
          const remaining = packAssets.filter((a) => a.id !== assetId);
          setActiveTab(remaining.length > 0 ? remaining[0].id : null);
        }
        toast.success("Sprite pack deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete sprite pack");
      } finally {
        setDeletingId(null);
      }
    });
  }

  if (packAssets.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground font-mono text-sm tracking-wider">
            SPRITE PACK
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a24] border border-border flex items-center justify-center">
            <Grid3X3 className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-mono text-muted-foreground font-medium">
              No sprite pack generated
            </p>
            <p className="text-[11px] text-muted-foreground/50 font-mono mt-1.5 max-w-[260px]">
              Click GENERATE SPRITE PACK to create 4-directional animation frames for your character
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card overflow-hidden">
      <div className="editor-panel-header border-b border-border flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Grid3X3 className="h-3.5 w-3.5 text-primary" />
          <CardTitle className="text-foreground font-mono text-sm tracking-wider">
            SPRITE PACK VIEWER
          </CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowOverlay(!showOverlay)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              showOverlay
                ? "bg-primary/15 text-primary border border-primary/25"
                : "text-muted-foreground border border-border hover:text-foreground"
            }`}
            title="Toggle grid overlay"
          >
            <Grid3X3 className="h-3 w-3" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      <div className="border-b border-border bg-[#111118]">
        <div className="flex overflow-x-auto scrollbar-none">
          {packAssets.map((asset) => {
            const animName = getAnimationName(asset.storageKey);
            const meta = ANIMATION_LABELS[animName] || { label: animName, icon: "🎬" };
            const isActive = asset.id === activeTab;
              return (
               <div key={asset.id} className="flex items-center group/tab shrink-0">
                 <button
                   type="button"
                   onClick={() => setActiveTab(asset.id)}
                   className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono whitespace-nowrap border-b-2 transition-colors ${
                     isActive
                       ? "border-primary text-primary bg-primary/5"
                       : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"
                   }`}
                 >
                   <span className="text-sm">{meta.icon}</span>
                   <span className="font-semibold uppercase tracking-wider">{meta.label}</span>
                 </button>
                 <button
                   type="button"
                   onClick={(e) => handleDelete(asset.id, e)}
                   disabled={isPending}
                   className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover/tab:opacity-100 ml-0.5 shrink-0"
                   title={`Delete ${meta.label} sprite pack`}
                 >
                   {deletingId === asset.id ? (
                     <Loader2 className="h-3 w-3 animate-spin" />
                   ) : (
                     <Trash2 className="h-3 w-3" />
                   )}
                 </button>
               </div>
              );
          })}
        </div>
      </div>

      <CardContent className="p-0">
        {activeAsset ? (
          <div className="grid grid-cols-1 lg:grid-cols-4">
            <div className="lg:col-span-3 p-4 flex items-center justify-center bg-[#0d0d14]">
              <div className={`workshop-grid-fine p-6 rounded-xl w-full flex items-center justify-center ${
                showOverlay ? "" : ""
              }`}>
                <div className="sprite-glow rounded-lg overflow-hidden relative">
                  {showOverlay && (
                    <div
                      className="absolute inset-0 z-10 pointer-events-none editor-grid-sm"
                      style={{
                        backgroundSize: `calc(100% / ${activeAsset.frameCount || 4}) calc(100% / 4)`,
                      }}
                    />
                  )}
                  <img
                    src={activeAsset.url}
                    alt={`${characterName} ${getAnimationName(activeAsset.storageKey)} sprite pack`}
                    className="max-w-full h-auto pixelated relative z-0"
                    style={{ maxHeight: "50vh" }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-border bg-[#111118] p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
                    Asset Info
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted-foreground">Animation</span>
                    <span className="text-foreground font-semibold uppercase">
                      {ANIMATION_LABELS[getAnimationName(activeAsset.storageKey)]?.label || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground">SPRITE</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted-foreground">Grid</span>
                    <span className="text-foreground tabular-nums">
                      4×{activeAsset.frameCount || "?"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="text-foreground tabular-nums">
                      {activeAsset.width}×{activeAsset.height}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground tabular-nums">
                      {(activeAsset.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted-foreground">Version</span>
                    <span className="text-foreground">v{activeAsset.version}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Maximize2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
                    Directions
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {DIRECTION_ORDER.map((dir) => (
                    <div
                      key={dir}
                      className="flex flex-col items-center gap-1 p-2 rounded-md bg-[#1a1a24] border border-border"
                    >
                      {dir === "UP" && <ArrowUp className="h-3 w-3 text-primary/60" />}
                      {dir === "DOWN" && <ArrowDown className="h-3 w-3 text-primary/60" />}
                      {dir === "LEFT" && <ArrowLeft className="h-3 w-3 text-primary/60" />}
                      {dir === "RIGHT" && <ArrowRight className="h-3 w-3 text-primary/60" />}
                      <span className="text-[8px] font-mono text-muted-foreground">{dir}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
                    Export
                  </span>
                </div>
                <a
                  href={activeAsset.url}
                  download={`${characterName.replace(/\s+/g, "_")}_${getAnimationName(activeAsset.storageKey)}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-[10px] font-mono gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                  >
                    <Download className="h-3 w-3" />
                    DOWNLOAD PNG
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
