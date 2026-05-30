"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { retryFailedJob } from "@/features/generation/actions";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  Circle,
  XCircle,
  Clock,
  Cpu,
  RotateCw,
  Dna,
  ImageIcon,
  Upload,
  CheckCheck,
} from "lucide-react";

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
  DNA_EXTRACTION: "GPT analyzing and structuring character design",
  SHEET_GENERATION: "AI rendering pixel art sprite sheet",
  COMPOSITE: "DNA extraction + sprite rendering pipeline",
  SPRITE_PACK: "Generating animation frames",
};

type PipelinePhase = "QUEUED" | "EXTRACTING_DNA" | "GENERATING_SHEET" | "UPLOADING" | "DONE" | "FAILED";

interface PhaseInfo {
  id: PipelinePhase;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const phases: PhaseInfo[] = [
  {
    id: "QUEUED",
    label: "Queued",
    icon: <Clock className="h-4 w-4" />,
    description: "Job waiting in queue",
  },
  {
    id: "EXTRACTING_DNA",
    label: "Extracting DNA",
    icon: <Dna className="h-4 w-4" />,
    description: "GPT analyzing prompt & structuring character data",
  },
  {
    id: "GENERATING_SHEET",
    label: "Generating Sheet",
    icon: <ImageIcon className="h-4 w-4" />,
    description: "AI rendering 4-direction pixel art sprite sheet",
  },
  {
    id: "UPLOADING",
    label: "Saving",
    icon: <Upload className="h-4 w-4" />,
    description: "Uploading sprite sheet to storage",
  },
  {
    id: "DONE",
    label: "Complete",
    icon: <CheckCheck className="h-4 w-4" />,
    description: "Sprite sheet ready for game development",
  },
];

function getNow() {
  return Date.now();
}

function statusToPhase(status: string, jobs: JobData[]): PipelinePhase {
  if (jobs.some((j) => j.status === "FAILED")) return "FAILED";
  if (status === "READY") return "DONE";
  if (status === "EXTRACTING_DNA") return "EXTRACTING_DNA";
  if (status === "GENERATING_SHEET") return "GENERATING_SHEET";
  if (status === "GENERATING") {
    const hasJobProcessing = jobs.some((j) => j.status === "PROCESSING");
    return hasJobProcessing ? "EXTRACTING_DNA" : "QUEUED";
  }
  if (status === "DRAFT") {
    const hasPending = jobs.some((j) => j.status === "PENDING");
    return hasPending ? "QUEUED" : "QUEUED";
  }
  return "QUEUED";
}

function getPhaseIndex(phase: PipelinePhase): number {
  if (phase === "FAILED") return 4;
  const idx = phases.findIndex((p) => p.id === phase);
  return idx >= 0 ? idx : 0;
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

  const currentPhase = statusToPhase(characterStatus, jobs);
  const phaseIndex = getPhaseIndex(currentPhase);
  const isDone = currentPhase === "DONE";
  const hasFailed = currentPhase === "FAILED";
  const isActive = !isDone && !hasFailed;

  const progressPercent = isDone ? 100 : hasFailed ? 0 : Math.min(Math.max(phaseIndex, 0), 4) * 25;

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
            {hasFailed ? "GENERATION FAILED" : isDone ? "COMPLETED" : "PIPELINE STATUS"}
          </CardTitle>
          {isActive && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 text-primary animate-spin" />
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {formatElapsed(elapsed)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isActive && (
          <div className="w-full bg-border/40 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        <div className="space-y-1">
          {phases.map((phase, idx) => {
            const isCurrentPhase = phase.id === currentPhase;
            const isPast = idx < phaseIndex && !hasFailed;
            const isFuture = idx > phaseIndex;
            const showAsFailed = hasFailed && idx > 0 && idx <= phaseIndex;

            let bgClass = "";
            let iconEl: React.ReactNode;

            if (showAsFailed) {
              bgClass = "bg-red-500/5 border-red-500/15";
              iconEl = <XCircle className="h-4 w-4 text-red-400" />;
            } else if (isPast) {
              bgClass = "bg-emerald-500/5 border-emerald-500/10";
              iconEl = <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            } else if (isCurrentPhase) {
              bgClass = "bg-primary/5 border-primary/15";
              iconEl = (
                <div className="relative">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
              );
            } else {
              bgClass = "bg-background/50 border-border/40";
              iconEl = <Circle className="h-4 w-4 text-muted-foreground/25" />;
            }

            return (
              <div
                key={phase.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${bgClass}`}
              >
                <div className="flex-shrink-0">{iconEl}</div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-mono font-semibold ${
                      isPast
                        ? "text-emerald-300"
                        : isCurrentPhase
                          ? "text-primary"
                          : showAsFailed
                            ? "text-red-400"
                            : "text-muted-foreground/50"
                    }`}
                  >
                    {phase.label}
                  </p>
                  {isCurrentPhase && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{phase.description}</p>
                  )}
                </div>
                {isPast && (
                  <Badge
                    variant="outline"
                    className="text-[9px] flex-shrink-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  >
                    DONE
                  </Badge>
                )}
                {isCurrentPhase && (
                  <Badge
                    variant="outline"
                    className="text-[9px] flex-shrink-0 bg-primary/10 text-primary border-primary/25 animate-sprite-pulse"
                  >
                    ACTIVE
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {isActive && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-background/50 border border-border/50">
            <Cpu className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-foreground font-medium truncate">AI Pipeline Running</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">
                {characterStatus === "EXTRACTING_DNA"
                  ? "GPT extracting character design data"
                  : characterStatus === "GENERATING_SHEET"
                    ? "Image model rendering pixel art"
                    : "Processing generation job"}
              </p>
            </div>
          </div>
        )}

        {isDone && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-400 font-mono">Sprite sheet generated successfully</p>
          </div>
        )}

        {jobs.length > 0 && (
          <div className="space-y-0.5 pt-1 border-t border-border/50">
            <p className="text-[9px] font-mono font-semibold text-muted-foreground/60 uppercase tracking-widest px-1 pb-1.5">
              Job Log
            </p>
            {jobs.map((job) => {
              const isProcessing = job.status === "PROCESSING";
              const isCompleted = job.status === "COMPLETED";
              const isFailed = job.status === "FAILED";

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
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                      ) : isProcessing ? (
                        <Loader2 className="h-3 w-3 text-primary animate-spin flex-shrink-0" />
                      ) : isFailed ? (
                        <XCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span
                        className={`text-[10px] font-mono truncate ${
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
                    <p className="mt-1.5 text-[9px] text-red-400/80 font-mono line-clamp-2 pl-5">
                      {job.error}
                    </p>
                  )}

                  {isFailed && (
                    <div className="mt-1.5 pl-5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[9px] font-mono gap-1 border-red-500/25 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => handleRetry(job.id)}
                        disabled={retrying === job.id}
                      >
                        {retrying === job.id ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          <RotateCw className="h-2.5 w-2.5" />
                        )}
                        {retrying === job.id ? "RETRYING..." : "RETRY"}
                      </Button>
                    </div>
                  )}

                  {!isFailed && (
                    <p className="mt-0.5 text-[9px] text-muted-foreground font-mono truncate pl-5">
                      {jobDescriptions[job.type] || "Processing job"}
                    </p>
                  )}

                  {(isProcessing || job.status === "PENDING") && job.attempts > 0 && (
                    <p className="mt-0.5 text-[9px] text-muted-foreground font-mono pl-5">
                      Attempt {job.attempts + 1} of {job.maxAttempts}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {jobs.length === 0 && isActive && (
          <div className="text-center py-2">
            <p className="text-[10px] text-muted-foreground font-mono">Waiting for jobs</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
