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
import { deleteCharacter } from "@/features/characters/actions";
import { toast } from "sonner";

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
          <Button
            variant="destructive"
            size="sm"
            className="font-mono text-xs"
          >
            Delete
          </Button>
        }
      />
      <DialogContent className="bg-popover border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Delete Character</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Permanently delete &quot;{characterName}&quot;? All assets will be removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="border-border text-secondary-foreground hover:bg-secondary font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="font-mono text-xs"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
