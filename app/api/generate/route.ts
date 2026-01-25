import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const accessory = form.get("accessory");
    const material = form.get("material");
    const prompt = String(form.get("prompt") || "");

    if (!(accessory instanceof File) || !(material instanceof File)) {
      return NextResponse.json(
        { error: "Missing required files: accessory + material" },
        { status: 400 }
      );
    }

    // Pipeline test: return accessory image as the "result"
    const ab = await accessory.arrayBuffer();
    const b64 = Buffer.from(ab).toString("base64");
    const mime = accessory.type || "image/png";

    return NextResponse.json({
      imageBase64: `data:${mime};base64,${b64}`,
      debug: {
        prompt,
        accessoryName: accessory.name,
        materialName: material.name,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}