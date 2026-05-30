"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { processNextJobAction } from "@/features/generation/actions";

export function ProcessJobsButton() {
  const [loading, setLoading] = useState(false);

  async function handleProcess() {
    setLoading(true);
    try {
      const result = await processNextJobAction();
      if (result.processed > 0) {
        toast.success("Job processed successfully");
      } else {
        toast.info("No pending jobs to process");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process jobs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      className="w-full gap-1.5"
      disabled={loading}
      onClick={handleProcess}
    >
      <Play className="h-3.5 w-3.5" />
      {loading ? "Processing..." : "Process Jobs"}
    </Button>
  );
}
