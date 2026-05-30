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
import { createAsset } from "@/features/assets/actions";
import { PipelineProgress } from "@/features/generation/components/pipeline-progress";
import { ASSET_CATEGORIES } from "@/features/assets/types";
import { toast } from "sonner";
import { Palette, Boxes, ChevronDown, ChevronUp } from "lucide-react";

interface CreateAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAssetDialog({ open, onOpenChange }: CreateAssetDialogProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("TILE");
  const [artStyle, setArtStyle] = useState("16bit");
  const [detailLevel, setDetailLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [name, setName] = useState("");
  const [pov, setPov] = useState("__none__");

  const handleReady = useCallback(() => {
    toast.success("Asset generated!");
    setTimeout(() => {
      router.push(`/dashboard/assets`);
      onOpenChange(false);
    }, 800);
  }, [router, onOpenChange]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const details: Record<string, string> = {};
      if (name.trim()) details.name = name.trim();
      if (pov !== "__none__") details.pov = pov;

      const result = await createAsset(prompt, category as any, artStyle, detailLevel,
        Object.keys(details).length > 0 ? (details as { name?: string; pov?: any }) : undefined
      );
      setAssetId(result.assetId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create asset");
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onOpenChange(false);
    setPrompt("");
    setCategory("TILE");
    setArtStyle("16bit");
    setDetailLevel("medium");
    setLoading(false);
    setAssetId(null);
    setShowDetails(false);
    setName("");
    setPov("__none__");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg border-0 bg-[#14141c] p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center gap-2.5 px-4 py-3 border-b border-border bg-[#0f0f16]">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 border border-primary/15">
            <Boxes className="h-3 w-3 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="font-mono text-xs text-foreground uppercase tracking-wider">
              Create Asset
            </DialogTitle>
            <DialogDescription className="text-[9px] text-muted-foreground font-mono mt-0.5">
              Describe a game asset, AI generates a pixel art sprite sheet
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

        {assetId ? (
          <div className="p-4 max-h-[65vh] overflow-y-auto">
            <PipelineProgress characterId={assetId} onReady={handleReady} type="asset" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="asset-prompt" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Prompt</Label>
              <Textarea
                id="asset-prompt"
                placeholder='"Stone dungeon wall with moss and cracks"'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-20 bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 font-mono text-xs resize-none"
                maxLength={500}
                disabled={loading}
              />
              <p className="text-[9px] text-muted-foreground text-right font-mono">{prompt.length}/500</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="asset-category" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Category</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)} disabled={loading}>
                <SelectTrigger id="asset-category" size="sm" className="w-full bg-background border-border text-foreground font-mono text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-56">
                  {ASSET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category} className="text-foreground font-mono text-[10px] focus:bg-secondary">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">{cat.label}</span>
                        <span className="text-muted-foreground font-normal text-[9px]">{cat.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="asset-artStyle" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Art Style</Label>
                <Select value={artStyle} onValueChange={(v) => v && setArtStyle(v)} disabled={loading}>
                  <SelectTrigger id="asset-artStyle" size="sm" className="w-full bg-background border-border text-foreground font-mono text-[10px]">
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
                <Label htmlFor="asset-detailLevel" className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Detail</Label>
                <Select value={detailLevel} onValueChange={(v) => v && setDetailLevel(v)} disabled={loading}>
                  <SelectTrigger id="asset-detailLevel" size="sm" className="w-full bg-background border-border text-foreground font-mono text-[10px]">
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
              <Boxes className="h-3 w-3" />
              Asset Details
              <span className="text-[9px] text-muted-foreground/50 ml-1">optional</span>
              <span className="ml-auto">
                {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </span>
            </button>

            {showDetails && (
              <div className="border-t border-border pt-3 space-y-2.5">
                <div>
                  <Label htmlFor="asset-name" className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Name</Label>
                  <Input
                    id="asset-name"
                    placeholder='"Stone Wall"'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 font-mono text-[10px] h-7 mt-0.5"
                    maxLength={60}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-0.5">
                    <Label htmlFor="asset-pov" className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">Point of View</Label>
                    <Select value={pov} onValueChange={(v) => v && setPov(v)} disabled={loading}>
                      <SelectTrigger id="asset-pov" size="sm" className="w-full bg-background border-border text-foreground font-mono text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="__none__" className="text-muted-foreground font-mono text-[10px] focus:bg-secondary">— Any —</SelectItem>
                        <SelectItem value="top-down" className="text-foreground font-mono text-[10px] focus:bg-secondary capitalize">Top-Down</SelectItem>
                        <SelectItem value="side-scroller" className="text-foreground font-mono text-[10px] focus:bg-secondary capitalize">Side-Scroller</SelectItem>
                        <SelectItem value="isometric" className="text-foreground font-mono text-[10px] focus:bg-secondary capitalize">Isometric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
