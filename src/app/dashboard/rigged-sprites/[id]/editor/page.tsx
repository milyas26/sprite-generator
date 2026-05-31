import { getRiggedSprite } from "@/features/rigged-sprites/actions";
import { RiggedEditorLayout } from "@/features/rigged-sprites/components/editor/rigged-editor-layout";
import { notFound } from "next/navigation";

export default async function RiggedSpriteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aggregate = await getRiggedSprite(id);
  if (!aggregate) notFound();

  const { character, assets } = aggregate;

  if (!character.dna) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-mono">DNA not available yet</p>
          <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">
            Wait for DNA extraction to complete
          </p>
        </div>
      </div>
    );
  }

  const bodyPartAssets = assets.filter((a) => a.type === "BODY_PART");
  if (bodyPartAssets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-mono">No body parts generated yet</p>
          <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">
            Wait for body part generation to complete
          </p>
        </div>
      </div>
    );
  }

  return <RiggedEditorLayout character={character} assets={assets} />;
}
