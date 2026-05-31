"use client";

import { Button } from "@/components/ui/button";
import { Save, RotateCcw, ZoomIn, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RiggedToolbarProps {
  characterId: string;
  characterName: string;
  zoom: number;
  isSaving: boolean;
  hasChanges: boolean;
  onZoomChange: (zoom: number) => void;
  onSave: () => void;
  onReset: () => void;
}

export function RiggedToolbar({
  characterId,
  characterName,
  zoom,
  isSaving,
  hasChanges,
  onZoomChange,
  onSave,
  onReset,
}: RiggedToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-card">
      <Link
        href={`/dashboard/rigged-sprites/${characterId}`}
        className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary/50 border border-border hover:bg-secondary transition-colors flex-shrink-0"
        title="Back to detail"
      >
        <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
      </Link>

      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-mono font-semibold text-foreground truncate block">
          {characterName}
        </span>
        <span className="text-[8px] font-mono text-muted-foreground/50">Rigged Editor</span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ZoomIn className="h-3 w-3 text-muted-foreground/50" />
        <input
          type="range"
          min={25}
          max={400}
          step={5}
          value={zoom * 100}
          onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
          className="w-24 h-1.5 accent-primary cursor-pointer"
        />
        <span className="text-[9px] font-mono text-muted-foreground w-8 text-right">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        disabled={!hasChanges || isSaving}
        className="h-7 text-[10px] font-mono border-border text-muted-foreground hover:text-foreground hover:bg-secondary gap-1"
      >
        <RotateCcw className="h-3 w-3" />
        Reset
      </Button>

      <Button
        size="sm"
        onClick={onSave}
        disabled={!hasChanges || isSaving}
        className="h-7 text-[10px] font-mono bg-primary hover:bg-primary/85 text-primary-foreground gap-1"
      >
        <Save className="h-3 w-3" />
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
