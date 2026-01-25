// app/api/generate/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // important for file/form handling on Vercel

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY env var on server." },
        { status: 500 }
      );
    }

    // Expecting multipart/form-data from the browser
    const incoming = await req.formData();

    const prompt = (incoming.get("prompt") || "").toString().trim();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
    }

    // Optional images (0–4)
    const keys = ["accessory", "material", "sole", "inspiration"] as const;
    const images: File[] = [];

    for (const k of keys) {
      const v = incoming.get(k);
      if (v && v instanceof File && v.size > 0) images.push(v);
    }

    // Build OpenAI Images Edit request (supports multiple images)
    const body = new FormData();
    body.append("model", "gpt-image-1.5");
    body.append("prompt", prompt);
    body.append("n", "1");
    body.append("size", "1024x1024");

    // If you want higher fidelity when using gpt-image-1 (not 1.5), you can set:
    // body.append("input_fidelity", "high");

    // Docs accept image as array; using image[] works (curl examples show this)
    for (const img of images) {
      body.append("image[]", img, img.name || "input.png");
    }

    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body,
    });

    const requestId = r.headers.get("x-request-id") || undefined;
    const data = await r.json();

    if (!r.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            data?.error ||
            "OpenAI request failed (see server logs).",
          requestId,
        },
        { status: r.status }
      );
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "No image returned from OpenAI.", requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageBase64: b64,
      requestId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error." },
      { status: 500 }
    );
  }
}