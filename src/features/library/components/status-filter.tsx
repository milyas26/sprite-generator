"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const statuses = [
  { value: "", label: "All" },
  { value: "READY", label: "Ready" },
  { value: "GENERATING", label: "Generating" },
  { value: "DRAFT", label: "Drafts" },
  { value: "FAILED", label: "Failed" },
];

export function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") || "";

  function setStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.delete("page");
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map((s) => (
        <Button
          key={s.value}
          variant={current === s.value ? "default" : "outline"}
          size="sm"
          onClick={() => setStatus(s.value)}
          className={
            current === s.value
              ? "bg-primary hover:bg-primary/85 text-primary-foreground border-0 font-mono text-xs"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-mono text-xs"
          }
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
