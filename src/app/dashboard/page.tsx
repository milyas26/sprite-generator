import { getCharacterGridProps } from "@/features/library/suspense-wrapper";
import { CharacterGrid } from "@/features/characters/components/character-grid";
import { SearchBar } from "@/features/library/components/search-bar";
import { StatusFilter } from "@/features/library/components/status-filter";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Character Library
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Browse and manage your pixel art characters</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <SearchBar />
        <StatusFilter />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl bg-card border border-border" />
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
