"use client";

import { useState, useCallback, useRef } from "react";
import type { Character } from "@/features/characters/types";
import { EditorToolbar } from "./editor-toolbar";
import { SpriteWorkspace } from "./sprite-workspace";
import { CharacterInspector } from "./character-inspector";
import { PipelineProgress } from "@/features/generation/components/pipeline-progress";
import { toast } from "sonner";
import { regenerateCharacter } from "@/features/characters/actions";

interface EditorLayoutProps {
  characters: Character[];
  initialSelectedId?: string | null;
}

export function EditorLayout({ characters, initialSelectedId = null }: EditorLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [zoom, setZoom] = useState(1);
  const [gridVisible, setGridVisible] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const pollingKeyRef = useRef(0);

  const selectedCharacter =
    characters.find((c) => c.id === selectedId) ?? null;

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.25, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.25, 0.25));
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoom(1);
  }, []);

  const handleToggleGrid = useCallback(() => {
    setGridVisible((g) => !g);
  }, []);

  const handleExport = useCallback(() => {
    if (!selectedCharacter?.sheetUrl) return;
    const a = document.createElement("a");
    a.href = selectedCharacter.sheetUrl;
    a.download = `${selectedCharacter.name.replace(/\s+/g, "_")}_sheet.png`;
    a.click();
  }, [selectedCharacter]);

  const handleRegenerate = useCallback(async () => {
    if (!selectedCharacter) return;
    setRegenerating(true);
    pollingKeyRef.current += 1;
    try {
      await regenerateCharacter(selectedCharacter.id);
    } catch (error) {
      toast.error("Failed to regenerate", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setRegenerating(false);
    }
  }, [selectedCharacter]);

  const handleRegenerationReady = useCallback(() => {
    setRegenerating(false);
    toast.success("Sprite sheet regenerated!");
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-30">
        <EditorToolbar
          characters={characters}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={(c) => setSelectedId(c.id)}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToScreen={handleFitToScreen}
          gridVisible={gridVisible}
          onToggleGrid={handleToggleGrid}
          onExport={handleExport}
          onRegenerate={handleRegenerate}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SpriteWorkspace
          character={selectedCharacter}
          zoom={zoom}
          gridVisible={gridVisible}
        />

        <div className="w-[320px] flex-shrink-0 flex flex-col">
          <CharacterInspector
            character={selectedCharacter}
            onRegenerate={handleRegenerate}
            onExport={handleExport}
          />
          {regenerating && selectedCharacter && (
            <div className="shrink-0 border-t border-border p-2">
              <PipelineProgress
                key={pollingKeyRef.current}
                characterId={selectedCharacter.id}
                onReady={handleRegenerationReady}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
