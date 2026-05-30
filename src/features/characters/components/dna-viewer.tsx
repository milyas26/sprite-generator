"use client";

import { useState } from "react";

interface DNAViewerProps {
  dna: any;
}

export function DNAViewer({ dna }: DNAViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function renderValue(key: string, value: any, depth = 0): React.ReactNode {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground/30">null</span>;
    }

    if (typeof value === "boolean") {
      return <span className="text-amber-400">{String(value)}</span>;
    }

    if (typeof value === "number") {
      return <span className="text-sky-400">{value}</span>;
    }

    if (typeof value === "string") {
      if (value.length > 60) {
        return <span className="text-emerald-400">&quot;{value.slice(0, 60)}...&quot;</span>;
      }
      return <span className="text-emerald-400">&quot;{value}&quot;</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground/30">[]</span>;
      const isExpanded = expanded[key] ?? false;
      return (
        <div>
          <button onClick={() => toggle(key)} className="text-primary hover:text-accent-foreground text-xs font-mono transition-colors">
            {isExpanded ? "\u25BE" : "\u25B8"} [{value.length} items]
          </button>
          {isExpanded && (
            <div className="ml-4 border-l border-border pl-4 mt-0.5">
              {value.map((item: any, i: number) => (
                <div key={i}>{renderValue(`${key}.${i}`, item, depth + 1)}</div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0) return <span className="text-muted-foreground/30">{ }</span>;
      const isExpanded = expanded[key] ?? depth < 2;
      return (
        <div>
          <button onClick={() => toggle(key)} className="text-accent-foreground hover:text-foreground text-xs font-mono transition-colors">
            {isExpanded ? "\u25BE" : "\u25B8"} {key}
          </button>
          {isExpanded && (
            <div className="ml-4 border-l border-border pl-4 mt-0.5 space-y-0">
              {entries.map(([k, v]) => (
                <div key={k} className="font-mono text-xs flex gap-2">
                  <span className="text-muted-foreground shrink-0">{k}:</span>
                  <span>{renderValue(k, v, depth + 1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span className="text-foreground">{String(value)}</span>;
  }

  return (
    <div className="rounded-lg bg-background/50 p-4 overflow-auto max-h-96 font-mono text-xs">
      {renderValue("root", dna)}
    </div>
  );
}
