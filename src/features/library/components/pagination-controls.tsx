"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
  pagination: {
    page: number;
    totalPages: number;
  };
}

export function PaginationControls({ pagination }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-center gap-2 font-mono">
      <Button
        variant="outline"
        size="sm"
        disabled={pagination.page <= 1}
        onClick={() => goToPage(pagination.page - 1)}
        className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30"
      >
        Prev
      </Button>
      <span className="text-sm text-muted-foreground px-4">
        {pagination.page} / {pagination.totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => goToPage(pagination.page + 1)}
        className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30"
      >
        Next
      </Button>
    </div>
  );
}
