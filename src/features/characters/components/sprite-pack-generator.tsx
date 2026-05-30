"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { generateSpritePack } from "@/features/characters/actions";
import { toast } from "sonner";
import { Loader2, Wand2, Film } from "lucide-react";
import type { AnimationType, SpritePackConfig } from "@/features/characters/types";

interface Props {
  characterId: string;
  onGenerated?: () => void;
}

const ANIMATION_OPTIONS: { key: AnimationType; label: string; icon: string }[] = [
  { key: "idle", label: "Idle", icon: "🧍" },
  { key: "walk", label: "Walk", icon: "🚶" },
  { key: "run", label: "Run", icon: "🏃" },
  { key: "attack", label: "Attack", icon: "⚔️" },
  { key: "hit", label: "Hit (Hurt)", icon: "💥" },
  { key: "death", label: "Death", icon: "💀" },
];

const FRAME_OPTIONS = [2, 3, 4, 6];

function getDefaultFrameCount(animation: AnimationType): number {
  if (animation === "idle" || animation === "hit") return 2;
  if (animation === "death") return 4;
  return 4;
}

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

  function toggleAnimation(key: AnimationType) {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setFrameCount(key: AnimationType, count: number) {
    setFrameCounts((prev) => ({ ...prev, [key]: count }));
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  async function handleGenerate() {
    const configs: SpritePackConfig[] = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([key]) => ({
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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <Film className="h-3.5 w-3.5" />
        GENERATE SPRITE PACK
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading text-base">
              Generate Sprite Pack
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs font-mono">
              Generate animation frames for selected animation types. Each animation creates a
              4-direction grid (UP/DOWN/LEFT/RIGHT) with multiple frames per direction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {ANIMATION_OPTIONS.map(({ key, label, icon }) => (
              <div
                key={key}
                className={`rounded-lg border p-3 transition-colors cursor-pointer ${
                  selected[key]
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-background/50 hover:border-border/80"
                }`}
                onClick={() => toggleAnimation(key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{icon}</span>
                    <span className="text-xs font-mono font-medium text-foreground">{label}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      selected[key]
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30 bg-transparent"
                    }`}
                  >
                    {selected[key] && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>

                {selected[key] && (
                  <div className="flex items-center gap-2 pl-7">
                    <span className="text-[10px] text-muted-foreground font-mono">FRAMES:</span>
                    <div className="flex gap-1">
                      {FRAME_OPTIONS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                            frameCounts[key] === n
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFrameCount(key, n);
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <DialogFooter showCloseButton>
            <Button
              className="w-full bg-primary hover:bg-primary/85 text-primary-foreground border-0 font-heading font-semibold text-sm h-10 gap-1.5"
              onClick={handleGenerate}
              disabled={loading || selectedCount === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" />
                  GENERATE {selectedCount > 0 ? `(${selectedCount})` : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
