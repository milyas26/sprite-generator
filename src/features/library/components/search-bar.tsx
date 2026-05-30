"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useEffect, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");

  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedValue === currentSearch) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/dashboard?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, router]);

  return (
    <Input
      placeholder="Search characters..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="max-w-sm bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 font-mono text-sm"
    />
  );
}
