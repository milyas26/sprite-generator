"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { CreateAssetDialog } from "@/features/assets/components/create-asset-dialog";

interface CreateAssetButtonProps {
  variant?: "header" | "empty";
  className?: string;
}

export function CreateAssetButton({ variant = "header", className }: CreateAssetButtonProps) {
  const [open, setOpen] = useState(false);

  if (variant === "empty") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 border border-primary/15 text-primary hover:bg-primary/15 transition-colors font-mono text-xs font-semibold cursor-pointer",
            className
          )}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          CREATE ASSET
        </button>
        <CreateAssetDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/15 text-primary hover:bg-primary/15 transition-colors font-mono text-[12px] font-semibold cursor-pointer",
          className
        )}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        NEW ASSET
      </button>
      <CreateAssetDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
