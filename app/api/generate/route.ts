import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevent static optimization/build-time evaluation

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Important: fail only when the route is actually called (not during build)
    throw new Error(
      "Missing OPENAI_API_KEY. Add it in Vercel Project Settings → Environment Variables."
    );
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const prompt = String(form.get("prompt") || "").trim();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Accept up to 4 images (your 4-box UI)
    const keys = ["part1", "part2", "part3", "part4"];
    const images: File[] = [];

    for (const k of keys) {
      const v = form.get(k);
      if (v instanceof File && v.size > 0) images.push(v);
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: "Missing image file(s). Upload at least one part image." },
        { status: 400 }
      );
    }

    // Optional: if you still send a single "image" key from older UI, accept it too
    const legacy = form.get("image");
    if (images.length === 0 && legacy instanceof File && legacy.size > 0) {
      images.push(legacy);
    }

    const openai = getOpenAIClient();

    // IMPORTANT:
    // - If you pass images, use images.edit (image-to-image style generation)
    // - We don't need a mask for this "reference board" workflow
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: images, // array of Files
      prompt,
      size: "1024x1024",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "No image returned from model." },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageBase64: b64 });
  } catch (e: any) {
    const msg = e?.message || "Unknown error";

    // If OpenAI SDK throws a structured error sometimes it includes status
    const status =
      typeof e?.status === "number"
        ? e.status
        : msg.toLowerCase().includes("missing openai_api_key")
        ? 500
        : 500;

    return NextResponse.json({ error: msg }, { status });
  }
}