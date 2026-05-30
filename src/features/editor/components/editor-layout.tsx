"use client";

import { useState, useCallback, useEffect } from "react";
import type { Character, CharacterAsset } from "@/features/characters/types";
import { EditorToolbar } from "./editor-toolbar";
import { SpritePackPanel } from "./sprite-pack-panel";
import { CharacterInspector } from "./character-inspector";
import { MasterPreview } from "./master-preview";
import { GeneratedPacksList } from "./generated-packs-list";
import { PipelineProgress } from "@/features/generation/components/pipeline-progress";
import { toast } from "sonner";
import { regenerateCharacter, getCharacter } from "@/features/characters/actions";

interface EditorLayoutProps {
  characters: Character[];
  initialSelectedId?: string | null;
}

export function EditorLayout({ characters, initialSelectedId = null }: EditorLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [zoom, setZoom] = useState(1);
  const [gridVisible, setGridVisible] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [assets, setAssets] = useState<CharacterAsset[]>([]);
  const [pollingKey, setPollingKey] = useState(0);

  const selectedCharacter =
    characters.find((c) => c.id === selectedId) ?? null;

  const fetchAssets = useCallback((id: string) => {
    getCharacter(id).then((agg) => {
      if (agg) setAssets(agg.assets);
    }).catch(() => setAssets([]));
  }, []);

  useEffect(() => {
    if (initialSelectedId) {
      fetchAssets(initialSelectedId);
    }
  }, [initialSelectedId, fetchAssets]);

  const handleSelectCharacter = useCallback((c: Character) => {
    setSelectedId(c.id);
    fetchAssets(c.id);
  }, [fetchAssets]);

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
    setPollingKey((k) => k + 1);
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

  const handleAssetsRefresh = useCallback(() => {
    if (!selectedId) return;
    fetchAssets(selectedId);
  }, [selectedId, fetchAssets]);

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-30">
        <EditorToolbar
          characters={characters}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={handleSelectCharacter}
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
        {selectedCharacter ? (
          <SpritePackPanel
            characterId={selectedCharacter.id}
            assets={assets}
            characterName={selectedCharacter.name}
            onGenerated={handleAssetsRefresh}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0a0a10] editor-grid">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <span className="text-muted-foreground/20 font-mono text-2xl">SP</span>
              </div>
              <div>
                <p className="text-[11px] font-mono text-muted-foreground/30">
                  Select a character from the toolbar
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/15 mt-0.5">
                  Sprite pack generator workspace
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="w-[320px] flex-shrink-0 flex flex-col border-l border-border bg-[#0d0d14]">
          <MasterPreview
            sheetUrl={selectedCharacter?.sheetUrl ?? null}
            characterName={selectedCharacter?.name ?? ""}
          />

          <GeneratedPacksList assets={assets} />

          <div className="flex-1 overflow-y-auto">
            <CharacterInspector
              character={selectedCharacter}
              onRegenerate={handleRegenerate}
              onExport={handleExport}
            />
          </div>

          {regenerating && selectedCharacter && (
            <div className="shrink-0 border-t border-border p-2">
              <PipelineProgress
                key={pollingKey}
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
