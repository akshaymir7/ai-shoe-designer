import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevents build-time evaluation on Vercel

export async function POST(req: Request) {
  try {
    // ✅ Ensure key exists (prevents Vercel build from crashing)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    // ✅ Instantiate OpenAI INSIDE the handler (important for Vercel)
    const openai = new OpenAI({ apiKey });

    // ✅ Read form-data
    const form = await req.formData();
    const prompt = String(form.get("prompt") || "").trim();

    // Expect ONE combined collage image coming from your UI (or single image)
    const image = form.get("image");

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    // ✅ Image edit (uses uploaded image as reference)
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
    const message =
      e?.response?.data?.error?.message ||
      e?.message ||
      "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}