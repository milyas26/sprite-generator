import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { rateLimit } from "@/lib/rate-limit";

const enhancePromptSchema = z.object({
  prompt: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`enhance:${ip}`, { window: 60_000, max: 20 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { prompt } = enhancePromptSchema.parse(body);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at writing descriptive pixel art prompts for AI image generation. " +
            "Take the user's short prompt and enhance it into a clear, vivid, and descriptive prompt " +
            "suitable for generating pixel art game sprites or assets. " +
            "Add relevant visual details: colors, shapes, textures, materials, lighting, silhouette. " +
            "Keep the enhanced prompt concise. " +
            "Preserve the original intent and any specific details the user mentioned. " +
            "Do NOT include phrases like 'pixel art of' or 'game asset of' or '8-bit' or '16-bit' — just describe what it looks like. " +
            "Output ONLY the enhanced prompt text, nothing else. No quotes, no markdown, no explanation.",
        },
        {
          role: "user",
          content: `Enhance this prompt to be more descriptive: "${prompt}"`,
        },
      ],
      max_completion_tokens: 500,
    });

    const enhanced = response.choices[0]?.message?.content?.trim() || prompt;

    return NextResponse.json({ enhanced });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Enhance prompt error:", error);
    const message = error?.message || error?.error?.message || "Unknown error";
    return NextResponse.json({ error: `Failed to enhance prompt: ${message}` }, { status: 500 });
  }
}
