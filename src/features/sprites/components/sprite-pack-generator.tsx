"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generateSpritePack } from "@/features/sprites/actions";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  User,
  Footprints,
  Zap,
  Swords,
  HeartCrack,
  Skull,
  Grid3X3,
  Minus,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import type { AnimationType, SpritePackConfig } from "@/features/sprites/types";

interface Props {
  characterId: string;
  onGenerated?: () => void;
}

const DIRECTION_LABELS: { dir: string; label: string; icon: React.ReactNode }[] = [
  { dir: "UP", label: "Up", icon: <ArrowUp className="h-3 w-3" /> },
  { dir: "DOWN", label: "Down", icon: <ArrowDown className="h-3 w-3" /> },
  { dir: "LEFT", label: "Left", icon: <ArrowLeft className="h-3 w-3" /> },
  { dir: "RIGHT", label: "Right", icon: <ArrowRight className="h-3 w-3" /> },
];

const ANIMATION_DEFS: {
  key: AnimationType;
  label: string;
  icon: React.ReactNode;
  description: string;
  defaultFrames: number;
}[] = [
  { key: "idle", label: "Idle", icon: <User className="h-5 w-5" />, description: "Standing / breathing", defaultFrames: 2 },
  { key: "walk", label: "Walk", icon: <Footprints className="h-5 w-5" />, description: "Walking cycle", defaultFrames: 4 },
  { key: "run", label: "Run", icon: <Zap className="h-5 w-5" />, description: "Running cycle", defaultFrames: 4 },
  { key: "attack", label: "Attack", icon: <Swords className="h-5 w-5" />, description: "Attack swing", defaultFrames: 4 },
  { key: "hit", label: "Hit", icon: <HeartCrack className="h-5 w-5" />, description: "Taking damage", defaultFrames: 2 },
  { key: "death", label: "Death", icon: <Skull className="h-5 w-5" />, description: "Death sequence", defaultFrames: 4 },
];

const FRAME_RANGE = { min: 2, max: 8 };

export function SpritePackGenerator({ characterId, onGenerated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<AnimationType, boolean>>({
    idle: false,
    walk: false,
    run: false,
    attack: false,
    hit: false,
    death: false,
  });
  const [frameCounts, setFrameCounts] = useState<Record<AnimationType, number>>({
    idle: 2,
    walk: 4,
    run: 4,
    attack: 4,
    hit: 2,
    death: 4,
  });
  const [activeAnim, setActiveAnim] = useState<AnimationType | null>(null);

  function toggleAnimation(key: AnimationType) {
    setSelected((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (next[key]) setActiveAnim(key);
      else if (activeAnim === key) setActiveAnim(null);
      return next;
    });
  }

  function handleFrameChange(key: AnimationType, delta: number) {
    setFrameCounts((prev) => ({
      ...prev,
      [key]: Math.min(FRAME_RANGE.max, Math.max(FRAME_RANGE.min, prev[key] + delta)),
    }));
  }

  function setFrame(key: AnimationType, value: number) {
    setFrameCounts((prev) => ({ ...prev, [key]: value }));
  }

  const selectedList = Object.entries(selected).filter(([, v]) => v);
  const selectedCount = selectedList.length;
  const totalFrames = selectedList.reduce(
    (sum, [key]) => sum + frameCounts[key as AnimationType],
    0
  );
  const totalCells = totalFrames * 4;

  async function handleGenerate() {
    const configs: SpritePackConfig[] = selectedList.map(([key]) => ({
      animation: key as AnimationType,
      frameCount: frameCounts[key as AnimationType],
    }));

    if (configs.length === 0) {
      toast.error("Select at least one animation");
      return;
    }

    setLoading(true);
    try {
      await generateSpritePack(characterId, configs);
      toast.success(`${configs.length} animation(s) queued for generation`);
      setOpen(false);
      onGenerated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate sprite pack");
    } finally {
      setLoading(false);
    }
  }

  function renderFrameGrid(frames: number) {
    const cols = frames;
    const rows = 4;
    const cells: React.ReactNode[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isActive = c < frames;
        cells.push(
          <div
            key={`${r}-${c}`}
            className={`aspect-square border transition-colors ${
              isActive
                ? "border-primary/30 bg-primary/10"
                : "border-muted-foreground/10 bg-transparent"
            }`}
          />
        );
      }
    }
    return cells;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <Package className="h-3.5 w-3.5" />
        GENERATE SPRITE PACK
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-2xl border-0 bg-[#2e2833] p-0 gap-0 overflow-hidden"
          showCloseButton={false}
        >
          <div className="editor-panel-header flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/15">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="font-mono text-sm tracking-wider text-foreground uppercase">
                  Sprite Pack Exporter
                </DialogTitle>
                <DialogDescription className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  Configure animation export for your character
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border max-h-[70vh]">
            <div className="lg:col-span-3 p-4 space-y-4 overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
                    Animation Types
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ANIMATION_DEFS.map(({ key, label, icon, description, defaultFrames }) => {
                    const isSel = selected[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAnimation(key)}
                        className={`editor-section p-3 text-left transition-all duration-150 cursor-pointer group ${
                          isSel
                            ? "ring-1 ring-primary/50 bg-primary/8 border-primary/40"
                            : "hover:bg-[#3a3341] hover:border-[#323248]"
                        } ${activeAnim === key ? "ring-1 ring-primary/40" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-1.5 rounded-md transition-colors ${
                            isSel ? "bg-primary/20 text-primary" : "bg-[#3a3341] text-muted-foreground group-hover:text-foreground"
                          }`}>
                            {icon}
                          </div>
                          {isSel && (
                            <div className="flex items-center justify-center w-4 h-4 rounded bg-primary">
                              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5L4 7L8 3" stroke="#17120D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-mono font-semibold text-foreground mb-0.5">
                          {label}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mb-1.5">
                          {description}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono text-muted-foreground uppercase">Default:</span>
                          <span className="text-[10px] font-mono font-semibold text-foreground">
                            {defaultFrames} frames
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 p-4 space-y-4 overflow-y-auto bg-[#27222a]">
              {activeAnim && selected[activeAnim] ? (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
                        Frame Count
                      </span>
                    </div>
                    <div className="editor-section p-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {ANIMATION_DEFS.find((a) => a.key === activeAnim)?.label} Frames
                        </span>
                        <span className="text-sm font-mono font-bold text-primary tabular-nums">
                          {frameCounts[activeAnim]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => handleFrameChange(activeAnim, -1)}
                          disabled={frameCounts[activeAnim] <= FRAME_RANGE.min}
                          className="flex items-center justify-center w-7 h-7 rounded-md border border-border bg-[#342e3a] text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <input
                          type="range"
                          min={FRAME_RANGE.min}
                          max={FRAME_RANGE.max}
                          value={frameCounts[activeAnim]}
                          onChange={(e) => setFrame(activeAnim, Number(e.target.value))}
                          className="flex-1 slider-track"
                        />

                        <button
                          type="button"
                          onClick={() => handleFrameChange(activeAnim, 1)}
                          disabled={frameCounts[activeAnim] >= FRAME_RANGE.max}
                          className="flex items-center justify-center w-7 h-7 rounded-md border border-border bg-[#342e3a] text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex justify-between">
                        {[2, 3, 4, 6, 8].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setFrame(activeAnim, n)}
                            className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                              frameCounts[activeAnim] === n
                                ? "bg-primary/20 text-primary border border-primary/40"
                                : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
                        Export Layout
                      </span>
                    </div>
                    <div className="editor-section p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Directions (always 4)
                        </span>
                        <div className="flex gap-1">
                          {DIRECTION_LABELS.map(({ dir, label, icon }) => (
                            <div
                              key={dir}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-primary/10 text-primary border border-primary/20"
                            >
                              {icon}
                              <span className="hidden sm:inline">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-5">
                        <div className="flex flex-col justify-around text-[9px] font-mono text-muted-foreground py-1">
                          <span>UP</span>
                          <span>DN</span>
                          <span>LT</span>
                          <span>RT</span>
                        </div>
                        <div
                          className="editor-grid grid flex-1 border border-border rounded overflow-hidden"
                          style={{
                            gridTemplateColumns: `repeat(${frameCounts[activeAnim]}, minmax(0, 1fr))`,
                            gridTemplateRows: "repeat(4, minmax(0, 1fr))",
                            aspectRatio: `${frameCounts[activeAnim]} / 4`,
                            maxHeight: "140px",
                          }}
                        >
                          {renderFrameGrid(frameCounts[activeAnim])}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-muted-foreground">
                        <span>{frameCounts[activeAnim]} frames × 4 directions</span>
                        <span>{frameCounts[activeAnim] * 4} cells</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#342e3a] flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-muted-foreground font-medium">
                      Select Animations
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono mt-1 max-w-[180px]">
                      Click an animation card to configure frame count and preview export layout
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border bg-[#252028] px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              {selectedCount > 0 ? (
                <>
                  <span>
                    <span className="text-primary font-semibold">{selectedCount}</span> animation{selectedCount > 1 ? "s" : ""} selected
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span>
                    <span className="text-foreground font-semibold">{totalCells}</span> total cells
                  </span>
                </>
              ) : (
                <span>No animations selected</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-mono border-border bg-transparent text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-[11px] font-mono bg-primary hover:bg-primary/85 text-primary-foreground border-0 gap-1.5 font-semibold tracking-wider"
                onClick={handleGenerate}
                disabled={loading || selectedCount === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    EXPORTING...
                  </>
                ) : (
                  <>
                    <Package className="h-3.5 w-3.5" />
                    EXPORT {selectedCount > 0 ? `(${selectedCount})` : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
