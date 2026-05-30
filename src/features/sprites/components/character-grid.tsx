import type { Character, PaginatedResult } from "@/features/sprites/types";
import { CharacterCard } from "./character-card";
import { EmptyState } from "@/features/library/components/empty-state";
import { PaginationControls } from "@/features/library/components/pagination-controls";

interface CharacterGridProps {
  characters: Character[];
  pagination: PaginatedResult<Character>["pagination"];
}

export function CharacterGrid({ characters, pagination }: CharacterGridProps) {
  if (characters.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
      {pagination.totalPages > 1 && <PaginationControls pagination={pagination} />}
    </div>
  );
}
