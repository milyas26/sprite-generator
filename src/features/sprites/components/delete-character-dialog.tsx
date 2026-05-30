"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCharacter } from "@/features/sprites/actions";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteCharacterButtonProps {
  characterId: string;
  characterName: string;
}

export function DeleteCharacterButton({ characterId, characterName }: DeleteCharacterButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteCharacter(characterId);
      toast.success("Character deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm" className="h-7 text-[10px] font-mono gap-1 bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15 hover:text-red-300">
            <Trash2 className="h-3 w-3" />
            DELETE
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm border-0 bg-[#14141c] p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <div className="flex items-start gap-3 p-5">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <DialogTitle className="font-mono text-sm text-foreground uppercase tracking-wider mb-1">Delete Character</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground font-mono">
              Permanently delete <span className="text-foreground font-semibold">&quot;{characterName}&quot;</span>? All assets, DNA data, and generation history will be removed.
            </DialogDescription>
          </div>
        </div>
        <DialogFooter className="border-t border-border bg-[#0f0f16] p-4 flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} className="h-8 text-[10px] font-mono border-border bg-transparent text-muted-foreground hover:text-foreground">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading} className="h-8 text-[10px] font-mono bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15 hover:text-red-300">
            {loading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
