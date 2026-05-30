"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { retryFailedJob } from "@/features/generation/actions";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Circle, XCircle, Clock, Cpu, RotateCw } from "lucide-react";

interface JobData {
  id: string;
  type: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  error: string | null;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

interface Props {
  characterId: string;
  onReady?: () => void;
}

const jobLabels: Record<string, string> = {
  DNA_EXTRACTION: "Extracting Character DNA",
  SHEET_GENERATION: "Generating Sprite Sheet",
  COMPOSITE: "Full Generation Pipeline",
  SPRITE_PACK: "Sprite Pack Generation",
};

const jobDescriptions: Record<string, string> = {
  DNA_EXTRACTION: "GPT-4o analyzing and structuring design",
  SHEET_GENERATION: "DALL-E rendering pixel art sheet",
  COMPOSITE: "DNA extraction, sprite rendering",
  SPRITE_PACK: "Generating animation frames",
};

function getNow() {
  return Date.now();
}

export function PipelineProgress({ characterId, onReady }: Props) {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [characterStatus, setCharacterStatus] = useState<string>("DRAFT");
  const [retrying, setRetrying] = useState<string | null>(null);
  const startTimeRef = useRef<number>(getNow());
  const [elapsed, setElapsed] = useState(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((getNow() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`/api/characters/${characterId}`);
      if (!res.ok) return;

      const data = await res.json();
      const char = data;
      const rawJobs: JobData[] = char?.jobs ?? data?.jobs ?? [];

      setCharacterStatus(char.status ?? char.character?.status ?? "DRAFT");
      setJobs(rawJobs);

      if (char.status === "READY" || char.character?.status === "READY") {
        onReady?.();
      }
    } catch {
      // silently ignore fetch errors
    }
  }, [characterId, onReady]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchJobs();
    }
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  async function handleRetry(jobId: string) {
    setRetrying(jobId);
    try {
      await retryFailedJob(jobId);
      toast.success("Job re-queued for processing");
      startTimeRef.current = getNow();
      setElapsed(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Retry failed");
    } finally {
      setRetrying(null);
    }
  }

  function formatElapsed(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const isDone = characterStatus === "READY";
  const hasFailed = jobs.some((j) => j.status === "FAILED");

  return (
    <Card
      className={
        hasFailed
          ? "border-red-500/25 bg-card"
          : isDone
            ? "border-emerald-500/25 bg-card"
            : "border-primary/25 bg-card"
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground font-mono text-sm tracking-wider">
            {hasFailed ? "GENERATION FAILED" : isDone ? "COMPLETED" : "LIVE STATUS"}
          </CardTitle>
          {!isDone && !hasFailed && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {formatElapsed(elapsed)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isDone && !hasFailed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-background/50 border border-border/50">
            <Cpu className="h-4 w-4 text-primary animate-sprite-pulse flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-foreground font-medium truncate">Processing</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">
                {characterStatus === "DRAFT" ? "Queueing generation job" : "Running pipeline"}
              </p>
            </div>
          </div>
        )}

        {isDone && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-400">Sprite sheet generated successfully</p>
          </div>
        )}

        <div className="space-y-0.5">
          {jobs.map((job) => {
            const isProcessing = job.status === "PROCESSING";
            const isCompleted = job.status === "COMPLETED";
            const isFailed = job.status === "FAILED";
            const isPending = job.status === "PENDING";

            return (
              <div
                key={job.id}
                className={`rounded-md px-3 py-2 transition-colors ${
                  isProcessing ? "bg-primary/5" : ""
                } ${isFailed ? "bg-red-500/5" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    ) : isProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 text-primary animate-spin flex-shrink-0" />
                    ) : isFailed ? (
                      <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span
                      className={`text-xs font-mono truncate ${
                        isCompleted
                          ? "text-muted-foreground"
                          : isFailed
                            ? "text-red-400"
                            : "text-foreground"
                      }`}
                    >
                      {jobLabels[job.type] || job.type}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] flex-shrink-0 ml-2 ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        : isFailed
                          ? "bg-red-500/10 text-red-400 border-red-500/25"
                          : isProcessing
                            ? "bg-primary/10 text-primary border-primary/25"
                            : "border-border text-muted-foreground bg-transparent"
                    }`}
                  >
                    {job.status}
                  </Badge>
                </div>

                {isFailed && job.error && (
                  <p className="mt-2 text-[10px] text-red-400/80 font-mono line-clamp-2 pl-6">
                    {job.error}
                  </p>
                )}

                {isFailed && (
                  <div className="mt-2 pl-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] font-mono gap-1.5 border-red-500/25 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => handleRetry(job.id)}
                      disabled={retrying === job.id}
                    >
                      {retrying === job.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCw className="h-3 w-3" />
                      )}
                      {retrying === job.id ? "RETRYING..." : "RETRY"}
                    </Button>
                  </div>
                )}

                {!isFailed && (
                  <p className="mt-1 text-[10px] text-muted-foreground font-mono truncate pl-6">
                    {jobDescriptions[job.type] || "Processing job"}
                  </p>
                )}

                {(isProcessing || isPending) && job.attempts > 0 && (
                  <p className="mt-1 text-[10px] text-muted-foreground font-mono pl-6">
                    Attempt {job.attempts + 1} of {job.maxAttempts}
                  </p>
                )}
              </div>
            );
          })}

          {jobs.length === 0 && !isDone && !hasFailed && (
            <div className="text-center py-2">
              <p className="text-[10px] text-muted-foreground font-mono">Waiting for jobs</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
