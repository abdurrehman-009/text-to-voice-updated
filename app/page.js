"use client";

import { useEffect, useState } from "react";

const VOICES = ["hannah", "autumn", "diana", "austin", "daniel", "troy"];

export default function Home() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("hannah");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Free the old audio blob when a new one is created or the page closes
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function generateVoice() {
    setError("");
    setAudioUrl("");

    if (!text.trim()) {
      setError("Please enter some text.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        let message = "Something went wrong.";
        try {
          const data = await response.json();
          message = data.error || message;
        } catch {}
        throw new Error(message);
      }

      const audioBlob = await response.blob();
      setAudioUrl(URL.createObjectURL(audioBlob));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Text to Voice Generator</h1>

        <p>Enter your text and generate voice using Groq AI.</p>

        <select
          className="voice-select"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          disabled={loading}
        >
          {VOICES.map((v) => (
            <option key={v} value={v}>
              Voice: {v.charAt(0).toUpperCase() + v.slice(1)}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Enter your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
        />

        <div className="counter">{text.length}/200</div>

        <button onClick={generateVoice} disabled={loading}>
          {loading ? "Generating voice..." : "Generate Voice"}
        </button>

        {error && <div className="error">{error}</div>}

        {audioUrl && (
          <div className="audio-section">
            <h2>Your Voice</h2>
            <audio controls src={audioUrl} />
            <a href={audioUrl} download="generated-voice.wav" className="download">
              Download Audio
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
