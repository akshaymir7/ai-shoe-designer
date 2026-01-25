// app/api/generate/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// (optional) helps on Vercel if generation takes time
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const prompt = String(form.get("prompt") || "").trim();
    const image = form.get("image");

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // IMPORTANT: don't throw here (build-time safety). Return a clear runtime error.
      return NextResponse.json(
        { error: "Missing credentials. Set OPENAI_API_KEY in Environment Variables and redeploy." },
        { status: 500 }
      );
    }

    // Create client INSIDE handler so Vercel build never fails if env is missing
    const openai = new OpenAI({ apiKey });

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: [image],
      prompt,
      size: "1024x1024",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "No image returned" }, { status: 500 });
    }

    return NextResponse.json({ imageBase64: b64, ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}