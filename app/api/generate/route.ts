// app/api/generate/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // important for file handling

function fileTypeOk(file: File) {
  // Allow jpg/png/webp
  const okTypes = ["image/jpeg", "image/png", "image/webp"];
  return okTypes.includes(file.type);
}

async function fileToBase64(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return { base64, mime: file.type, name: file.name };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const accessory = form.get("accessory") as File | null;
    const material = form.get("material") as File | null;
    const sole = form.get("sole") as File | null;
    const inspiration = form.get("inspiration") as File | null;
    const prompt = (form.get("prompt") as string | null) ?? "";

    // Required
    if (!accessory || !material) {
      return NextResponse.json(
        { error: "Please upload Accessory and Material." },
        { status: 400 }
      );
    }

    // Type validation (this is where your WEBP likely fails today)
    const files = [
      ["accessory", accessory],
      ["material", material],
      ["sole", sole],
      ["inspiration", inspiration],
    ] as const;

    for (const [key, f] of files) {
      if (!f) continue;
      if (!(f instanceof File)) {
        return NextResponse.json(
          { error: `${key} is not a valid file.` },
          { status: 400 }
        );
      }
      if (!fileTypeOk(f)) {
        return NextResponse.json(
          {
            error: `${key} must be JPG, PNG, or WEBP. Got: ${f.type || "unknown"}`,
          },
          { status: 400 }
        );
      }
    }

    // Convert files (you can pass these into whatever OpenAI call you already have)
    const accessoryB64 = await fileToBase64(accessory);
    const materialB64 = await fileToBase64(material);
    const soleB64 = sole ? await fileToBase64(sole) : null;
    const inspirationB64 = inspiration ? await fileToBase64(inspiration) : null;

    // ✅ TEMP: return debug payload so you can confirm inputs on Vercel
    // Once confirmed, replace this block with your OpenAI call.
    return NextResponse.json({
      ok: true,
      prompt,
      received: {
        accessory: { name: accessoryB64.name, mime: accessoryB64.mime, size: accessory.size },
        material: { name: materialB64.name, mime: materialB64.mime, size: material.size },
        sole: soleB64 ? { name: soleB64.name, mime: soleB64.mime, size: sole!.size } : null,
        inspiration: inspirationB64
          ? { name: inspirationB64.name, mime: inspirationB64.mime, size: inspiration!.size }
          : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}