"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Maximize2,
  User,
  Footprints,
  Zap,
  Swords,
  HeartCrack,
  Skull,
  Package,
  X,
} from "lucide-react";
import type { CharacterAsset } from "@/features/characters/types";

interface Props {
  assets: CharacterAsset[];
}

const ANIMATION_META: Record<string, { label: string; icon: React.ReactNode }> = {
  idle: { label: "Idle", icon: <User className="h-3 w-3" /> },
  walk: { label: "Walk", icon: <Footprints className="h-3 w-3" /> },
  run: { label: "Run", icon: <Zap className="h-3 w-3" /> },
  attack: { label: "Attack", icon: <Swords className="h-3 w-3" /> },
  hit: { label: "Hit", icon: <HeartCrack className="h-3 w-3" /> },
  death: { label: "Death", icon: <Skull className="h-3 w-3" /> },
};

function getAnimationName(key: string): string {
  const fileName = key.split("/").pop() || "";
  return fileName.replace(".png", "");
}

export function GeneratedPacksList({ assets }: Props) {
  const [zoomAsset, setZoomAsset] = useState<CharacterAsset | null>(null);

  const packAssets = assets.filter(
    (a) => a.type === "SPRITE" && a.storageKey.includes("sprite_packs")
  );

  if (packAssets.length === 0) {
    return (
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 mb-1.5">
          <Package className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            Generated Packs
          </span>
        </div>
        <p className="text-[8px] font-mono text-muted-foreground/20">
          No sprite packs yet
        </p>
      </div>
    );
  }

  const zoomName = zoomAsset ? getAnimationName(zoomAsset.storageKey) : "";
  const zoomMeta = zoomName ? (ANIMATION_META[zoomName] || { label: zoomName, icon: <Package className="h-3 w-3" /> }) : null;

  return (
    <>
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 mb-1.5">
          <Package className="h-3 w-3 text-emerald-400" />
          <span className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            Generated Packs
          </span>
          <span className="text-[8px] font-mono text-emerald-400/60 ml-auto">
            {packAssets.length}
          </span>
        </div>
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {packAssets.map((asset) => {
            const animName = getAnimationName(asset.storageKey);
            const meta = ANIMATION_META[animName] || {
              label: animName,
              icon: <Package className="h-3 w-3" />,
            };
            return (
              <div
                key={asset.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded border border-border/30 bg-[#0a0a10] hover:border-primary/30 transition-colors group"
              >
                <button
                  onClick={() => setZoomAsset(asset)}
                  className="w-6 h-6 rounded border border-border/30 bg-[#0a0a10] overflow-hidden flex-shrink-0 hover:border-primary/40 transition-colors relative group/img"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt={animName}
                    className="w-full h-full object-contain pixelated"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="h-2.5 w-2.5 text-white/0 group-hover/img:text-white/50 transition-all" />
                  </div>
                </button>
                <button
                  onClick={() => setZoomAsset(asset)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-primary/70">{meta.icon}</span>
                    <span className="text-[9px] font-mono font-semibold text-foreground/80 truncate">
                      {meta.label}
                    </span>
                  </div>
                </button>
                <a
                  href={asset.url}
                  download={`${animName}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-5 h-5 rounded text-muted-foreground/30 hover:text-foreground/60 hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  <Download className="h-2.5 w-2.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!zoomAsset} onOpenChange={() => setZoomAsset(null)}>
        <DialogContent
          className="border-0 bg-[#0a0a10] p-0 gap-0 max-w-[95vw] sm:max-w-none max-h-[90vh] grid-rows-[auto_1fr_auto]"
          showCloseButton={false}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <DialogTitle className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary/60">{zoomMeta?.icon}</span>
              {zoomMeta?.label} Sprite Pack
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
          <div className="flex items-center justify-end px-4 py-2 border-t border-border bg-[#0f0f16]">
            {zoomAsset && (
              <a
                href={zoomAsset.url}
                download={`${zoomName}.png`}
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
    </>
  );
}
