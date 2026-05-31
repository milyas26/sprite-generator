import { getAssets } from "@/features/assets/actions";
import { FrameEditorLayout } from "@/features/rigged-sprites/components/frame-editor/frame-editor-layout";

export default async function FrameEditorPage() {
  const assets = await getAssets({ page: 1, limit: 100 });

  return <FrameEditorLayout initialAssets={assets.data} />;
}
