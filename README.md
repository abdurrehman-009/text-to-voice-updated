# Text to Voice Generator

Next.js app that turns text (up to 200 characters) into speech with Groq's Orpheus model.

## Setup
1. `npm install`
2. Put your real key in `.env.local`:  `GROQ_API_KEY=your_key`
3. In the Groq console Playground, open `canopylabs/orpheus-v1-english` and accept the terms (one time).
4. `npm run dev` and open http://localhost:3000

## Deploy (Vercel)
Add `GROQ_API_KEY` under Project Settings -> Environment Variables. `.env.local` is not pushed to GitHub.
