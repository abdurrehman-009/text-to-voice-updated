// Text-to-speech API route using Groq's Orpheus model.
// Calls the Groq REST API directly with fetch (no groq-sdk needed).

const ALLOWED_VOICES = ["autumn", "diana", "hannah", "austin", "daniel", "troy"];
const MAX_CHARACTERS = 200;

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
  try {
    // 1. Parse the request body
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid request.", 400);
    }

    const { text, voice } = body || {};

    // 2. Validate the text
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return jsonError("Please enter some text.", 400);
    }

    if (text.length > MAX_CHARACTERS) {
      return jsonError(`Text must be ${MAX_CHARACTERS} characters or less.`, 400);
    }

    // 3. Validate the voice (falls back to "hannah")
    const selectedVoice =
      typeof voice === "string" && ALLOWED_VOICES.includes(voice.toLowerCase())
        ? voice.toLowerCase()
        : "hannah";

    // 4. Check the API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith("paste_your")) {
      console.error("GROQ_API_KEY is missing or still a placeholder in .env.local");
      return jsonError("GROQ_API_KEY is not configured on the server.", 500);
    }

    // 5. Call the Groq speech API
    let groqResponse;
    try {
      groqResponse = await fetch("https://api.groq.com/openai/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "canopylabs/orpheus-v1-english",
          voice: selectedVoice,
          input: text.trim(),
          response_format: "wav",
        }),
      });
    } catch (networkError) {
      console.error("Groq TTS network error:", networkError);
      return jsonError("Could not reach the voice service. Please try again.", 502);
    }

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq TTS error:", groqResponse.status, errText);

      if (errText.includes("model_terms_required") || errText.toLowerCase().includes("terms")) {
        return jsonError(
          "Please accept the model terms for canopylabs/orpheus-v1-english in the Groq console Playground, then try again.",
          502
        );
      }
      if (groqResponse.status === 401) {
        return jsonError("Invalid GROQ_API_KEY. Check your .env.local file.", 502);
      }
      if (groqResponse.status === 429) {
        return jsonError("Rate limit reached. Please wait a moment and try again.", 502);
      }
      return jsonError(
        "Something went wrong while generating the voice. Please try again.",
        502
      );
    }

    // 6. Return the audio as WAV
    const buffer = Buffer.from(await groqResponse.arrayBuffer());

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Unexpected TTS route error:", error);
    return jsonError("An unexpected error occurred. Please try again.", 500);
  }
}
