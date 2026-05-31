"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createRiggedSprite } from "@/features/rigged-sprites/actions";
import { PipelineProgress } from "@/features/generation/components/pipeline-progress";
import { toast } from "sonner";
import { Puzzle, UserRound, ChevronDown, ChevronUp, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import type { POV } from "@/features/rigged-sprites/types";

const GENDERS = ["male", "female", "nonbinary"] as const;
const RACES = ["human", "elf", "dwarf", "orc", "undead", "robot", "demon", "angel", "beast", "fairy", "elemental"] as const;
const CLASSES = ["warrior", "mage", "rogue", "ranger", "paladin", "ninja", "samurai", "monk", "druid", "necromancer", "berserker", "pirate", "hunter", "cleric", "bard", "gunslinger", "engineer"] as const;
const SKIN_TONES = ["pale", "fair", "olive", "tan", "brown", "dark", "blue", "green"] as const;
const BUILDS = ["slim", "athletic", "muscular", "heavy", "petite", "stocky"] as const;
const HEIGHTS = ["short", "average", "tall"] as const;
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
          <SelectItem value="__none__" className="text-muted-foreground font-mono text-[10px] focus:bg-secondary">{'\u2014'} Any {'\u2014'}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-foreground font-mono text-[10px] focus:bg-secondary capitalize">{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function NewRiggedSpritePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [artStyle, setArtStyle] = useState("16bit");
  const [detailLevel, setDetailLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState("__none__");
  const [race, setRace] = useState("__none__");
  const [charClass, setCharClass] = useState("__none__");
  const [skinTone, setSkinTone] = useState("__none__");
  const [eyeColor, setEyeColor] = useState("__none__");
  const [build, setBuild] = useState("__none__");
  const [height, setHeight] = useState("__none__");
  const [pov, setPov] = useState("__none__");
  const [enhancing, setEnhancing] = useState(false);

  const handleReady = useCallback(() => {
    toast.success("Rigged sprite generated! Redirecting...");
    setTimeout(() => {
      router.push(`/dashboard/rigged-sprites/${characterId}`);
    }, 800);
  }, [characterId, router]);

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
      if (skinTone !== "__none__") details.skinTone = skinTone;
      if (eyeColor !== "__none__") details.eyeColor = eyeColor;
      if (build !== "__none__") details.build = build;
      if (height !== "__none__") details.height = height;
      if (pov !== "__none__") details.pov = pov;

      const result = await createRiggedSprite(
        prompt,
        artStyle,
        detailLevel,
        Object.keys(details).length > 0 ? (details as Record<string, string>) : undefined
      );
      setCharacterId(result.characterId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create rigged sprite");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/rigged-sprites" className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/50 border border-border hover:bg-secondary transition-colors">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/15">
          <Puzzle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-heading">New Rigged Sprite</h1>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Generate modular body parts for rigging</p>
        </div>
      </div>

      {characterId ? (
        <PipelineProgress characterId={characterId} onReady={handleReady} />
      ) : (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm text-foreground">Character Description</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-rigged-prompt" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Prompt</Label>
                  <button
                    type="button"
                    onClick={handleEnhance}
                    disabled={enhancing || !prompt.trim() || loading}
                    className="flex items-center gap-1 text-[9px] font-mono text-primary/70 hover:text-primary disabled:text-muted-foreground/30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    {enhancing ? "Enhancing..." : "Enhance"}
                  </button>
                </div>
                <Textarea
                  id="new-rigged-prompt"
                  placeholder='"Female cyber ninja with red ponytail and katana"'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24 bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 font-mono text-xs resize-none"
                  maxLength={2000}
                  disabled={loading}
                />
                <p className="text-[9px] text-muted-foreground text-right font-mono">{prompt.length}/2000</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="new-artStyle" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Art Style</Label>
                  <Select value={artStyle} onValueChange={(v) => v && setArtStyle(v)} disabled={loading}>
                    <SelectTrigger id="new-artStyle" size="sm" className="w-full bg-background border-border text-foreground font-mono text-[10px]">
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
                  <Label htmlFor="new-detailLevel" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Detail</Label>
                  <Select value={detailLevel} onValueChange={(v) => v && setDetailLevel(v)} disabled={loading}>
                    <SelectTrigger id="new-detailLevel" size="sm" className="w-full bg-background border-border text-foreground font-mono text-[10px]">
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
                <div className="border-t border-border pt-3 space-y-3">
                  <div>
                    <Label htmlFor="new-name" className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Name</Label>
                    <Input
                      id="new-name"
                      placeholder='"Shadow Blade"'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 font-mono text-[10px] h-7 mt-0.5"
                      maxLength={60}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <CompactSelect id="new-gender" label="Gender" value={gender} onValueChange={setGender} options={GENDERS} disabled={loading} />
                    <CompactSelect id="new-race" label="Race" value={race} onValueChange={setRace} options={RACES} disabled={loading} />
                    <CompactSelect id="new-class" label="Class" value={charClass} onValueChange={setCharClass} options={CLASSES} disabled={loading} />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <CompactSelect id="new-skinTone" label="Skin" value={skinTone} onValueChange={setSkinTone} options={SKIN_TONES} disabled={loading} />
                    <CompactSelect id="new-eyeColor" label="Eyes" value={eyeColor} onValueChange={setEyeColor} options={EYE_COLORS} disabled={loading} />
                    <CompactSelect id="new-build" label="Build" value={build} onValueChange={setBuild} options={BUILDS} disabled={loading} />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <CompactSelect id="new-height" label="Height" value={height} onValueChange={setHeight} options={HEIGHTS} disabled={loading} />
                    <CompactSelect id="new-pov" label="Point of View" value={pov} onValueChange={setPov} options={POVS} disabled={loading} />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Link href="/dashboard/rigged-sprites">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="h-7 text-[10px] font-mono border-border bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-[10px] font-mono bg-primary hover:bg-primary/85 text-primary-foreground border-0 gap-1 font-semibold"
                  disabled={loading || !prompt.trim()}
                >
                  <Puzzle className="h-3 w-3" />
                  {loading ? "GENERATING..." : "GENERATE"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
