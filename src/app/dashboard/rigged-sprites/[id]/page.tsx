import { getRiggedSprite } from "@/features/rigged-sprites/actions";
import { DNAViewer } from "@/features/rigged-sprites/components/dna-viewer";
import { BodyPartViewer } from "@/features/rigged-sprites/components/body-part-viewer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Puzzle,
  Activity,
  Layers,
  Wrench,
} from "lucide-react";
import { RegenerateRiggedSpriteButton } from "./regenerate-button";
import { DeleteRiggedSpriteButton } from "./delete-button";

const statusConfig: Record<string, { label: string; colors: string; dot: string }> = {
  DRAFT: { label: "Draft", colors: "text-amber-400 border-amber-500/20 bg-amber-500/5", dot: "bg-amber-500" },
  EXTRACTING_DNA: { label: "Extracting DNA", colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", dot: "bg-sky-500 animate-sprite-pulse" },
  DNA_READY: { label: "DNA Ready", colors: "text-sky-400 border-sky-500/20 bg-sky-500/5", dot: "bg-sky-500" },
  GENERATING_PARTS: { label: "Generating Parts", colors: "text-violet-400 border-violet-500/20 bg-violet-500/5", dot: "bg-violet-500 animate-sprite-pulse" },
  GENERATING: { label: "Generating", colors: "text-primary border-primary/20 bg-primary/5", dot: "bg-primary animate-sprite-pulse" },
  READY: { label: "Ready", colors: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", dot: "bg-emerald-500" },
  FAILED: { label: "Failed", colors: "text-red-400 border-red-500/20 bg-red-500/5", dot: "bg-red-500" },
};

export default async function RiggedSpriteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aggregate = await getRiggedSprite(id);
  if (!aggregate) notFound();

  const { character, assets, jobs } = aggregate;
  const status = statusConfig[character.status] || {
    label: character.status,
    colors: "text-muted-foreground border-border bg-transparent",
    dot: "bg-muted-foreground",
  };

  const dna = character.dna as Record<string, unknown> | null;
  const createdAt = new Date(character.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/rigged-sprites"
            className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/50 border border-border hover:bg-secondary transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/15 flex-shrink-0">
            <Puzzle className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-foreground font-heading truncate">
              {character.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-semibold border ${status.colors}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="text-[9px] text-muted-foreground font-mono flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" />
                {createdAt}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {character.status === "READY" && (
            <>
              <Link
                href={`/dashboard/rigged-sprites/${character.id}/editor`}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[10px] font-mono font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
              >
                <Wrench className="h-3 w-3" />
                Edit Rigging
              </Link>
              <RegenerateRiggedSpriteButton characterId={character.id} />
            </>
          )}
          <DeleteRiggedSpriteButton characterId={character.id} characterName={character.name} />
        </div>
      </div>

      {dna && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <BodyPartViewer assets={assets} />
          </div>
          <div className="space-y-5">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-sm text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Character DNA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DNAViewer dna={dna} />
              </CardContent>
            </Card>

            {jobs.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-mono text-sm text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Job History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {jobs.map((job: { id: string; type: string; status: string; error: string | null }) => (
                      <div
                        key={job.id}
                        className="flex items-center gap-2 text-xs font-mono border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            job.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : job.status === "FAILED"
                                ? "bg-red-500/10 text-red-400 border-red-500/25"
                                : job.status === "PROCESSING"
                                  ? "bg-primary/10 text-primary border-primary/25"
                                  : "bg-secondary/50 text-muted-foreground border-border"
                          }`}
                        >
                          {job.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            job.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : job.status === "FAILED"
                                ? "bg-red-500/10 text-red-400 border-red-500/25"
                                : "border-border text-muted-foreground bg-transparent"
                          }`}
                        >
                          {job.status}
                        </Badge>
                        {job.error && (
                          <span className="text-[9px] text-red-400/70 truncate ml-auto">{job.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {!dna && (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <Puzzle className="h-12 w-12 text-muted-foreground/25 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-mono">Waiting for DNA extraction...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
