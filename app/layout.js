import "./globals.css";

export const metadata = {
  title: "Text to Voice Generator",
  description: "Generate voice from text using Groq AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
