import { NextRequest, NextResponse } from "next/server";
import { characterService } from "@/features/characters/services";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const character = await characterService.getCharacter(id);
  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  return NextResponse.json(character);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await characterService.deleteCharacter(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Character not found") {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
