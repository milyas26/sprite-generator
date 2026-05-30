import { NextRequest, NextResponse } from "next/server";
import { processNextJob } from "@/features/generation/job-processor";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${env.CRON_API_SECRET}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processNextJob();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Job processing failed", processed: 0 }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ready" });
}
