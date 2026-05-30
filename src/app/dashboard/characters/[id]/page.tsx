import { getCharacter } from "@/features/characters/actions";
import { CharacterSheetViewer } from "@/features/characters/components/character-sheet-viewer";
import { SpritePackGenerator } from "@/features/characters/components/sprite-pack-generator";
import { SpritePackViewer } from "@/features/characters/components/sprite-pack-viewer";
import { DNAViewer } from "@/features/characters/components/dna-viewer";
import { DeleteCharacterButton } from "@/features/characters/components/delete-character-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, Info, Clock } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { colors: string; label: string; dot: string }> = {
  DRAFT: { colors: "text-amber-400 border-amber-500/20 bg-amber-500/5", label: "Draft", dot: "bg-amber-500" },
  DNA_READY: { colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", label: "DNA Ready", dot: "bg-sky-500" },
  GENERATING: { colors: "text-primary border-primary/20 bg-primary/5", label: "Generating", dot: "bg-primary animate-sprite-pulse" },
  READY: { colors: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", label: "Ready", dot: "bg-emerald-500" },
  FAILED: { colors: "text-red-400 border-red-500/20 bg-red-500/5", label: "Failed", dot: "bg-red-500" },
};

export default async function CharacterDetailPage({ params }: Props) {
  const { id } = await params;
  const aggregate = await getCharacter(id);

  if (!aggregate) notFound();

  const { character, assets, jobs } = aggregate as any;
  const status = statusConfig[character.status] || {
    colors: "text-muted-foreground border-border bg-transparent",
    label: character.status,
    dot: "bg-muted-foreground",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-7 h-7 rounded border border-border bg-[#1a1a28] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground font-heading truncate">{character.name}</h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold border ${status.colors}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {character.status === "READY" && <SpritePackGenerator characterId={character.id} />}
          <DeleteCharacterButton characterId={character.id} characterName={character.name} />
        </div>
      </div>

      <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Created {new Date(character.createdAt).toLocaleDateString()}
        </span>
        {character.dna && (
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            DNA extracted
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          {character.sheetUrl && (
            <Card className="border-border bg-card overflow-hidden">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">SPRITE SHEET</CardTitle>
              </div>
              <CardContent className="p-0">
                <CharacterSheetViewer imageUrl={character.sheetUrl} characterName={character.name} />
              </CardContent>
            </Card>
          )}

          <SpritePackViewer assets={assets || []} characterName={character.name} />

          {character.status === "GENERATING" && (
            <Card className="border-primary/20 bg-card">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-sprite-pulse" />
                <p className="text-xs text-accent-foreground font-mono">Generating sprite sheet... Refresh to check progress.</p>
              </CardContent>
            </Card>
          )}

          {character.status === "FAILED" && (
            <Card className="border-red-500/20 bg-card">
              <CardContent className="p-5">
                <p className="text-xs text-red-400 font-mono">Generation failed. Please try creating again.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {character.dna && (
            <Card className="border-border bg-card overflow-hidden">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Info className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">CHARACTER DNA</CardTitle>
              </div>
              <CardContent className="p-3">
                <DNAViewer dna={character.dna} />
              </CardContent>
            </Card>
          )}

          {jobs && jobs.length > 0 && (
            <Card className="border-border bg-card overflow-hidden">
              <div className="editor-panel-header flex items-center gap-2 px-4 py-2.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-foreground font-mono text-xs tracking-wider">JOB HISTORY</CardTitle>
              </div>
              <CardContent className="p-2 space-y-1">
                {jobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between text-[10px] font-mono py-1.5 px-2.5 rounded-md bg-background/40 border border-border/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="border-border bg-transparent text-muted-foreground text-[9px] flex-shrink-0 px-1.5 py-0">
                        {job.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[9px] flex-shrink-0 px-1.5 py-0 ${
                          job.status === "COMPLETED"
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                            : job.status === "FAILED"
                              ? "text-red-400 border-red-500/20 bg-red-500/5"
                              : "text-muted-foreground border-border bg-transparent"
                        }`}
                      >
                        {job.status}
                      </Badge>
                      {job.error && <span className="text-red-400/70 truncate">{job.error}</span>}
                    </div>
                    <span className="text-muted-foreground/60 flex-shrink-0 ml-2">
                      {job.completedAt
                        ? new Date(job.completedAt).toLocaleString()
                        : new Date(job.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
