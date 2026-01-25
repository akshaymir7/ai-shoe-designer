// app/api/generate/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Increase if you generate large images / slower requests
export const maxDuration = 60;

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing OPENAI_API_KEY on server." },
        { status: 500 }
      );
    }

    const form = await req.formData();

    // These are the four uploads from the UI
    const accessory = form.get("accessory");
    const material = form.get("material");
    const sole = form.get("sole");
    const inspiration = form.get("inspiration");

    const prompt = asString(form.get("prompt"));

    // Require at least accessory + material
    if (!(accessory instanceof File) || !(material instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Accessory + Material are required." },
        { status: 400 }
      );
    }

    // Collect up to 4 images (OpenAI supports arrays of images for edits).  [oai_citation:1‡OpenAI Platform](https://platform.openai.com/docs/api-reference/images)
    const images: File[] = [accessory, material];
    if (sole instanceof File) images.push(sole);
    if (inspiration instanceof File) images.push(inspiration);

    // Build OpenAI multipart request
    const oai = new FormData();
    oai.append("model", "gpt-image-1.5");
    oai.append(
      "prompt",
      prompt?.trim() ||
        "Create a photorealistic shoe design using the reference images. Keep it realistic, studio product photo, clean background."
    );
    oai.append("size", "1024x1024");

    // IMPORTANT: use image[] for multiple images (per docs).  [oai_citation:2‡OpenAI Platform](https://platform.openai.com/docs/api-reference/images)
    for (const img of images) {
      oai.append("image[]", img, img.name || "ref.png");
    }

    const resp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: oai,
    });

    const rawText = await resp.text();

    if (!resp.ok) {
      // Return the raw OpenAI error text to help debugging
      return NextResponse.json(
        {
          ok: false,
          error: `OpenAI error (${resp.status}): ${rawText}`,
        },
        { status: 500 }
      );
    }

    // Parse JSON safely
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { ok: false, error: `OpenAI returned non-JSON: ${rawText.slice(0, 300)}` },
        { status: 500 }
      );
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64 || typeof b64 !== "string") {
      return NextResponse.json(
        { ok: false, error: "OpenAI response missing data[0].b64_json" },
        { status: 500 }
      );
    }

    // Standardized response for your frontend
    return NextResponse.json({
      ok: true,
      imageBase64: b64,
      imageDataUrl: `data:image/png;base64,${b64}`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}