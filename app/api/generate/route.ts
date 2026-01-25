import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const prompt = String(form.get("prompt") || "").trim();
    const image = form.get("image");
    const nRaw = form.get("n");
    const n = Math.min(
      8,
      Math.max(1, Number(String(nRaw ?? "1")) || 1)
    );

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    // Image edit (uses uploaded image as reference)
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: [image],
      prompt,
      size: "1024x1024",
      // If supported by your SDK/model, this returns multiple images
      // (If not supported, you'll get a clear error which we'll handle below)
      n,
    } as any);

    const imagesBase64 =
      (result as any)?.data
        ?.map((x: any) => x?.b64_json)
        ?.filter(Boolean) ?? [];

    if (!imagesBase64.length) {
      return NextResponse.json({ error: "No image returned" }, { status: 500 });
    }

    // Backward compatible:
    // - if n === 1 -> { imageBase64 }
    // - if n > 1  -> { imagesBase64 }
    if (n === 1) {
      return NextResponse.json({ imageBase64: imagesBase64[0] });
    }
    return NextResponse.json({ imagesBase64 });
  } catch (e: any) {
    // Improve error visibility (without leaking secrets)
    const msg = e?.message ?? "Unknown error";
    const status = e?.status ?? e?.response?.status ?? 500;

    return NextResponse.json(
      {
        error: msg,
        status,
        hint:
          status === 401
            ? "Bad/empty API key. Check OPENAI_API_KEY in .env.local and restart dev server."
            : status === 403
            ? "Org/model access issue (verification / permissions)."
            : status === 429
            ? "Rate limit. Try again in a bit."
            : status === 400
            ? "Bad request. Check prompt/image size/type."
            : undefined,
      },
      { status: Number(status) || 500 }
    );
  }
}