import type { Character } from "@/features/sprites/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const statusConfig: Record<string, { label: string; colors: string; dot: string }> = {
  DRAFT: { label: "Draft", colors: "text-amber-400 border-amber-500/20 bg-amber-500/5", dot: "bg-amber-500" },
  EXTRACTING_DNA: { label: "Extracting DNA", colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", dot: "bg-sky-500 animate-sprite-pulse" },
  DNA_READY: { label: "DNA Ready", colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", dot: "bg-sky-500" },
  GENERATING_SHEET: { label: "Generating Sheet", colors: "text-violet-400 border-violet-500/20 bg-violet-500/5", dot: "bg-violet-500 animate-sprite-pulse" },
  GENERATING: { label: "Generating", colors: "text-primary border-primary/20 bg-primary/5", dot: "bg-primary animate-sprite-pulse" },
  READY: { label: "Ready", colors: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", dot: "bg-emerald-500" },
  FAILED: { label: "Failed", colors: "text-red-400 border-red-500/20 bg-red-500/5", dot: "bg-red-500" },
};

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const status = statusConfig[character.status] || {
    label: character.status,
    colors: "text-muted-foreground border-border bg-transparent",
    dot: "bg-muted-foreground",
  };

  return (
    <Link href={`/dashboard/editor?select=${character.id}`}>
      <Card className="group overflow-hidden border-border bg-card card-hover py-0">
        <div className="aspect-square bg-[#0c0c12] relative overflow-hidden editor-grid-sm">
          {character.sheetUrl ? (
            <img
              src={character.sheetUrl}
              alt={character.name}
              className="w-full h-full object-cover pixelated group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-2.5 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <span className="text-muted-foreground font-mono text-xl">?</span>
                </div>
                <span className="text-muted-foreground text-[10px] font-mono">
                  {character.status === "GENERATING" ? "Generating..." : "No preview"}
                </span>
              </div>
            </div>
          )}
          <div className="absolute top-2.5 right-2.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-semibold border ${status.colors} backdrop-blur-sm`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>
        <CardContent className="p-3.5">
          <h3 className="font-semibold text-foreground truncate font-mono text-[13px]">{character.name}</h3>
          <div className="flex flex-wrap gap-1 mt-2">
            {character.dna &&
              typeof character.dna === "object" &&
              (character.dna as any).tags?.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-border bg-secondary/50 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
