"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Armchair, Footprints, Hand, Headphones, Scissors, Shield, Swords, Wand, Layers } from "lucide-react";
import type { BodyPartName } from "@/features/rigged-sprites/types";

const partIcons: Partial<Record<BodyPartName, React.ReactNode>> = {
  head: <Headphones className="h-3.5 w-3.5" />,
  hair: <Scissors className="h-3.5 w-3.5" />,
  torso: <Armchair className="h-3.5 w-3.5" />,
  arms: <Hand className="h-3.5 w-3.5" />,
  legs: <Footprints className="h-3.5 w-3.5" />,
  weapon: <Swords className="h-3.5 w-3.5" />,
  shield: <Shield className="h-3.5 w-3.5" />,
  accessory: <Wand className="h-3.5 w-3.5" />,
};

const partLabels: Record<BodyPartName, string> = {
  head: "Head",
  hair: "Hair",
  torso: "Torso",
  arms: "Arms",
  legs: "Legs",
  weapon: "Weapon",
  shield: "Shield",
  accessory: "Accessory",
};

interface RiggedSpriteAssetData {
  id: string;
  characterId: string;
  type: string;
  layerName: BodyPartName | null;
  url: string;
  storageKey: string;
  width: number;
  height: number;
}

interface BodyPartViewerProps {
  assets: RiggedSpriteAssetData[];
}

export function BodyPartViewer({ assets }: BodyPartViewerProps) {
  const [selectedPart, setSelectedPart] = useState<RiggedSpriteAssetData | null>(
    assets.length > 0 ? assets[0] : null
  );

  const bodyPartAssets = assets.filter((a) => a.type === "BODY_PART");
  const ordered: BodyPartName[] = [
    "head", "hair", "torso", "arms", "legs", "weapon", "shield", "accessory",
  ];

  const assetsByPart = new Map<string, RiggedSpriteAssetData>();
  for (const a of bodyPartAssets) {
    if (a.layerName) assetsByPart.set(a.layerName, a);
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-sm text-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Body Parts
          <Badge variant="outline" className="ml-1 text-[9px]">
            {bodyPartAssets.length} parts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {ordered.map((name) => {
            const asset = assetsByPart.get(name);
            return (
              <button
                key={name}
                onClick={() => asset && setSelectedPart(asset)}
                disabled={!asset}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-semibold border transition-colors ${
                  selectedPart?.layerName === name
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : asset
                      ? "bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                      : "bg-background/50 border-border/40 text-muted-foreground/30 cursor-not-allowed"
                }`}
              >
                {partIcons[name]}
                {partLabels[name]}
              </button>
            );
          })}
        </div>

        {selectedPart ? (
          <div className="rounded-lg border border-border bg-[#1f1b23] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
              <span className="text-[10px] font-mono font-semibold text-foreground capitalize">
                {selectedPart.layerName && partLabels[selectedPart.layerName]}
              </span>
              <Badge variant="outline" className="text-[9px] ml-auto">
                {selectedPart.width}x{selectedPart.height}
              </Badge>
            </div>
            <div className="aspect-square flex items-center justify-center p-4">
              <img
                src={selectedPart.url}
                alt={selectedPart.layerName || "body part"}
                className="max-w-full max-h-full object-contain pixelated"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-[#1f1b23] aspect-square flex items-center justify-center">
            <div className="text-center">
              <Layers className="h-8 w-8 text-muted-foreground/25 mx-auto mb-2" />
              <span className="text-[10px] text-muted-foreground font-mono">
                No body parts generated yet
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
