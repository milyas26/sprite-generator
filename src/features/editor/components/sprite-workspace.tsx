"use client";

import type { Character } from "@/features/characters/types";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useRef, useState, useCallback } from "react";

interface SpriteWorkspaceProps {
  character: Character | null;
  zoom: number;
  gridVisible: boolean;
}

export function SpriteWorkspace({
  character,
  zoom,
  gridVisible,
}: SpriteWorkspaceProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsPanning(true);
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  if (!character) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a10] editor-grid">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
            <ImageOff className="h-7 w-7 text-muted-foreground/25" />
          </div>
          <div>
            <p className="text-[11px] font-mono text-muted-foreground/60 font-medium">
              No Character Selected
            </p>
            <p className="text-[9px] font-mono text-muted-foreground/30 mt-0.5">
              Select an asset from the explorer
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!character.sheetUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a10] editor-grid">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <span className="text-muted-foreground/40 font-mono text-lg">?</span>
          </div>
          <div>
            <p className="text-[11px] font-mono text-muted-foreground/60 font-medium">
              {character.name}
            </p>
            <p className="text-[9px] font-mono text-muted-foreground/30 mt-0.5">
              {character.status === "GENERATING"
                ? "Generating sprite sheet..."
                : character.status === "FAILED"
                  ? "Generation failed. Try regenerating."
                  : "No sprite sheet available"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 flex items-center justify-center overflow-hidden select-none relative",
        gridVisible ? "editor-grid-sm" : "editor-grid",
        isPanning ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{ backgroundColor: "#0a0a10" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        key={character.id}
        className="relative transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <div className="relative sprite-glow rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={character.sheetUrl}
            alt={`${character.name} sprite sheet`}
            className="max-w-[80vw] max-h-[70vh] object-contain pixelated"
            draggable={false}
          />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6">
            <span className="text-[8px] font-mono text-muted-foreground/50 bg-[#0a0a10]/80 px-1.5 py-0.5 rounded border border-border/20">
              BACK
            </span>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6">
            <span className="text-[8px] font-mono text-muted-foreground/50 bg-[#0a0a10]/80 px-1.5 py-0.5 rounded border border-border/20">
              FRONT
            </span>
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12">
            <span className="text-[8px] font-mono text-muted-foreground/50 bg-[#0a0a10]/80 px-1.5 py-0.5 rounded border border-border/20">
              LEFT
            </span>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12">
            <span className="text-[8px] font-mono text-muted-foreground/50 bg-[#0a0a10]/80 px-1.5 py-0.5 rounded border border-border/20">
              RIGHT
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a0a10]/90 border border-border/30 backdrop-blur-sm">
        <span className="text-[9px] font-mono text-muted-foreground/50">
          {Math.round(zoom * 100)}%
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/30">{character.name}</span>
      </div>
    </div>
  );
}
