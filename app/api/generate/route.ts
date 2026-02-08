// app/api/generate/route.ts
import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function badRequest(message: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { ok: false, error: message, ...(extra ?? {}) },
    { status: 400 }
  );
}

async function fileToOpenAIFile(f: File) {
  const ab = await f.arrayBuffer();
  const buf = Buffer.from(ab);
  return toFile(buf, f.name || "image", { type: f.type || "image/png" });
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return badRequest("Missing OPENAI_API_KEY on server (Vercel Environment Variables).");
    }

    const form = await req.formData();

    const accessory = form.get("accessory") as File | null;
    const material = form.get("material") as File | null;
    const sole = form.get("sole") as File | null;
    const inspiration = form.get("inspiration") as File | null;

    const prompt = String(form.get("prompt") ?? "").trim();
    const variationsRaw = form.get("variations");
    const n = Math.min(4, Math.max(1, Number(variationsRaw ?? 1)));

    if (!accessory || !material) {
      return badRequest("Accessory + Material are required.");
    }

    // Build the image array (2 required, 2 optional)
    const imageFiles: File[] = [accessory, material];
    if (sole) imageFiles.push(sole);
    if (inspiration) imageFiles.push(inspiration);

    const imagesForAPI = await Promise.all(imageFiles.map(fileToOpenAIFile));

    // IMPORTANT:
    // Variations endpoint only supports dall-e-2.
    // For "variations" here we generate multiple outputs (n) from the same edit request.
    const finalPrompt =
      prompt.length > 0
        ? prompt
        : "Create a clean, realistic studio product photo of a shoe design that combines the uploaded images. Keep materials faithful. White or neutral background.";

    const rsp = await client.images.edit({
      model: "gpt-image-1.5",
      image: imagesForAPI,
      prompt: finalPrompt,
      n,
      size: "1024x1024",
    });

    const dataUrls = (rsp.data ?? [])
      .map((d) => d.b64_json)
      .filter(Boolean)
      .map((b64) => `data:image/png;base64,${b64}`);

    if (dataUrls.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No image returned from API." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      images: dataUrls,
    });
  } catch (err: any) {
    // If Vercel/Next returns HTML (413 etc), the client might show "non-JSON"
    const msg = err?.message ?? "Unknown server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}