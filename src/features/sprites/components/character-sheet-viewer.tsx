"use client";

import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface CharacterSheetViewerProps {
  imageUrl: string;
  characterName: string;
}

export function CharacterSheetViewer({ imageUrl, characterName }: CharacterSheetViewerProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#252028] border-b border-border">
        <a href={imageUrl} download={`${characterName.replace(/\s+/g, "_")}_sheet.png`} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] font-mono gap-1 border-border text-secondary-foreground hover:bg-secondary hover:text-foreground"
          >
            <Download className="h-3 w-3" />
            DOWNLOAD
          </Button>
        </a>
        <a href={imageUrl} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] font-mono gap-1 border-border text-secondary-foreground hover:bg-secondary hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            FULL SIZE
          </Button>
        </a>
      </div>
      <div className="editor-grid-sm bg-[#1f1b23] p-8 flex items-center justify-center">
        <div className="sprite-glow rounded-lg overflow-hidden">
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
