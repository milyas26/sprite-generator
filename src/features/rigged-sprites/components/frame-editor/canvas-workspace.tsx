"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Stage, Layer, Image as KonvaImage, Line, Rect, Group, Transformer } from "react-konva";
import type Konva from "konva";
import { Trash2 } from "lucide-react";
import type { PlacedItem } from "./frame-editor-layout";

const CANVAS_SIZE = 512;
const GRID_CELL = 32;
const GRID_COLOR = "#2a2430";
const BG_COLOR = "#1c1820";
const CHECKER_COLOR = "#241f2a";

interface CanvasWorkspaceProps {
  items: PlacedItem[];
  zoom: number;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onMoveItem: (id: string, x: number, y: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CanvasWorkspace = forwardRef<
  { exportImage: () => Promise<Blob | null> },
  CanvasWorkspaceProps
>(function CanvasWorkspace(
  { items, zoom, selectedItemId, onSelectItem, onMoveItem, onRemoveItem },
  ref
) {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useImperativeHandle(ref, () => ({
    async exportImage() {
      const stage = stageRef.current;
      if (!stage) return null;
      return new Promise((resolve) => {
        stage.toBlob({
          callback(blob) {
            resolve(blob);
          },
          mimeType: "image/png",
          pixelRatio: 2,
        });
      });
    },
  }));

  useEffect(() => {
    const itemUrls = items.map((i) => i.url);
    const toLoad = itemUrls.filter((url) => !images[url]);
    if (toLoad.length === 0) return;

    let cancelled = false;
    const loadPromises = toLoad.map(
      (url) =>
        new Promise<{ url: string; img: HTMLImageElement | null }>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve({ url, img });
          img.onerror = () => resolve({ url, img: null });
          img.src = url;
        })
    );

    Promise.all(loadPromises).then((results) => {
      if (cancelled) return;
      const map = { ...images };
      for (const { url, img } of results) {
        if (img) map[url] = img;
      }
      setImages(map);
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  useEffect(() => {
    const stage = stageRef.current;
    const tr = transformerRef.current;
    if (!stage || !tr) return;

    if (selectedItemId) {
      const nodes = stage.find(`#${selectedItemId}`);
      if (nodes.length > 0) {
        tr.nodes([nodes[0]]);
        tr.getLayer()?.batchDraw();
        return;
      }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedItemId, items]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target === e.target.getStage()) {
        onSelectItem(null);
      }
    },
    [onSelectItem]
  );

  const handleImageClick = useCallback(
    (itemId: string) => {
      onSelectItem(itemId);
    },
    [onSelectItem]
  );

  const handleDragEnd = useCallback(
    (itemId: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const centerX = CANVAS_SIZE / 2;
      const centerY = CANVAS_SIZE / 2;
      const x = Math.round((node.x() - centerX) / 2) * 2 + centerX;
      const y = Math.round((node.y() - centerY) / 2) * 2 + centerY;
      onMoveItem(itemId, x - centerX, y - centerY);
    },
    [onMoveItem]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedItemId) {
        onRemoveItem(selectedItemId);
      }
    },
    [selectedItemId, onRemoveItem]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const gridLines = [];
  for (let i = 0; i <= CANVAS_SIZE; i += GRID_CELL) {
    gridLines.push(
      <Line key={`v${i}`} points={[i, 0, i, CANVAS_SIZE]} stroke={GRID_COLOR} strokeWidth={0.5} listening={false} />
    );
    gridLines.push(
      <Line key={`h${i}`} points={[0, i, CANVAS_SIZE, i]} stroke={GRID_COLOR} strokeWidth={0.5} listening={false} />
    );
  }

  const checkerRects = [];
  for (let row = 0; row < CANVAS_SIZE / GRID_CELL; row++) {
    for (let col = 0; col < CANVAS_SIZE / GRID_CELL; col++) {
      if ((row + col) % 2 === 0) {
        checkerRects.push(
          <Rect
            key={`c${row}_${col}`}
            x={col * GRID_CELL}
            y={row * GRID_CELL}
            width={GRID_CELL}
            height={GRID_CELL}
            fill={CHECKER_COLOR}
            listening={false}
          />
        );
      }
    }
  }

  const centerX = CANVAS_SIZE / 2;
  const centerY = CANVAS_SIZE / 2;

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-[#1c1820] shadow-lg">
      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-[#0d0b10]">
        <span className="text-[8px] font-mono text-muted-foreground/50">
          {CANVAS_SIZE}x{CANVAS_SIZE} · {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
        {selectedItemId && (
          <button
            onClick={() => onRemoveItem(selectedItemId)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete selected (Del)"
          >
            <Trash2 className="h-2.5 w-2.5" />
            Delete
          </button>
        )}
      </div>
      <Stage
        ref={stageRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={handleStageClick}
        onTap={handleStageClick}
        style={{ display: "block" }}
      >
        <Layer listening={false}>
          {checkerRects}
          <Rect x={0} y={0} width={CANVAS_SIZE} height={CANVAS_SIZE} fill={BG_COLOR} opacity={0.5} listening={false} />
        </Layer>
        <Layer listening={false}>
          {gridLines}
          <Line points={[centerX, 0, centerX, CANVAS_SIZE]} stroke="#3a3340" strokeWidth={0.5} dash={[4, 4]} listening={false} />
          <Line points={[0, centerY, CANVAS_SIZE, centerY]} stroke="#3a3340" strokeWidth={0.5} dash={[4, 4]} listening={false} />
        </Layer>
        <Layer>
          <Group x={centerX} y={centerY} scaleX={zoom} scaleY={zoom}>
            {items.map((item) => {
              const img = images[item.url];
              if (!img) return null;

              return (
                <KonvaImage
                  key={item.id}
                  id={item.id}
                  image={img}
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  draggable
                  onClick={() => handleImageClick(item.id)}
                  onTap={() => handleImageClick(item.id)}
                  onDragEnd={(e) => handleDragEnd(item.id, e)}
                />
              );
            })}
          </Group>
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 4 || newBox.height < 4) return oldBox;
              return newBox;
            }}
            enabledAnchors={[]}
            borderStroke="#a78bfa"
            borderStrokeWidth={1}
            borderDash={[3, 3]}
            anchorSize={0}
          />
        </Layer>
      </Stage>
    </div>
  );
});
