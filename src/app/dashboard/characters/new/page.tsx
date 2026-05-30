"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCharacter } from "@/features/characters/actions";
import { PipelineProgress } from "@/features/generation/components/pipeline-progress";
import { toast } from "sonner";
import { PlusCircle, Palette, SlidersHorizontal } from "lucide-react";

export default function CreateCharacterPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [artStyle, setArtStyle] = useState("16bit");
  const [detailLevel, setDetailLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [characterId, setCharacterId] = useState<string | null>(null);

  const handleReady = useCallback(() => {
    toast.success("Sprite sheet ready!");
    setTimeout(() => router.push(`/dashboard/characters/${characterId}`), 800);
  }, [characterId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await createCharacter(prompt, artStyle, detailLevel);
      setCharacterId(result.characterId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create character");
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
            <h1 className="text-lg font-bold tracking-tight text-foreground font-heading">New Character</h1>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Describe your character — AI generates a 4-direction sprite sheet</p>
          </div>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
            <Palette className="h-3.5 w-3.5 text-primary" />
            <CardTitle className="text-foreground font-mono text-xs tracking-wider">CHARACTER PROMPT</CardTitle>
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

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/85 text-primary-foreground border-0 font-heading font-semibold text-[13px] h-10 shadow-sm shadow-primary/10 gap-1.5"
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
