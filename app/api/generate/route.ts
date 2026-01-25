// app/api/generate/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OpenAIImageEditResponse = {
  data?: Array<{ b64_json?: string }>;
  error?: { message?: string; type?: string; code?: string };
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY on the server (Vercel env or .env.local)." },
        { status: 500 }
      );
    }

    const incoming = await req.formData();

    // We accept either naming style:
    // part1..part4  OR  accessory/material/sole/inspiration
    const prompt =
      (incoming.get("prompt")?.toString() ?? "").trim() ||
      "Design a photorealistic shoe using the provided reference images.";

    const pickFile = (keys: string[]) => {
      for (const k of keys) {
        const v = incoming.get(k);
        if (v instanceof File && v.size > 0) return v;
      }
      return null;
    };

    const part1 = pickFile(["part1", "accessory"]);
    const part2 = pickFile(["part2", "material"]);
    const part3 = pickFile(["part3", "sole"]);
    const part4 = pickFile(["part4", "inspiration"]);

    // Require at least Accessory + Material (your UI requirement)
    if (!part1 || !part2) {
      return Response.json(
        { error: "Please upload Accessory (part1) and Material (part2)." },
        { status: 400 }
      );
    }

    // Build OpenAI multipart form-data for /v1/images/edits
    // Multiple input images are sent as image[] fields.  [oai_citation:0‡OpenAI Platform](https://platform.openai.com/docs/guides/image-generation)
    const fd = new FormData();
    fd.append("model", "gpt-image-1"); // GPT Image model  [oai_citation:1‡OpenAI Platform](https://platform.openai.com/docs/guides/image-generation)
    fd.append("prompt", prompt);

    // Optional knobs (safe defaults)
    fd.append("size", "1024x1024");
    // fd.append("background", "auto");
    // fd.append("n", "1");

    // Order matters a bit (first image is the “base” in some edit flows)
    fd.append("image[]", part1);
    fd.append("image[]", part2);
    if (part3) fd.append("image[]", part3);
    if (part4) fd.append("image[]", part4);

    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: fd,
    });

    const requestId = r.headers.get("x-request-id") || undefined;

    const json = (await r.json()) as OpenAIImageEditResponse;

    if (!r.ok) {
      return Response.json(
        {
          error: json?.error?.message || `OpenAI error (status ${r.status})`,
          requestId,
        },
        { status: r.status }
      );
    }

    const imageBase64 = json?.data?.[0]?.b64_json;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return Response.json(
        {
          error:
            "OpenAI response did not include base64 image data (b64_json). Check model/endpoint response shape.",
          requestId,
        },
        { status: 502 }
      );
    }

    // IMPORTANT: Always return this exact shape for your UI
    return Response.json({ imageBase64, requestId });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Unexpected server error." },
      { status: 500 }
    );
  }
}