import { characterService } from "@/features/characters/services";

interface GetCharacterGridProps {
  status?: string;
  search?: string;
  page?: string;
}

export async function getCharacterGridProps({ status, search, page }: GetCharacterGridProps) {
  const result = await characterService.getCharacters({
    page: page ? parseInt(page) : 1,
    limit: 12,
    status: status as any,
    search,
    sort: "createdAt",
    order: "desc",
  });

  return {
    characters: result.data,
    pagination: result.pagination,
  };
}
