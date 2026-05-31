"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AssetBucket } from "./asset-bucket";
import { CanvasWorkspace } from "./canvas-workspace";
import { FrameTimeline } from "./frame-timeline";
import type { Asset } from "@/features/assets/types";

export interface PlacedItem {
  id: string;
  assetId: string;
  url: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Frame {
  id: string;
  name: string;
  items: PlacedItem[];
  duration: number;
}

let itemCounter = 0;
function nextItemId(): string {
  return `item_${++itemCounter}_${Date.now()}`;
}

function nextFrameId(): string {
  return `frame_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface FrameEditorLayoutProps {
  initialAssets: Asset[];
}

export function FrameEditorLayout({ initialAssets }: FrameEditorLayoutProps) {
  const [frames, setFrames] = useState<Frame[]>(() => [
    { id: nextFrameId(), name: "Frame 1", items: [], duration: 100 },
  ]);
  const [activeFrameId, setActiveFrameId] = useState<string>(frames[0].id);
  const [zoom, setZoom] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const activeFrame = frames.find((f) => f.id === activeFrameId) ?? frames[0];
  const items = activeFrame.items;

  const updateActiveFrame = useCallback(
    (updater: (frame: Frame) => Frame) => {
      setFrames((prev) =>
        prev.map((f) => (f.id === activeFrameId ? updater({ ...f, items: [...f.items] }) : f))
      );
    },
    [activeFrameId]
  );

  const handleAddItemToCanvas = useCallback(
    (asset: Asset) => {
      if (!asset.sheetUrl) return;
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        updateActiveFrame((frame) => ({
          ...frame,
          items: [
            ...frame.items,
            {
              id: nextItemId(),
              assetId: asset.id,
              url: asset.sheetUrl!,
              name: asset.name,
              x: 256 - img.width / 2,
              y: 256 - img.height / 2,
              width: img.width,
              height: img.height,
            },
          ],
        }));
      };
      img.src = asset.sheetUrl;
    },
    [updateActiveFrame]
  );

  const handleMoveItem = useCallback(
    (itemId: string, x: number, y: number) => {
      updateActiveFrame((frame) => ({
        ...frame,
        items: frame.items.map((item) =>
          item.id === itemId ? { ...item, x: Math.round(x), y: Math.round(y) } : item
        ),
      }));
    },
    [updateActiveFrame]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      updateActiveFrame((frame) => ({
        ...frame,
        items: frame.items.filter((item) => item.id !== itemId),
      }));
      if (selectedItemId === itemId) setSelectedItemId(null);
    },
    [updateActiveFrame, selectedItemId]
  );

  const handleAddFrame = useCallback(() => {
    const newFrame: Frame = {
      id: nextFrameId(),
      name: `Frame ${frames.length + 1}`,
      items: activeFrame ? activeFrame.items.map((item) => ({ ...item })) : [],
      duration: 100,
    };
    setFrames((prev) => [...prev, newFrame]);
    setActiveFrameId(newFrame.id);
  }, [frames.length, activeFrame]);

  const handleDuplicateFrame = useCallback(() => {
    const newFrame: Frame = {
      id: nextFrameId(),
      name: `${activeFrame.name} copy`,
      items: activeFrame.items.map((item) => ({ ...item })),
      duration: activeFrame.duration,
    };
    setFrames((prev) => [...prev, newFrame]);
    setActiveFrameId(newFrame.id);
  }, [activeFrame]);

  const handleRemoveFrame = useCallback(
    (frameId: string) => {
      if (frames.length <= 1) return;
      setFrames((prev) => prev.filter((f) => f.id !== frameId));
      if (activeFrameId === frameId) {
        setActiveFrameId(frames[0].id === frameId ? frames[1].id : frames[0].id);
      }
    },
    [frames, activeFrameId]
  );

  const handleRenameFrame = useCallback(
    (frameId: string, name: string) => {
      setFrames((prev) =>
        prev.map((f) => (f.id === frameId ? { ...f, name } : f))
      );
    },
    []
  );

  const handleFrameDurationChange = useCallback(
    (frameId: string, duration: number) => {
      setFrames((prev) =>
        prev.map((f) => (f.id === frameId ? { ...f, duration } : f))
      );
    },
    []
  );

  const handleReorderFrames = useCallback((fromIndex: number, toIndex: number) => {
    setFrames((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const handleExportGif = useCallback(async () => {
    toast.info("GIF export not yet implemented");
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-card flex-shrink-0">
        <span className="text-[10px] font-mono font-semibold text-foreground">Frame Animation Editor</span>
        <span className="text-[8px] font-mono text-muted-foreground/50 ml-auto">
          {frames.length} frame{frames.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-muted-foreground">Zoom</span>
          <input
            type="range"
            min={25}
            max={400}
            step={5}
            value={zoom * 100}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            className="w-20 h-1.5 accent-primary cursor-pointer"
          />
          <span className="text-[9px] font-mono text-muted-foreground w-8 text-right">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-60 flex-shrink-0 border-r border-border bg-card/30 overflow-hidden">
          <AssetBucket
            assets={initialAssets}
            onAddToCanvas={handleAddItemToCanvas}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 bg-[#151118] overflow-hidden">
            <CanvasWorkspace
              items={items}
              zoom={zoom}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              onMoveItem={handleMoveItem}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <div className="h-36 flex-shrink-0 border-t border-border bg-card">
            <FrameTimeline
              frames={frames}
              activeFrameId={activeFrameId}
              onSelectFrame={setActiveFrameId}
              onAddFrame={handleAddFrame}
              onDuplicateFrame={handleDuplicateFrame}
              onRemoveFrame={handleRemoveFrame}
              onRenameFrame={handleRenameFrame}
              onDurationChange={handleFrameDurationChange}
              onReorderFrames={handleReorderFrames}
              onExportGif={handleExportGif}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
