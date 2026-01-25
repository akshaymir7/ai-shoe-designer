// app/api/generate/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickBaseImage(files: {
  accessory?: File | null;
  material?: File | null;
  sole?: File | null;
  inspiration?: File | null;
}) {
  // Priority: inspiration -> material -> accessory -> sole
  return files.inspiration ?? files.material ?? files.accessory ?? files.sole ?? null;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    const form = await req.formData();

    const prompt = String(form.get("prompt") ?? "").trim();
    const accessory = form.get("accessory") as File | null;
    const material = form.get("material") as File | null;
    const sole = form.get("sole") as File | null;
    const inspiration = form.get("inspiration") as File | null;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const baseImage = pickBaseImage({ accessory, material, sole, inspiration });
    if (!baseImage) {
      return NextResponse.json(
        { error: "Please upload at least one image (Accessory/Material/Sole/Inspiration)." },
        { status: 400 }
      );
    }

    // Build a stronger design prompt using whichever uploads are present.
    const enrichedPrompt = [
      "Design a single shoe concept image (clean studio product shot).",
      "Focus on a commercially viable, modern fashion product.",
      "Keep the background minimal, neutral, and premium.",
      "",
      "User intent / requirements:",
      prompt,
      "",
      `Uploads provided:`,
      `- Accessory: ${accessory ? accessory.name : "none"}`,
      `- Material: ${material ? material.name : "none"}`,
      `- Sole/Bottom: ${sole ? sole.name : "none"}`,
      `- Inspiration: ${inspiration ? inspiration.name : "none"}`,
      "",
      "Output requirements:",
      "- One high-quality product render/photo-like image",
      "- Shoe centered, full view, good lighting",
      "- Avoid text, logos, watermarks",
    ].join("\n");

    // Use OpenAI Images Edits with a base image
    const openaiForm = new FormData();
    openaiForm.append("model", "gpt-image-1");
    openaiForm.append("prompt", enrichedPrompt);
    openaiForm.append("image", baseImage, baseImage.name);
    openaiForm.append("size", "1024x1024");

    const resp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openaiForm,
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      const msg =
        (data && (data.error?.message || data.message)) ||
        `OpenAI request failed with status ${resp.status}`;
      return NextResponse.json({ error: msg, raw: data }, { status: 500 });
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "OpenAI did not return an image (missing b64_json).", raw: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageBase64: b64 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}