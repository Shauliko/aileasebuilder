import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.length < 5) {
      return NextResponse.json(
        { error: "Prompt too short" },
        { status: 400 }
      );
    }

    // ==== Generate the image via OpenAI ====
    const dalleRes = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1", // DALL·E 3 / latest
          prompt,
          size: "1024x1024",
        }),
      }
    );

    const dalleData = await dalleRes.json();

    if (!dalleData.data?.[0]?.url) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    // return direct image URL from OpenAI
    return NextResponse.json({
      url: dalleData.data[0].url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AI image generation failed" },
      { status: 500 }
    );
  }
}
