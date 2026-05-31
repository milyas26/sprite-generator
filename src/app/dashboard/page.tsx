import { getCharacterGridProps } from "@/features/library/suspense-wrapper";
import { CharacterGrid } from "@/features/sprites/components/character-grid";
import { SearchBar } from "@/features/library/components/search-bar";
import { StatusFilter } from "@/features/library/components/status-filter";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Library } from "lucide-react";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/15">
          <Library className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-heading">Sprite Library</h1>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Browse and manage pixel art sprites</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <SearchBar />
        <StatusFilter />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg bg-card border border-border" />
            ))}
          </div>
        }
      >
        <CharacterGridWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CharacterGridWrapper({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { characters, pagination } = await getCharacterGridProps({
    status: params.status,
    search: params.search,
    page: params.page,
  });
  return <CharacterGrid characters={characters} pagination={pagination} />;
}
