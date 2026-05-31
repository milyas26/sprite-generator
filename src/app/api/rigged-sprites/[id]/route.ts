import { getRiggedSprite } from "@/features/rigged-sprites/actions";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const aggregate = await getRiggedSprite(id);

  if (!aggregate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(aggregate);
}
