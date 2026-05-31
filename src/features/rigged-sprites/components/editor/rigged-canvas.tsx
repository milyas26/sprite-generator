"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Rect, Group } from "react-konva";
import type Konva from "konva";
import type { BodyPartName, RiggedSpriteAsset, RiggingConfig } from "@/features/rigged-sprites/types";

const CANVAS_SIZE = 512;
const GRID_CELL = 32;
const GRID_COLOR = "#2a2430";
const BG_COLOR = "#1c1820";
const CHECKER_COLOR = "#241f2a";

interface RiggedCanvasProps {
  assets: RiggedSpriteAsset[];
  rigging: RiggingConfig;
  visible: Record<BodyPartName, boolean>;
  selectedPart: BodyPartName | null;
  zoom: number;
  onDragPart: (partName: BodyPartName, x: number, y: number) => void;
  onSelectPart: (partName: BodyPartName | null) => void;
}

function useBodyPartImages(assets: RiggedSpriteAsset[]) {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const map: Record<string, HTMLImageElement> = {};
    let cancelled = false;

    const bodyPartAssets = assets.filter((a) => a.type === "BODY_PART" && a.layerName);
    const loadPromises = bodyPartAssets.map(
      (asset) =>
        new Promise<{ name: string; img: HTMLImageElement | null }>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve({ name: asset.layerName!, img });
          img.onerror = () => resolve({ name: asset.layerName!, img: null });
          img.src = asset.url;
        })
    );

    Promise.all(loadPromises).then((results) => {
      if (cancelled) return;
      for (const { name, img } of results) {
        if (img) map[name] = img;
      }
      setImages(map);
    });

    return () => {
      cancelled = true;
    };
  }, [assets]);

  return images;
}

export function RiggedCanvas({
  assets,
  rigging,
  visible,
  selectedPart,
  zoom,
  onDragPart,
  onSelectPart,
}: RiggedCanvasProps) {
  const images = useBodyPartImages(assets);
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setScale(zoom);
  }, [zoom]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const newScale = Math.max(0.25, Math.min(4, scale - e.evt.deltaY * 0.001));
      setScale(newScale);
    },
    [scale]
  );

  const handleDragEnd = useCallback(
    (partName: BodyPartName, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const centerX = CANVAS_SIZE / 2;
      const centerY = CANVAS_SIZE / 2;
      const rawX = (node.x() - centerX) / scale;
      const rawY = (node.y() - centerY) / scale;
      const snappedX = Math.round(rawX / 2) * 2;
      const snappedY = Math.round(rawY / 2) * 2;
      onDragPart(partName, snappedX, snappedY);
    },
    [scale, onDragPart]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        onSelectPart(null);
      }
    },
    [onSelectPart]
  );

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

  const sortedParts = [...rigging.zOrder].filter(
    (name) => images[name] && visible[name]
  );

  const centerX = CANVAS_SIZE / 2;
  const centerY = CANVAS_SIZE / 2;

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-[#1c1820]">
      <Stage
        ref={stageRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onWheel={handleWheel}
        onClick={handleStageClick}
        style={{ display: "block" }}
      >
        <Layer listening={false}>
          {checkerRects}
          <Rect x={0} y={0} width={CANVAS_SIZE} height={CANVAS_SIZE} fill={BG_COLOR} opacity={0.5} listening={false} />
        </Layer>
        <Layer listening={false}>
          {gridLines}
          <Line
            points={[centerX, 0, centerX, CANVAS_SIZE]}
            stroke="#3a3340"
            strokeWidth={0.5}
            dash={[4, 4]}
            listening={false}
          />
          <Line
            points={[0, centerY, CANVAS_SIZE, centerY]}
            stroke="#3a3340"
            strokeWidth={0.5}
            dash={[4, 4]}
            listening={false}
          />
        </Layer>
        <Layer>
          <Group x={centerX} y={centerY} scaleX={scale} scaleY={scale}>
            {sortedParts.map((partName) => {
              const img = images[partName];
              if (!img) return null;
              const offset = rigging.offsets[partName] || { x: 0, y: 0 };
              const isSelected = selectedPart === partName;

              return (
                <KonvaImage
                  key={partName}
                  id={partName}
                  image={img}
                  x={offset.x - img.width / 2}
                  y={offset.y - img.height / 2}
                  offsetX={0}
                  offsetY={0}
                  draggable
                  onDragEnd={(e) => handleDragEnd(partName as BodyPartName, e)}
                  onClick={() => onSelectPart(partName as BodyPartName)}
                  stroke={isSelected ? "#a78bfa" : undefined}
                  strokeWidth={isSelected ? 1 : undefined}
                  strokeScaleEnabled={false}
                  opacity={visible[partName] === false ? 0 : 1}
                />
              );
            })}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
