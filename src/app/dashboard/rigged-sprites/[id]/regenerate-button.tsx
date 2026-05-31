"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { regenerateRiggedSprite } from "@/features/rigged-sprites/actions";
import { toast } from "sonner";
import { RefreshCw, Loader2 } from "lucide-react";

interface RegenerateRiggedSpriteButtonProps {
  characterId: string;
}

export function RegenerateRiggedSpriteButton({ characterId }: RegenerateRiggedSpriteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await regenerateRiggedSprite(characterId);
      toast.success("Regeneration started");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to regenerate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegenerate}
      disabled={loading}
      className="h-7 text-[10px] font-mono border-border bg-transparent text-muted-foreground hover:text-foreground gap-1"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
      {loading ? "Regenerating..." : "Regenerate"}
    </Button>
  );
}
