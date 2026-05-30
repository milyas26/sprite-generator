"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Maximize2, ImageOff, X } from "lucide-react";

interface Props {
  sheetUrl: string | null;
  characterName: string;
}

export function MasterPreview({ sheetUrl, characterName }: Props) {
  const [open, setOpen] = useState(false);

  if (!sheetUrl) {
    return (
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            Master Sheet
          </span>
        </div>
        <div className="aspect-square rounded-md border border-dashed border-border/50 bg-[#0a0a10] flex items-center justify-center">
          <ImageOff className="h-4 w-4 text-muted-foreground/15" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            Master Sheet
          </span>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-5 h-5 rounded border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            title="View full size"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-full aspect-square rounded-md border border-border/30 overflow-hidden bg-[#0a0a10] hover:border-primary/30 transition-colors cursor-pointer group relative"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sheetUrl}
            alt={`${characterName} master sheet`}
            className="w-full h-full object-contain pixelated"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Maximize2 className="h-4 w-4 text-white/0 group-hover:text-white/60 transition-all" />
          </div>
        </button>
        <p className="text-[8px] font-mono text-muted-foreground/30 mt-0.5 truncate">
          {characterName}
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="border-0 bg-[#0a0a10] p-0 gap-0 max-w-[95vw] sm:max-w-2xl max-h-[90vh] grid-rows-[auto_1fr]"
          showCloseButton={false}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <DialogTitle className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Master Sheet — {characterName}
            </DialogTitle>
            <button
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="editor-grid flex items-center justify-center overflow-auto min-h-0 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sheetUrl}
              alt={`${characterName} master sheet`}
              className="aspect-square max-w-full max-h-full object-contain pixelated"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
