import { getCharacterGridProps } from "@/features/library/suspense-wrapper";
import { EditorLayout } from "@/features/editor/components/editor-layout";
import { Suspense } from "react";

export default function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ select?: string; status?: string; search?: string; page?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#0a0a10]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-sprite-pulse" />
            <span className="text-[11px] font-mono text-muted-foreground">Loading editor...</span>
          </div>
        </div>
      }
    >
      <EditorWrapper searchParams={searchParams} />
    </Suspense>
  );
}

async function EditorWrapper({
  searchParams,
}: {
  searchParams: Promise<{ select?: string; status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { characters } = await getCharacterGridProps({
    status: params.status,
    search: params.search,
    page: params.page || "1",
  });
  return <EditorLayout characters={characters} initialSelectedId={params.select ?? null} />;
}
