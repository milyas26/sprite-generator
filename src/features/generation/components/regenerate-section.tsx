"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PipelineProgress } from "./pipeline-progress";
import { regenerateCharacter } from "@/features/characters/actions";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface Props {
  characterId: string;
}

export function RegenerateSection({ characterId }: Props) {
  const [regenerating, setRegenerating] = useState(false);
  const pollingKeyRef = useRef(0);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    pollingKeyRef.current += 1;
    try {
      await regenerateCharacter(characterId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Regeneration failed");
      setRegenerating(false);
    }
  }, [characterId]);

  const handleReady = useCallback(() => {
    setRegenerating(false);
    toast.success("Sprite sheet regenerated!");
  }, []);

  if (!regenerating) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRegenerate}
        className="h-8 text-[10px] font-mono gap-1.5 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
      >
        <RefreshCw className="h-3 w-3" />
        REGENERATE
      </Button>
    );
  }

  return (
    <div className="w-80 flex-shrink-0">
      <PipelineProgress
        key={pollingKeyRef.current}
        characterId={characterId}
        onReady={handleReady}
      />
    </div>
  );
}
