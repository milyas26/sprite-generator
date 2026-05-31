"use client";

import {
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Headphones,
  Scissors,
  Armchair,
  Hand,
  Footprints,
  Swords,
  Shield,
  Wand,
  Layers,
} from "lucide-react";
import type { BodyPartName } from "@/features/rigged-sprites/types";

const PART_ICONS: Record<BodyPartName, React.ReactNode> = {
  head: <Headphones className="h-3 w-3" />,
  hair: <Scissors className="h-3 w-3" />,
  torso: <Armchair className="h-3 w-3" />,
  arms: <Hand className="h-3 w-3" />,
  legs: <Footprints className="h-3 w-3" />,
  weapon: <Swords className="h-3 w-3" />,
  shield: <Shield className="h-3 w-3" />,
  accessory: <Wand className="h-3 w-3" />,
};

const PART_LABELS: Record<BodyPartName, string> = {
  head: "Head",
  hair: "Hair",
  torso: "Torso",
  arms: "Arms",
  legs: "Legs",
  weapon: "Weapon",
  shield: "Shield",
  accessory: "Accessory",
};

interface LayersPanelProps {
  zOrder: BodyPartName[];
  visible: Record<BodyPartName, boolean>;
  selectedPart: BodyPartName | null;
  partCount: number;
  onToggleVisibility: (part: BodyPartName) => void;
  onMoveUp: (part: BodyPartName) => void;
  onMoveDown: (part: BodyPartName) => void;
  onSelectPart: (part: BodyPartName | null) => void;
}

export function LayersPanel({
  zOrder,
  visible,
  selectedPart,
  partCount,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onSelectPart,
}: LayersPanelProps) {
  return (
    <div className="flex flex-col h-full border-border bg-card rounded-lg border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-secondary/30">
        <Layers className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-mono font-semibold text-foreground">Layers</span>
        <span className="text-[9px] font-mono text-muted-foreground ml-auto">{partCount} parts</span>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {zOrder.map((partName, index) => {
          const isSelected = selectedPart === partName;
          const isVisible = visible[partName];

          return (
            <div
              key={partName}
              onClick={() => onSelectPart(partName)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-mono cursor-pointer select-none transition-colors ${
                isSelected
                  ? "bg-primary/10 border border-primary/20 text-primary"
                  : "hover:bg-secondary/50 border border-transparent text-muted-foreground"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(partName);
                }}
                className="flex-shrink-0 p-0.5 rounded hover:bg-secondary transition-colors"
                title={isVisible ? "Hide" : "Show"}
              >
                {isVisible ? (
                  <Eye className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-3 w-3 text-muted-foreground/40" />
                )}
              </button>

              <span className="flex-shrink-0">{PART_ICONS[partName]}</span>
              <span className="flex-1 truncate">{PART_LABELS[partName]}</span>

              <span className="text-[8px] text-muted-foreground/50 w-4 text-center">{index + 1}</span>

              <div className="flex flex-col gap-px flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(partName);
                  }}
                  disabled={index === 0}
                  className="p-0.5 rounded hover:bg-secondary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ChevronUp className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(partName);
                  }}
                  disabled={index === zOrder.length - 1}
                  className="p-0.5 rounded hover:bg-secondary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ChevronDown className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
