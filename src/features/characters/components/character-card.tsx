import type { Character } from "@/features/characters/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const statusConfig: Record<string, { label: string; colors: string }> = {
  DRAFT: { label: "Draft", colors: "bg-amber-500/10 text-amber-400 border-amber-500/25" },
  DNA_READY: { label: "DNA Ready", colors: "bg-sky-500/10 text-sky-400 border-sky-500/25" },
  GENERATING: { label: "Generating", colors: "bg-primary/10 text-primary border-primary/25" },
  READY: { label: "Ready", colors: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" },
  FAILED: { label: "Failed", colors: "bg-red-500/10 text-red-400 border-red-500/25" },
};

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const status = statusConfig[character.status] || {
    label: character.status,
    colors: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Link href={`/dashboard/characters/${character.id}`}>
      <Card className="group overflow-hidden border-border bg-card card-hover py-0">
        <div className="aspect-square bg-background relative overflow-hidden workshop-grid-fine">
          {character.sheetUrl ? (
            <img
              src={character.sheetUrl}
              alt={character.name}
              className="w-full h-full object-cover pixelated group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <span className="text-muted-foreground font-mono text-2xl">?</span>
                </div>
                <span className="text-muted-foreground text-xs font-mono">
                  {character.status === "GENERATING" ? "Generating..." : "No preview"}
                </span>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className={`${status.colors} text-[10px] font-mono px-2 py-0.5 backdrop-blur-sm`}>
              {status.label}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground truncate font-heading">{character.name}</h3>
          <div className="flex flex-wrap gap-1 mt-2">
            {character.dna &&
              typeof character.dna === "object" &&
              (character.dna as any).tags?.slice(0, 3).map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] font-mono bg-secondary text-muted-foreground border-border"
                >
                  {tag}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
