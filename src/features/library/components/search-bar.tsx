"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
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
    router.push(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, router]);

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder="Search characters..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-7 bg-[#2e2833] border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 font-mono text-xs h-8"
      />
    </div>
  );
}
