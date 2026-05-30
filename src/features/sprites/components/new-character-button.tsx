"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateSpriteDialog } from "@/features/sprites/components/create-sprite-dialog";

interface NewCharacterButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function NewCharacterButton({ className, children }: NewCharacterButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        className={className}
        onClick={() => setOpen(true)}
      >
        {children || "New Character"}
      </Button>
      <CreateSpriteDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
