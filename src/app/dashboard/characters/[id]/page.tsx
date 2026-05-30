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
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CharacterDetailPage({ params }: Props) {
  const { id } = await params;
  const aggregate = await getCharacter(id);

  if (!aggregate) notFound();

  const { character, assets, jobs } = aggregate as any;

  const statusConfig: Record<string, { colors: string; label: string }> = {
    DRAFT: { colors: "bg-amber-500/10 text-amber-400 border-amber-500/25", label: "Draft" },
    DNA_READY: { colors: "bg-sky-500/10 text-sky-400 border-sky-500/25", label: "DNA Ready" },
    GENERATING: { colors: "bg-primary/10 text-primary border-primary/25 animate-sprite-pulse", label: "Generating" },
    READY: { colors: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25", label: "Ready" },
    FAILED: { colors: "bg-red-500/10 text-red-400 border-red-500/25", label: "Failed" },
  };

  const status = statusConfig[character.status] || {
    colors: "bg-muted text-muted-foreground border-border",
    label: character.status,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Library
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">{character.name}</h1>
            <Badge variant="outline" className={`${status.colors} text-[10px] font-mono px-2 py-0.5`}>
              {status.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Created {new Date(character.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {character.status === "READY" && (
            <SpritePackGenerator characterId={character.id} />
          )}
          <DeleteCharacterButton characterId={character.id} characterName={character.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {character.sheetUrl && (
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground font-mono text-sm tracking-wider">SPRITE SHEET</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CharacterSheetViewer imageUrl={character.sheetUrl} characterName={character.name} />
              </CardContent>
            </Card>
          )}

          <SpritePackViewer assets={assets || []} characterName={character.name} />

          {character.status === "GENERATING" && (
            <Card className="border-primary/25 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-sprite-pulse" />
                  <p className="text-sm text-accent-foreground">Generating sprite sheet... Refresh to check progress.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {character.status === "FAILED" && (
            <Card className="border-red-500/25 bg-card">
              <CardContent className="p-6">
                <p className="text-sm text-red-400">Generation failed. Please try creating again.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {character.dna && (
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground font-mono text-sm tracking-wider">CHARACTER DNA</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <DNAViewer dna={character.dna} />
              </CardContent>
            </Card>
          )}

          {jobs && jobs.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground font-mono text-sm tracking-wider">JOB HISTORY</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {jobs.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between text-xs font-mono py-1.5 px-3 rounded-lg bg-background/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="border-border text-muted-foreground bg-transparent text-[10px] flex-shrink-0">
                          {job.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            job.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 text-[10px] flex-shrink-0"
                              : job.status === "FAILED"
                                ? "bg-red-500/10 text-red-400 border-red-500/25 text-[10px] flex-shrink-0"
                                : "border-border text-muted-foreground text-[10px] flex-shrink-0"
                          }
                        >
                          {job.status}
                        </Badge>
                        {job.error && (
                          <span className="text-red-400 truncate">{job.error}</span>
                        )}
                      </div>
                      <span className="text-muted-foreground flex-shrink-0 ml-2">
                        {job.completedAt
                          ? new Date(job.completedAt).toLocaleString()
                          : new Date(job.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
