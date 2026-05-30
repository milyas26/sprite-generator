import { NextRequest, NextResponse } from "next/server";
import { assetService } from "@/features/assets/services";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const asset = await assetService.getAsset(id);
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return NextResponse.json(asset);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await assetService.deleteAsset(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Asset not found") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
