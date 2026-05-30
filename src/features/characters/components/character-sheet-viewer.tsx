"use client";

import { Button } from "@/components/ui/button";

interface CharacterSheetViewerProps {
  imageUrl: string;
  characterName: string;
}

export function CharacterSheetViewer({ imageUrl, characterName }: CharacterSheetViewerProps) {
  return (
    <div>
      <div className="flex items-center gap-2 p-4 bg-background">
        <a href={imageUrl} download={`${characterName.replace(/\s+/g, "_")}_sheet.png`} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="border-border text-secondary-foreground hover:bg-secondary hover:text-foreground font-mono text-xs"
          >
            Download PNG
          </Button>
        </a>
        <a href={imageUrl} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="border-border text-secondary-foreground hover:bg-secondary hover:text-foreground font-mono text-xs"
          >
            Open Full Size
          </Button>
        </a>
      </div>
      <div className="bg-background workshop-grid-fine p-8 flex items-center justify-center">
        <div className="sprite-glow rounded-xl overflow-hidden">
          <img
            src={imageUrl}
            alt={`${characterName} sprite sheet`}
            className="max-w-full h-auto pixelated"
            style={{ maxHeight: "70vh" }}
          />
        </div>
      </div>
    </div>
  );
}
