"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PipelineProgress } from "@/features/generation/components/pipeline-progress";
import { regenerateAsset } from "@/features/assets/actions";
import { toast } from "sonner";
import { RefreshCw, X } from "lucide-react";

interface Props {
  assetId: string;
  hasDna: boolean;
}

export function RegenerateAssetButton({ assetId, hasDna }: Props) {
  const [regenerating, setRegenerating] = useState(false);
  const pollingKeyRef = useRef(0);

  const handleRegenerate = useCallback(async () => {
    if (!hasDna) {
      toast.error("Asset has no DNA to regenerate from");
      return;
    }
    setRegenerating(true);
    pollingKeyRef.current += 1;
    try {
      await regenerateAsset(assetId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Regeneration failed");
      setRegenerating(false);
    }
  }, [assetId, hasDna]);

  const handleReady = useCallback(() => {
    setRegenerating(false);
    toast.success("Asset regenerated successfully!");
  }, []);

  const handleClose = useCallback(() => {
    setRegenerating(false);
  }, []);

  if (regenerating) {
    return (
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-popover border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <X className="h-2.5 w-2.5" />
        </button>
        <div className="w-80">
          <PipelineProgress
            key={pollingKeyRef.current}
            characterId={assetId}
            onReady={handleReady}
            type="asset"
          />
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegenerate}
      disabled={!hasDna}
      className="h-7 text-[10px] font-mono gap-1.5 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
      title={!hasDna ? "No DNA available to regenerate from" : "Regenerate asset sheet"}
    >
      <RefreshCw className="h-3 w-3" />
      REGENERATE
    </Button>
  );
}
