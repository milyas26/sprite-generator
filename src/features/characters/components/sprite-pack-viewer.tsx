"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { CharacterAsset } from "@/features/characters/types";

interface Props {
  assets: CharacterAsset[];
  characterName: string;
}

const animationLabels: Record<string, string> = {
  idle: "Idle",
  walk: "Walk",
  run: "Run",
  attack: "Attack",
  hit: "Hit",
  death: "Death",
};

export function SpritePackViewer({ assets, characterName }: Props) {
  const packAssets = assets.filter((a) => a.type === "SPRITE" && a.storageKey.includes("sprite_packs"));

  if (packAssets.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground font-mono text-sm tracking-wider">SPRITE PACK</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-xs text-muted-foreground font-mono text-center">
            No sprite pack generated yet. Click &ldquo;GENERATE SPRITE PACK&rdquo; to create animation frames.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground font-mono text-sm tracking-wider">SPRITE PACK</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {packAssets.map((asset) => {
            const fileName = asset.storageKey.split("/").pop() || "";
            const animName = fileName.replace(".png", "");
            const label = animationLabels[animName] || animName;

            return (
              <div key={asset.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-mono font-medium text-foreground uppercase tracking-wider">{label}</h3>
                  <a
                    href={asset.url}
                    download={`${characterName.replace(/\s+/g, "_")}_${animName}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] font-mono gap-1 border-border text-secondary-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Download className="h-3 w-3" />
                      DOWNLOAD
                    </Button>
                  </a>
                </div>
                <div className="bg-background workshop-grid-fine p-4 rounded-lg flex items-center justify-center">
                  <div className="sprite-glow rounded-lg overflow-hidden">
                    <img
                      src={asset.url}
                      alt={`${characterName} ${animName} sprite pack`}
                      className="max-w-full h-auto pixelated"
                      style={{ maxHeight: "40vh" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
