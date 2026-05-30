import { NextRequest, NextResponse } from "next/server";
import { characterService } from "@/features/characters/services";
import { createCharacterSchema, paginationSchema } from "@/features/characters/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`create:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const validated = createCharacterSchema.parse(body);

    const result = await characterService.createCharacter(
      validated.prompt,
      validated.style.artStyle,
      validated.style.detailLevel
    );

    return NextResponse.json({ character: { id: result.characterId }, job: { id: result.jobId } }, { status: 202 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const params = paginationSchema.parse(Object.fromEntries(searchParams));

  const result = await characterService.getCharacters(params);

  return NextResponse.json({
    characters: result.data,
    pagination: result.pagination,
  });
}
