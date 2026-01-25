import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const prompt = formData.get("prompt");
    const image = formData.get("image");

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Missing image" },
        { status: 400 }
      );
    }

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: [image],
      prompt,
      size: "1024x1024",
    });

    const b64 = result.data[0]?.b64_json;

    if (!b64) {
      return NextResponse.json(
        { error: "No image returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageBase64: b64 });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}