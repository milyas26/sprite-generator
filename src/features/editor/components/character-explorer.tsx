"use client";

import type { Character } from "@/features/sprites/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  User,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { CreateSpriteDialog } from "@/features/sprites/components/create-sprite-dialog";

const statusDot: Record<string, string> = {
  DRAFT: "bg-amber-500",
  DNA_READY: "bg-sky-500",
  GENERATING: "bg-primary animate-sprite-pulse",
  READY: "bg-emerald-500",
  FAILED: "bg-red-500",
};

interface CharacterExplorerProps {
  characters: Character[];
  selectedId: string | null;
  onSelect: (character: Character) => void;
}

export function CharacterExplorer({
  characters,
  selectedId,
  onSelect,
}: CharacterExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#221e26] border-r border-border">
      <div className="flex items-center justify-between px-3 h-9 border-b border-border shrink-0">
        <span className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          Characters
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/50">
          {characters.length}
        </span>
      </div>

      <div className="px-2 py-1.5 space-y-1 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-6 h-7 bg-[#1c1820] border-border text-foreground placeholder:text-muted-foreground/30 font-mono text-[10px] focus:border-primary/40"
          />
        </div>
        <Button
          size="xs"
          variant="ghost"
          className="w-full justify-start h-7 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-[#342e3a] border border-dashed border-border/50 gap-1.5"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-3 w-3" />
          New Character
        </Button>
        <CreateSpriteDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 py-0.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-10 h-10 rounded-lg border border-dashed border-border flex items-center justify-center mb-2.5">
              <User className="h-4 w-4 text-muted-foreground/30" />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground/50">
              {searchQuery ? "No matching characters" : "No characters yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((character) => {
              const isSelected = selectedId === character.id;
              const dotClass = statusDot[character.status] || "bg-muted-foreground";

              return (
                <div
                  key={character.id}
                  className={cn(
                    "group flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "border border-transparent hover:bg-[#29242d] hover:border-border/40"
                  )}
                  onClick={() => onSelect(character)}
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 flex-shrink-0 transition-transform",
                      isSelected
                        ? "text-primary rotate-90"
                        : "text-muted-foreground/30 group-hover:text-muted-foreground/60"
                    )}
                  />

                  <div className="flex items-center justify-center w-6 h-6 rounded bg-[#1c1820] border border-border/30 flex-shrink-0 overflow-hidden">
                    {character.sheetUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={character.sheetUrl}
                        alt=""
                        className="w-full h-full object-cover pixelated"
                      />
                    ) : (
                      <User className="h-3 w-3 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[11px] font-mono truncate",
                        isSelected ? "text-foreground font-medium" : "text-foreground/70"
                      )}
                    >
                      {character.name}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "inline-block w-1.5 h-1.5 rounded-full flex-shrink-0",
                      dotClass
                    )}
                    title={character.status}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-3 py-1.5 border-t border-border shrink-0">
        <span className="text-[8px] font-mono text-muted-foreground/40">
          {filtered.length} of {characters.length} assets
        </span>
      </div>
    </div>
  );
}
