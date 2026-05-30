"use client";

import type { Character } from "@/features/characters/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Sparkles,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  gridVisible: boolean;
  onToggleGrid: () => void;
  onExport: () => void;
  onRegenerate: () => void;
}

export function EditorToolbar({
  characters,
  selectedCharacter,
  onSelectCharacter,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  gridVisible,
  onToggleGrid,
  onExport,
  onRegenerate,
}: EditorToolbarProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 h-10 px-3 bg-[#12121a] border-b border-border shrink-0 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 ring-1 ring-primary/20 flex-shrink-0">
          <span className="text-primary text-[8px] font-bold font-mono">SP</span>
        </div>

        <div className="relative">
          <select
            value={selectedCharacter?.id ?? ""}
            onChange={(e) => {
              const char = characters.find((c) => c.id === e.target.value);
              if (char) onSelectCharacter(char);
            }}
            className="appearance-none bg-transparent text-[12px] font-heading font-semibold text-foreground tracking-tight cursor-pointer pl-2 pr-6 py-0.5 rounded border border-transparent hover:border-border/40 focus:border-primary/30 focus:outline-none max-w-[200px] truncate"
          >
            <option value="" disabled className="bg-[#12121a] text-muted-foreground font-mono text-[11px]">
              Select character...
            </option>
            {characters.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#12121a] text-foreground font-mono text-[11px]">
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <Button
        size="xs"
        variant="ghost"
        className="toolbar-btn text-[11px] gap-1.5 h-7"
        onClick={() => router.push("/dashboard/characters/new")}
      >
        <Plus className="h-3 w-3" />
        <span className="hidden sm:inline">Generate</span>
      </Button>

      <Button
        size="xs"
        variant="ghost"
        className="toolbar-btn text-[11px] gap-1.5 h-7 opacity-40 cursor-not-allowed"
        disabled
      >
        <Sparkles className="h-3 w-3" />
        <span className="hidden sm:inline">Variant</span>
      </Button>

      <Button
        size="xs"
        variant="ghost"
        className="toolbar-btn text-[11px] gap-1.5 h-7"
        onClick={onExport}
        disabled={!selectedCharacter?.sheetUrl}
      >
        <Download className="h-3 w-3" />
        <span className="hidden sm:inline">Export</span>
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5 text-muted-foreground">
        <Button
          size="icon-xs"
          variant="ghost"
          className="toolbar-btn h-7 w-7"
          onClick={onZoomOut}
          disabled={!selectedCharacter}
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        <span className="text-[10px] font-mono text-muted-foreground w-9 text-center tabular-nums select-none">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          size="icon-xs"
          variant="ghost"
          className="toolbar-btn h-7 w-7"
          onClick={onZoomIn}
          disabled={!selectedCharacter}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          className="toolbar-btn h-7 w-7"
          onClick={onFitToScreen}
          disabled={!selectedCharacter}
        >
          <Maximize className="h-3 w-3" />
        </Button>
        <Separator orientation="vertical" className="h-4 mx-1" />
        <Button
          size="icon-xs"
          variant="ghost"
          className={cn("toolbar-btn h-7 w-7", gridVisible && "toolbar-btn-active")}
          onClick={onToggleGrid}
          disabled={!selectedCharacter}
        >
          <Grid3X3 className="h-3 w-3" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <Button
        size="xs"
        variant="ghost"
        className="toolbar-btn text-[11px] gap-1.5 h-7"
        onClick={onRegenerate}
        disabled={!selectedCharacter}
      >
        <Sparkles className="h-3 w-3" />
        <span className="hidden sm:inline">Regenerate</span>
      </Button>
    </div>
  );
}
