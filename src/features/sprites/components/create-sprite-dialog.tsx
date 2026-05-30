"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createCharacter } from "@/features/sprites/actions";
import { PipelineProgress } from "@/features/generation/components/pipeline-progress";
import { toast } from "sonner";
import { Palette, UserRound, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { POV } from "@/features/sprites/types";

const GENDERS = ["male", "female", "nonbinary"] as const;
const RACES = ["human", "elf", "dwarf", "orc", "undead", "robot", "demon", "angel", "beast", "fairy", "elemental"] as const;
const CLASSES = ["warrior", "mage", "rogue", "ranger", "paladin", "ninja", "samurai", "monk", "druid", "necromancer", "berserker", "pirate", "hunter", "cleric", "bard", "gunslinger", "engineer"] as const;
const SKIN_TONES = ["pale", "fair", "olive", "tan", "brown", "dark", "blue", "green"] as const;
const BUILDS = ["slim", "athletic", "muscular", "heavy", "petite", "stocky"] as const;
const HEIGHTS = ["short", "average", "tall"] as const;
const HAIR_STYLES = ["short", "long", "ponytail", "braided", "buzz", "mohawk", "bun", "bald", "wavy", "curly", "spiky"] as const;
const HAIR_COLORS = ["black", "brown", "blonde", "red", "white", "gray", "blue", "green", "pink", "purple", "silver"] as const;
const EYE_COLORS = ["brown", "blue", "green", "gray", "amber", "red", "purple", "black", "hazel"] as const;
const POVS: POV[] = ["top-down", "side-scroller", "isometric"];

function CompactSelect({ id, label, value, onValueChange, options, disabled }: {
  id: string;
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: readonly string[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <Label htmlFor={id} className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">{label}</Label>
      <Select value={value} onValueChange={(v) => v && onValueChange(v)} disabled={disabled}>
        <SelectTrigger id={id} size="sm" className="w-full bg-background border-border text-foreground font-mono text-[10px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-44">
          <SelectItem value="__none__" className="text-muted-foreground font-mono text-[10px] focus:bg-secondary">— Any —</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-foreground font-mono text-[10px] focus:bg-secondary capitalize">{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface CreateSpriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpriteDialog({ open, onOpenChange }: CreateSpriteDialogProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [artStyle, setArtStyle] = useState("16bit");
  const [detailLevel, setDetailLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState("__none__");
  const [race, setRace] = useState("__none__");
  const [charClass, setCharClass] = useState("__none__");
  const [hairStyle, setHairStyle] = useState("__none__");
  const [hairColor, setHairColor] = useState("__none__");
  const [skinTone, setSkinTone] = useState("__none__");
  const [eyeColor, setEyeColor] = useState("__none__");
  const [build, setBuild] = useState("__none__");
  const [height, setHeight] = useState("__none__");
  const [pov, setPov] = useState("__none__");

  const handleReady = useCallback(() => {
    toast.success("Sprite sheet ready!");
    setTimeout(() => {
      router.push(`/dashboard/sprites/${characterId}`);
      onOpenChange(false);
    }, 800);
  }, [characterId, router, onOpenChange]);

  async function handleEnhance() {
    if (!prompt.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Enhance failed");
      }
      const { enhanced } = await res.json();
      setPrompt(enhanced);
      toast.success("Prompt enhanced");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enhance prompt");
    } finally {
      setEnhancing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const details: Record<string, string> = {};
      if (name.trim()) details.name = name.trim();
      if (gender !== "__none__") details.gender = gender;
      if (race !== "__none__") details.race = race;
      if (charClass !== "__none__") details.class = charClass;
      if (hairStyle !== "__none__") details.hairStyle = hairStyle;
      if (hairColor !== "__none__") details.hairColor = hairColor;
      if (skinTone !== "__none__") details.skinTone = skinTone;
      if (eyeColor !== "__none__") details.eyeColor = eyeColor;
      if (build !== "__none__") details.build = build;
      if (height !== "__none__") details.height = height;
      if (pov !== "__none__") details.pov = pov;

      const result = await createCharacter(
        prompt,
        artStyle,
        detailLevel,
        Object.keys(details).length > 0 ? (details as Record<string, string>) : undefined
      );
      setCharacterId(result.characterId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create sprite");
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onOpenChange(false);
    setPrompt("");
    setArtStyle("16bit");
    setDetailLevel("medium");
    setLoading(false);
    setCharacterId(null);
    setShowDetails(false);
    setEnhancing(false);
    setName("");
    setGender("__none__");
    setRace("__none__");
    setCharClass("__none__");
    setHairStyle("__none__");
    setHairColor("__none__");
    setSkinTone("__none__");
    setEyeColor("__none__");
    setBuild("__none__");
    setHeight("__none__");
    setPov("__none__");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg border-0 bg-[#2e2833] p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center gap-2.5 px-4 py-3 border-b border-border bg-[#252028]">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 border border-primary/15">
            <Palette className="h-3 w-3 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="font-mono text-xs text-foreground uppercase tracking-wider">
              Create Sprite
            </DialogTitle>
            <DialogDescription className="text-[9px] text-muted-foreground font-mono mt-0.5">
              Describe your character, AI generates a 4-direction sprite sheet
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">Close</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </DialogHeader>

        {characterId ? (
          <div className="p-4 max-h-[65vh] overflow-y-auto">
            <PipelineProgress characterId={characterId} onReady={handleReady} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="sprite-prompt" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Prompt</Label>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={enhancing || !prompt.trim()}
                  className="flex items-center gap-1 text-[9px] font-mono text-primary/70 hover:text-primary disabled:text-muted-foreground/30 disabled:cursor-not-allowed transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  {enhancing ? "Enhancing..." : "Enhance"}
                </button>
              </div>
              <Textarea
                id="sprite-prompt"
                placeholder='"Female cyber ninja with red ponytail and katana"'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-20 bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 font-mono text-xs resize-none"
                maxLength={2000}
                disabled={loading}
              />
              <p className="text-[9px] text-muted-foreground text-right font-mono">{prompt.length}/2000</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="sprite-artStyle" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Art Style</Label>
                <Select value={artStyle} onValueChange={(v) => v && setArtStyle(v)} disabled={loading}>
                  <SelectTrigger id="sprite-artStyle" size="sm" className="w-full bg-background border-border text-foreground font-mono text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="16bit" className="text-foreground font-mono text-[10px] focus:bg-secondary">16-bit (SNES/GBA)</SelectItem>
                    <SelectItem value="32bit" className="text-foreground font-mono text-[10px] focus:bg-secondary">32-bit (PS1)</SelectItem>
                    <SelectItem value="gbc" className="text-foreground font-mono text-[10px] focus:bg-secondary">Game Boy Color</SelectItem>
                    <SelectItem value="nes" className="text-foreground font-mono text-[10px] focus:bg-secondary">NES / 8-bit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="sprite-detailLevel" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Detail</Label>
                <Select value={detailLevel} onValueChange={(v) => v && setDetailLevel(v)} disabled={loading}>
                  <SelectTrigger id="sprite-detailLevel" size="sm" className="w-full bg-background border-border text-foreground font-mono text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="low" className="text-foreground font-mono text-[10px] focus:bg-secondary">Low (simple)</SelectItem>
                    <SelectItem value="medium" className="text-foreground font-mono text-[10px] focus:bg-secondary">Medium</SelectItem>
                    <SelectItem value="high" className="text-foreground font-mono text-[10px] focus:bg-secondary">High (detailed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center gap-1.5 text-[10px] font-mono font-semibold text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <UserRound className="h-3 w-3" />
              Character Details
              <span className="text-[9px] text-muted-foreground/50 ml-1">optional</span>
              <span className="ml-auto">
                {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </span>
            </button>

            {showDetails && (
              <div className="border-t border-border pt-3 space-y-2.5">
                <div>
                  <Label htmlFor="sprite-name" className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Name</Label>
                  <Input
                    id="sprite-name"
                    placeholder='"Shadow Blade"'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 font-mono text-[10px] h-7 mt-0.5"
                    maxLength={60}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <CompactSelect id="sprite-gender" label="Gender" value={gender} onValueChange={setGender} options={GENDERS} disabled={loading} />
                  <CompactSelect id="sprite-race" label="Race" value={race} onValueChange={setRace} options={RACES} disabled={loading} />
                  <CompactSelect id="sprite-class" label="Class" value={charClass} onValueChange={setCharClass} options={CLASSES} disabled={loading} />
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <CompactSelect id="sprite-hairStyle" label="Hair" value={hairStyle} onValueChange={setHairStyle} options={HAIR_STYLES} disabled={loading} />
                  <CompactSelect id="sprite-hairColor" label="Hair Color" value={hairColor} onValueChange={setHairColor} options={HAIR_COLORS} disabled={loading} />
                  <CompactSelect id="sprite-skinTone" label="Skin" value={skinTone} onValueChange={setSkinTone} options={SKIN_TONES} disabled={loading} />
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <CompactSelect id="sprite-eyeColor" label="Eyes" value={eyeColor} onValueChange={setEyeColor} options={EYE_COLORS} disabled={loading} />
                  <CompactSelect id="sprite-build" label="Build" value={build} onValueChange={setBuild} options={BUILDS} disabled={loading} />
                  <CompactSelect id="sprite-height" label="Height" value={height} onValueChange={setHeight} options={HEIGHTS} disabled={loading} />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <CompactSelect id="sprite-pov" label="Point of View" value={pov} onValueChange={setPov} options={POVS} disabled={loading} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={loading}
                className="h-7 text-[10px] font-mono border-border bg-transparent text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-7 text-[10px] font-mono bg-primary hover:bg-primary/85 text-primary-foreground border-0 gap-1 font-semibold"
                disabled={loading || !prompt.trim()}
              >
                <Palette className="h-3 w-3" />
                {loading ? "GENERATING..." : "GENERATE"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
