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
    <div className="flex gap-6 items-start">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">New Character</h1>
          <p className="text-muted-foreground text-sm mt-1">Describe your character and AI generates a 4-direction sprite sheet</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground font-heading text-lg">Character Prompt</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">Be specific about appearance, equipment, and style</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-secondary-foreground font-mono text-xs tracking-wider">PROMPT</Label>
                <Textarea
                  id="prompt"
                  placeholder='"Female cyber ninja with red ponytail and katana"'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-28 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 font-mono text-sm resize-none"
                  maxLength={500}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground text-right font-mono">{prompt.length}/500</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="artStyle" className="text-secondary-foreground font-mono text-xs tracking-wider">ART STYLE</Label>
                  <Select value={artStyle} onValueChange={(v) => v && setArtStyle(v)} disabled={loading}>
                    <SelectTrigger id="artStyle" className="bg-background border-border text-foreground font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="16bit" className="text-foreground font-mono focus:bg-secondary">16-bit (SNES/GBA)</SelectItem>
                      <SelectItem value="32bit" className="text-foreground font-mono focus:bg-secondary">32-bit (PS1)</SelectItem>
                      <SelectItem value="gbc" className="text-foreground font-mono focus:bg-secondary">Game Boy Color</SelectItem>
                      <SelectItem value="nes" className="text-foreground font-mono focus:bg-secondary">NES / 8-bit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detailLevel" className="text-secondary-foreground font-mono text-xs tracking-wider">DETAIL LEVEL</Label>
                  <Select value={detailLevel} onValueChange={(v) => v && setDetailLevel(v)} disabled={loading}>
                    <SelectTrigger id="detailLevel" className="bg-background border-border text-foreground font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="low" className="text-foreground font-mono focus:bg-secondary">Low (simple)</SelectItem>
                      <SelectItem value="medium" className="text-foreground font-mono focus:bg-secondary">Medium</SelectItem>
                      <SelectItem value="high" className="text-foreground font-mono focus:bg-secondary">High (detailed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/85 text-primary-foreground border-0 font-heading font-semibold text-sm h-11 shadow-sm shadow-primary/15"
                disabled={loading || !prompt.trim()}
              >
                {loading ? "GENERATING..." : "GENERATE SPRITE SHEET"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {characterId && (
        <div className="w-80 flex-shrink-0 sticky top-8">
          <PipelineProgress characterId={characterId} onReady={handleReady} />
        </div>
      )}
    </div>
  );
}
