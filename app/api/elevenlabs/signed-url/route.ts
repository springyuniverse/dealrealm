import { NextResponse } from "next/server";

export async function GET() {
  const agentId = "Dx3gJ4TcAfCOMeOEcjmW"
  const apiKey = "sk_836106526ec9a4b9477c9848147f9c755510d5edf8cde1f7"

  if (!agentId || !apiKey) {
    return NextResponse.json(
      { error: "Missing ElevenLabs environment variables" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get signed URL", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error("Error getting signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
