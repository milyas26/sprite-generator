"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCharacter } from "@/features/sprites/actions";
import { PipelineProgress } from "@/features/generation/components/pipeline-progress";
import { toast } from "sonner";
import { PlusCircle, Palette, UserRound } from "lucide-react";
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

function OptionalSelect({ id, label, value, onValueChange, options, disabled }: {
  id: string;
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: readonly string[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">{label}</Label>
      <Select value={value} onValueChange={(v) => v && onValueChange(v)} disabled={disabled}>
        <SelectTrigger id={id} className="bg-background border-border text-foreground font-mono text-[11px] h-7">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-48">
          <SelectItem value="__none__" className="text-muted-foreground font-mono text-[11px] focus:bg-secondary">— Any —</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-foreground font-mono text-[11px] focus:bg-secondary capitalize">{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function CreateCharacterPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [artStyle, setArtStyle] = useState("16bit");
  const [detailLevel, setDetailLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [characterId, setCharacterId] = useState<string | null>(null);

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
    setTimeout(() => router.push(`/dashboard/sprites/${characterId}`), 800);
  }, [characterId, router]);

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

  return (
    <div className="flex gap-5 items-start">
      <div className="flex-1 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/15">
            <PlusCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground font-heading">New Sprite</h1>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Describe your sprite — AI generates a 4-direction sprite sheet</p>
          </div>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
            <Palette className="h-3.5 w-3.5 text-primary" />
            <CardTitle className="text-foreground font-mono text-xs tracking-wider">SPRITE PROMPT</CardTitle>
          </div>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="prompt" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder='"Female cyber ninja with red ponytail and katana"'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-28 bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 font-mono text-sm resize-none"
                  maxLength={500}
                  disabled={loading}
                />
                <p className="text-[10px] text-muted-foreground text-right font-mono">{prompt.length}/500</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="artStyle" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Art Style</Label>
                  <Select value={artStyle} onValueChange={(v) => v && setArtStyle(v)} disabled={loading}>
                    <SelectTrigger id="artStyle" className="bg-background border-border text-foreground font-mono text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="16bit" className="text-foreground font-mono text-xs focus:bg-secondary">16-bit (SNES/GBA)</SelectItem>
                      <SelectItem value="32bit" className="text-foreground font-mono text-xs focus:bg-secondary">32-bit (PS1)</SelectItem>
                      <SelectItem value="gbc" className="text-foreground font-mono text-xs focus:bg-secondary">Game Boy Color</SelectItem>
                      <SelectItem value="nes" className="text-foreground font-mono text-xs focus:bg-secondary">NES / 8-bit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detailLevel" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Detail Level</Label>
                  <Select value={detailLevel} onValueChange={(v) => v && setDetailLevel(v)} disabled={loading}>
                    <SelectTrigger id="detailLevel" className="bg-background border-border text-foreground font-mono text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="low" className="text-foreground font-mono text-xs focus:bg-secondary">Low (simple)</SelectItem>
                      <SelectItem value="medium" className="text-foreground font-mono text-xs focus:bg-secondary">Medium</SelectItem>
                      <SelectItem value="high" className="text-foreground font-mono text-xs focus:bg-secondary">High (detailed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <div className="editor-panel-header flex items-center gap-2 px-3 py-2 -mx-3 rounded-md mb-3">
                  <UserRound className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-foreground font-mono text-xs tracking-wider">SPRITE DETAILS</h3>
                  <span className="text-[9px] text-muted-foreground font-mono ml-auto">optional</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="charName" className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Name</Label>
                    <Input
                      id="charName"
                      placeholder='"Shadow Blade"'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 font-mono text-xs h-7 mt-1"
                      maxLength={60}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <OptionalSelect id="gender" label="Gender" value={gender} onValueChange={setGender} options={GENDERS} disabled={loading} />
                    <OptionalSelect id="race" label="Race" value={race} onValueChange={setRace} options={RACES} disabled={loading} />
                    <OptionalSelect id="class" label="Class" value={charClass} onValueChange={setCharClass} options={CLASSES} disabled={loading} />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <OptionalSelect id="hairStyle" label="Hair Style" value={hairStyle} onValueChange={setHairStyle} options={HAIR_STYLES} disabled={loading} />
                    <OptionalSelect id="hairColor" label="Hair Color" value={hairColor} onValueChange={setHairColor} options={HAIR_COLORS} disabled={loading} />
                    <OptionalSelect id="skinTone" label="Skin Tone" value={skinTone} onValueChange={setSkinTone} options={SKIN_TONES} disabled={loading} />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <OptionalSelect id="eyeColor" label="Eye Color" value={eyeColor} onValueChange={setEyeColor} options={EYE_COLORS} disabled={loading} />
                    <OptionalSelect id="build" label="Build" value={build} onValueChange={setBuild} options={BUILDS} disabled={loading} />
                    <OptionalSelect id="height" label="Height" value={height} onValueChange={setHeight} options={HEIGHTS} disabled={loading} />
                  </div>

                  <div className="grid grid-cols-1">
                    <OptionalSelect id="pov" label="Point of View" value={pov} onValueChange={setPov} options={POVS} disabled={loading} />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/85 text-primary-foreground border-0 font-heading font-semibold text-[13px] h-10 shadow-sm shadow-primary/10 gap-1.5 mt-4"
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
                  <>GENERATING...</>
                ) : (
                  <>
                    <Palette className="h-3.5 w-3.5" />
                    GENERATE SPRITE SHEET
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {characterId && (
        <div className="w-80 flex-shrink-0 sticky top-5">
          <PipelineProgress characterId={characterId} onReady={handleReady} />
        </div>
      )}
    </div>
  );
}
