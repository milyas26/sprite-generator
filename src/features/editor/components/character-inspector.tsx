"use client";

import type { Character } from "@/features/sprites/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  User,
  Dna,
  MessageSquareText,
  Grip,
  Download,
  Sparkles,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { DeleteCharacterButton } from "@/features/sprites/components/delete-character-dialog";

const statusConfig: Record<string, { label: string; colors: string; dot: string }> = {
  DRAFT: { label: "Draft", colors: "text-amber-400 border-amber-500/20 bg-amber-500/5", dot: "bg-amber-500" },
  EXTRACTING_DNA: { label: "Extracting DNA", colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", dot: "bg-sky-500 animate-sprite-pulse" },
  DNA_READY: { label: "DNA Ready", colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", dot: "bg-sky-500" },
  GENERATING_SHEET: { label: "Generating Sheet", colors: "text-violet-400 border-violet-500/20 bg-violet-500/5", dot: "bg-violet-500 animate-sprite-pulse" },
  GENERATING: { label: "Generating", colors: "text-primary border-primary/20 bg-primary/5", dot: "bg-primary animate-sprite-pulse" },
  READY: { label: "Ready", colors: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", dot: "bg-emerald-500" },
  FAILED: { label: "Failed", colors: "text-red-400 border-red-500/20 bg-red-500/5", dot: "bg-red-500" },
};

function InspectorSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full px-3 py-1.5 text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <Icon className="h-3 w-3" />
        {title}
      </button>
      {open && <div className="px-3 pb-2 space-y-1">{children}</div>}
    </div>
  );
}

function PropertyRow({ label, value, mono = true }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[9px] font-mono text-muted-foreground/60">{label}</span>
      <span className={cn("text-[9px] text-foreground/80 text-right truncate max-w-[160px]", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}

interface CharacterInspectorProps {
  character: Character | null;
  onRegenerate: () => void;
  onExport: () => void;
}

export function CharacterInspector({
  character,
  onRegenerate,
}: CharacterInspectorProps) {
  if (!character) {
    return (
      <div className="flex flex-col h-full bg-[#0d0d14] border-l border-border">
        <div className="flex items-center px-3 h-9 border-b border-border shrink-0">
          <span className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
            Inspector
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Grip className="h-5 w-5 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-[9px] font-mono text-muted-foreground/30">
              Select a character
            </p>
          </div>
        </div>
      </div>
    );
  }

  const dna = character.dna;
  const status = statusConfig[character.status] || {
    label: character.status,
    colors: "text-muted-foreground border-border bg-transparent",
    dot: "bg-muted-foreground",
  };

  const handleExport = () => {
    if (!character.sheetUrl) return;
    const a = document.createElement("a");
    a.href = character.sheetUrl;
    a.download = `${character.name.replace(/\s+/g, "_")}_sheet.png`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d14] border-l border-border">
      <div className="flex items-center justify-between px-3 h-9 border-b border-border shrink-0">
        <span className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          Inspector
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold border",
            status.colors
          )}
        >
          <span className={cn("inline-block w-1.5 h-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <InspectorSection title="Character" icon={User}>
          <PropertyRow label="Name" value={character.name} />
          <PropertyRow label="Status" value={character.status} mono />
          {dna?.class && <PropertyRow label="Class" value={dna.class} />}
          {dna?.style?.artStyle && (
            <PropertyRow
              label="Art Style"
              value={dna.style.artStyle.toUpperCase()}
              mono
            />
          )}
          {dna?.race && <PropertyRow label="Race" value={dna.race} />}
          <PropertyRow
            label="Created"
            value={new Date(character.createdAt).toLocaleDateString()}
            mono
          />
        </InspectorSection>

        <Separator className="opacity-30 w-auto" />

        <InspectorSection title="DNA" icon={Dna} defaultOpen={false}>
          <div className="space-y-1.5">
            {dna && (
              <>
                <div className="pb-0.5">
                  <span className="text-[8px] font-mono font-semibold text-muted-foreground/40 uppercase tracking-wider">
                    Identity
                  </span>
                </div>
                <PropertyRow label="Gender" value={dna.gender} />
                <PropertyRow label="Race" value={dna.race} />
                <PropertyRow label="Class" value={dna.class} />

                <div className="pt-1 pb-0.5">
                  <span className="text-[8px] font-mono font-semibold text-muted-foreground/40 uppercase tracking-wider">
                    Physical
                  </span>
                </div>
                <PropertyRow label="Hair" value={dna.physical?.hair?.style} />
                <PropertyRow label="Hair Color" value={dna.physical?.hair?.color} />
                <PropertyRow label="Eyes" value={dna.physical?.eyes?.color} />
                <PropertyRow label="Skin Tone" value={dna.physical?.skin?.tone} />
                <PropertyRow label="Build" value={dna.physical?.build} />
                <PropertyRow label="Height" value={dna.physical?.height} />

                <div className="pt-1 pb-0.5">
                  <span className="text-[8px] font-mono font-semibold text-muted-foreground/40 uppercase tracking-wider">
                    Equipment
                  </span>
                </div>
                <PropertyRow label="Body" value={dna.equipment?.body} />
                <PropertyRow label="Legs" value={dna.equipment?.legs} />
                <PropertyRow label="Weapon" value={dna.equipment?.mainHand} />
                <PropertyRow label="Off-Hand" value={dna.equipment?.offHand} />
                <PropertyRow label="Head" value={dna.equipment?.head} />
                {dna.equipment?.accessories?.length > 0 && (
                  <PropertyRow
                    label="Accessories"
                    value={dna.equipment.accessories.join(", ")}
                  />
                )}

                <div className="pt-1 pb-0.5">
                  <span className="text-[8px] font-mono font-semibold text-muted-foreground/40 uppercase tracking-wider">
                    Style
                  </span>
                </div>
                <PropertyRow
                  label="Art Style"
                  value={dna.style?.artStyle?.toUpperCase()}
                  mono
                />
                <PropertyRow
                  label="Detail"
                  value={dna.style?.detailLevel}
                />
                <PropertyRow
                  label="POV"
                  value={dna.pov}
                />
                {dna.style?.palette?.length > 0 && (
                  <div className="pt-0.5">
                    <span className="text-[8px] font-mono text-muted-foreground/40">Palette</span>
                    <div className="flex gap-1 mt-0.5">
                      {dna.style.palette.map((color: string, i: number) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded border border-border/50"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {dna.tags?.length > 0 && (
                  <>
                    <div className="pt-1 pb-0.5">
                      <span className="text-[8px] font-mono font-semibold text-muted-foreground/40 uppercase tracking-wider">
                        Tags
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dna.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-border/40 bg-[#0a0a10] text-muted-foreground/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </InspectorSection>

        <Separator className="opacity-30 w-auto" />

        <InspectorSection title="Prompt" icon={MessageSquareText} defaultOpen={false}>
          <div className="space-y-1.5">
            <div>
              <span className="text-[8px] font-mono font-semibold text-muted-foreground/40 uppercase tracking-wider">
                User Prompt
              </span>
              <p className="text-[9px] font-mono text-foreground/70 mt-0.5 leading-relaxed bg-[#0a0a10] p-1.5 rounded border border-border/30">
                {dna?.prompt || "—"}
              </p>
            </div>
            {dna?.directions && (
              <div>
                <span className="text-[8px] font-mono font-semibold text-muted-foreground/40 uppercase tracking-wider">
                  Direction Prompts
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {Object.entries(dna.directions).map(([dir, prompt]) => (
                    <div key={dir} className="flex items-start gap-1.5">
                      <span className="text-[8px] font-mono text-muted-foreground/40 uppercase w-8 flex-shrink-0 pt-px">
                        {dir}
                      </span>
                      <p className="text-[9px] font-mono text-foreground/60 leading-relaxed">
                        {prompt || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </InspectorSection>
      </div>

      <div className="shrink-0 border-t border-border p-2 space-y-1">
        <Button
          size="xs"
          variant="ghost"
          className="w-full justify-start h-7 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-[#1a1a28] gap-1.5 opacity-50 cursor-not-allowed"
          disabled
        >
          <Copy className="h-3 w-3" />
          Duplicate
        </Button>
        <Button
          size="xs"
          variant="ghost"
          className="w-full justify-start h-7 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-[#1a1a28] gap-1.5"
          onClick={onRegenerate}
          disabled={!character}
        >
          <Sparkles className="h-3 w-3" />
          Regenerate
        </Button>
        <Button
          size="xs"
          variant="ghost"
          className="w-full justify-start h-7 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-[#1a1a28] gap-1.5"
          onClick={handleExport}
          disabled={!character?.sheetUrl}
        >
          <Download className="h-3 w-3" />
          Export PNG
        </Button>
        <DeleteCharacterButton characterId={character.id} characterName={character.name} />
      </div>
    </div>
  );
}
