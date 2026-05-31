"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RiggedCanvas } from "./rigged-canvas";
import { LayersPanel } from "./layers-panel";
import { RiggedToolbar } from "./rigged-toolbar";
import { updateRiggedSpriteDNA } from "@/features/rigged-sprites/actions";
import type {
  RiggedSprite,
  RiggedSpriteAsset,
  RiggedSpriteDNA,
  BodyPartName,
  RiggingConfig,
} from "@/features/rigged-sprites/types";

interface RiggedEditorLayoutProps {
  character: RiggedSprite;
  assets: RiggedSpriteAsset[];
}

function deepCloneOffsets(offsets: RiggingConfig["offsets"]): RiggingConfig["offsets"] {
  const clone: Partial<RiggingConfig["offsets"]> = {};
  for (const [key, val] of Object.entries(offsets)) {
    clone[key as BodyPartName] = { x: val.x, y: val.y };
  }
  return clone as RiggingConfig["offsets"];
}

function offsetsEqual(a: RiggingConfig["offsets"], b: RiggingConfig["offsets"]): boolean {
  const keys = Object.keys(a) as BodyPartName[];
  for (const k of keys) {
    if (a[k].x !== b[k].x || a[k].y !== b[k].y) return false;
  }
  return true;
}

function zOrderEqual(a: BodyPartName[], b: BodyPartName[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

export function RiggedEditorLayout({ character, assets }: RiggedEditorLayoutProps) {
  const router = useRouter();
  const dna = character.dna as RiggedSpriteDNA;
  const savedRigging = dna.rigging;

  const [offsets, setOffsets] = useState<RiggingConfig["offsets"]>(
    deepCloneOffsets(savedRigging.offsets)
  );
  const [zOrder, setZOrder] = useState<BodyPartName[]>([...savedRigging.zOrder]);
  const [visible, setVisible] = useState<Record<BodyPartName, boolean>>(() => {
    const v: Partial<Record<BodyPartName, boolean>> = {};
    for (const key of savedRigging.zOrder) {
      v[key] = true;
    }
    return v as Record<BodyPartName, boolean>;
  });
  const [selectedPart, setSelectedPart] = useState<BodyPartName | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = useMemo(() => {
    return !offsetsEqual(offsets, savedRigging.offsets) || !zOrderEqual(zOrder, savedRigging.zOrder);
  }, [offsets, zOrder, savedRigging]);

  const handleDragPart = useCallback((partName: BodyPartName, x: number, y: number) => {
    setOffsets((prev) => ({ ...prev, [partName]: { x, y } }));
  }, []);

  const handleToggleVisibility = useCallback((partName: BodyPartName) => {
    setVisible((prev) => ({ ...prev, [partName]: !prev[partName] }));
  }, []);

  const handleMoveUp = useCallback((partName: BodyPartName) => {
    setZOrder((prev) => {
      const idx = prev.indexOf(partName);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((partName: BodyPartName) => {
    setZOrder((prev) => {
      const idx = prev.indexOf(partName);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const updatedDna: RiggedSpriteDNA = {
        ...dna,
        rigging: { zOrder, offsets },
      };
      await updateRiggedSpriteDNA(character.id, updatedDna as unknown as Record<string, unknown>);
      toast.success("Rigging saved");
      router.refresh();
    } catch {
      toast.error("Failed to save rigging");
    } finally {
      setIsSaving(false);
    }
  }, [character.id, dna, zOrder, offsets, router]);

  const handleReset = useCallback(() => {
    setOffsets(deepCloneOffsets(savedRigging.offsets));
    setZOrder([...savedRigging.zOrder]);
    setVisible(() => {
      const v: Partial<Record<BodyPartName, boolean>> = {};
      for (const key of savedRigging.zOrder) {
        v[key] = true;
      }
      return v as Record<BodyPartName, boolean>;
    });
  }, [savedRigging]);

  const bodyPartAssets = assets.filter((a) => a.type === "BODY_PART");

  const currentRigging: RiggingConfig = useMemo(
    () => ({ zOrder, offsets }),
    [zOrder, offsets]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <RiggedToolbar
        characterId={character.id}
        characterName={character.name}
        zoom={zoom}
        isSaving={isSaving}
        hasChanges={hasChanges}
        onZoomChange={setZoom}
        onSave={handleSave}
        onReset={handleReset}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4 bg-[#151118]">
          <RiggedCanvas
            assets={assets}
            rigging={currentRigging}
            visible={visible}
            selectedPart={selectedPart}
            zoom={zoom}
            onDragPart={handleDragPart}
            onSelectPart={setSelectedPart}
          />
        </div>

        <div className="w-56 flex-shrink-0 p-3 bg-card/30 border-l border-border">
          <LayersPanel
            zOrder={zOrder}
            visible={visible}
            selectedPart={selectedPart}
            partCount={bodyPartAssets.length}
            onToggleVisibility={handleToggleVisibility}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onSelectPart={setSelectedPart}
          />
        </div>
      </div>
    </div>
  );
}
