"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateRiggedSpriteDialog } from "@/features/rigged-sprites/components/create-rigged-sprite-dialog";

export function RiggedEmptyState() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 mb-6 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-card">
        <svg className="w-10 h-10 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2 font-heading">No rigged sprites yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first modular character. AI will generate separate body parts for rigging and animation.
      </p>
      <Button
        size="lg"
        className="bg-primary hover:bg-primary/85 text-primary-foreground border-0 font-heading font-semibold shadow-sm shadow-primary/15"
        onClick={() => setOpen(true)}
      >
        + Create Your First Rigged Character
      </Button>

      <CreateRiggedSpriteDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
