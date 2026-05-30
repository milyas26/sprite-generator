import { NextRequest, NextResponse } from "next/server";
import { assetService } from "@/features/assets/services";
import { createAssetSchema, paginationSchema } from "@/features/assets/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`create-asset:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const validated = createAssetSchema.parse(body);

    const result = await assetService.createAsset(
      validated.prompt,
      validated.category,
      validated.style.artStyle,
      validated.style.detailLevel
    );

    return NextResponse.json({ asset: { id: result.assetId }, job: { id: result.jobId } }, { status: 202 });
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

  const result = await assetService.getAssets(params);

  return NextResponse.json({
    assets: result.data,
    pagination: result.pagination,
  });
}
