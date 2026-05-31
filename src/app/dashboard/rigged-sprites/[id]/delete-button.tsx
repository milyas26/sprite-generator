"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteRiggedSprite } from "@/features/rigged-sprites/actions";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteRiggedSpriteButtonProps {
  characterId: string;
  characterName: string;
}

export function DeleteRiggedSpriteButton({ characterId, characterName }: DeleteRiggedSpriteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteRiggedSprite(characterId);
      toast.success(`"${characterName}" deleted`);
      router.push("/dashboard/rigged-sprites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-7 text-[10px] font-mono border-red-500/25 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-[#2e2833] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b border-border bg-[#252028]">
            <DialogTitle className="font-mono text-xs text-foreground uppercase tracking-wider">
              Delete Rigged Sprite
            </DialogTitle>
            <DialogDescription className="text-[9px] text-muted-foreground font-mono mt-0.5">
              This action cannot be undone. All body part assets and DNA data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p className="text-xs text-muted-foreground font-mono">
              Are you sure you want to delete <span className="text-foreground font-semibold">&quot;{characterName}&quot;</span>?
            </p>
          </div>
          <DialogFooter className="px-4 py-3 border-t border-border bg-[#252028]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="h-7 text-[10px] font-mono border-border bg-transparent text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="h-7 text-[10px] font-mono gap-1"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
