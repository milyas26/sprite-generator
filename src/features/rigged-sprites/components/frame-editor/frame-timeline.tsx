"use client";

import { useState } from "react";
import {
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
  Download,
} from "lucide-react";
import type { Frame } from "./frame-editor-layout";

interface FrameTimelineProps {
  frames: Frame[];
  activeFrameId: string;
  onSelectFrame: (id: string) => void;
  onAddFrame: () => void;
  onDuplicateFrame: () => void;
  onRemoveFrame: (id: string) => void;
  onRenameFrame: (id: string, name: string) => void;
  onDurationChange: (id: string, duration: number) => void;
  onReorderFrames: (fromIndex: number, toIndex: number) => void;
  onExportGif: () => void;
}

export function FrameTimeline({
  frames,
  activeFrameId,
  onSelectFrame,
  onAddFrame,
  onDuplicateFrame,
  onRemoveFrame,
  onRenameFrame,
  onDurationChange,
  onReorderFrames,
  onExportGif,
}: FrameTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragFrom(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragFrom === null || dragFrom === index) return;
    onReorderFrames(dragFrom, index);
    setDragFrom(index);
  };

  const handleDragEnd = () => {
    setDragFrom(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-secondary/30 flex-shrink-0">
        <span className="text-[10px] font-mono font-semibold text-foreground">Frames</span>
        <span className="text-[8px] font-mono text-muted-foreground/50">
          {frames.length} frame{frames.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={onDuplicateFrame}
            className="p-1 rounded hover:bg-secondary transition-colors"
            title="Duplicate frame"
          >
            <Copy className="h-3 w-3 text-muted-foreground" />
          </button>
          <button
            onClick={onAddFrame}
            className="p-1 rounded hover:bg-secondary transition-colors"
            title="Add frame"
          >
            <Plus className="h-3 w-3 text-muted-foreground" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={onExportGif}
            className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-[9px] font-mono text-primary"
            title="Export GIF"
          >
            <Download className="h-3 w-3" />
            Export GIF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-2 py-2">
        <div className="flex gap-2 h-full items-start min-w-min">
          {frames.map((frame, index) => {
            const isActive = frame.id === activeFrameId;
            return (
              <div
                key={frame.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectFrame(frame.id)}
                className={`group relative flex-shrink-0 w-32 h-full flex flex-col rounded-md border transition-all cursor-pointer ${
                  isActive
                    ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-primary/30 hover:bg-secondary/30"
                }`}
              >
                <div className="flex items-center gap-1 px-1.5 py-1 border-b border-border/50 flex-shrink-0">
                  <GripHorizontal className="h-2.5 w-2.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  {editingId === frame.id ? (
                    <input
                      type="text"
                      value={frame.name}
                      onChange={(e) => onRenameFrame(frame.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingId(null);
                      }}
                      className="flex-1 min-w-0 h-5 px-1 rounded text-[9px] font-mono bg-secondary border border-border text-foreground focus:outline-none focus:border-primary/40"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => setEditingId(frame.id)}
                      className="flex-1 truncate text-[9px] font-mono text-foreground"
                    >
                      {frame.name}
                    </span>
                  )}
                  {frames.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFrame(frame.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/10 transition-all"
                      title="Delete frame"
                    >
                      <Trash2 className="h-2.5 w-2.5 text-red-400" />
                    </button>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center bg-[#1c1820] overflow-hidden rounded-b-md">
                  {frame.items.length > 0 ? (
                    <div className="relative w-full h-full scale-[0.15] origin-center">
                      {frame.items.slice(0, 3).map((item, i) => {
                        const hue = (i * 60) % 360;
                        return (
                          <div
                            key={item.id}
                            className="absolute border border-white/30"
                            style={{
                              left: 128 + item.x * 0.5,
                              top: 128 + item.y * 0.5,
                              width: item.width * 0.5,
                              height: item.height * 0.5,
                              backgroundColor: `hsla(${hue}, 60%, 50%, 0.3)`,
                            }}
                          />
                        );
                      })}
                      {frame.items.length > 3 && (
                        <span className="absolute bottom-0.5 right-0.5 text-[6px] text-white/40">
                          +{frame.items.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[7px] font-mono text-muted-foreground/30">Empty</span>
                  )}
                </div>

                <div className="flex items-center gap-1 px-1.5 py-1 border-t border-border/50 flex-shrink-0">
                  <span className="text-[7px] font-mono text-muted-foreground/50 w-6">Dur</span>
                  <input
                    type="number"
                    min={16}
                    max={5000}
                    step={16}
                    value={frame.duration}
                    onChange={(e) => onDurationChange(frame.id, Math.max(16, Number(e.target.value)))}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 h-5 px-1 rounded text-[9px] font-mono bg-secondary/50 border border-border/50 text-foreground focus:outline-none focus:border-primary/40 w-12"
                  />
                  <span className="text-[7px] font-mono text-muted-foreground/50">ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
