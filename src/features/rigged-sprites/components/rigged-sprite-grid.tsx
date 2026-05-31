import type { RiggedSprite, PaginatedResult } from "@/features/rigged-sprites/types";
import { RiggedSpriteCard } from "./rigged-sprite-card";
import { RiggedEmptyState } from "./rigged-empty-state";
import { PaginationControls } from "@/features/library/components/pagination-controls";

interface RiggedSpriteGridProps {
  characters: RiggedSprite[];
  pagination: PaginatedResult<RiggedSprite>["pagination"];
}

export function RiggedSpriteGrid({ characters, pagination }: RiggedSpriteGridProps) {
  if (characters.length === 0) {
    return <RiggedEmptyState />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {characters.map((character) => (
          <RiggedSpriteCard key={character.id} character={character} />
        ))}
      </div>
      {pagination.totalPages > 1 && <PaginationControls pagination={pagination} />}
    </div>
  );
}
