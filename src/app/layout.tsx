import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { TickerBar } from "@/components/ticker-bar";

export const metadata: Metadata = {
  title: "AI Safety Rage Quit Tracker",
  description:
    "Tracking AI safety researchers publicly leaving OpenAI, Anthropic, and Google DeepMind",
  openGraph: {
    title: "AI Safety Rage Quit Tracker",
    description:
      "Tracking AI safety researchers publicly leaving OpenAI, Anthropic, and Google DeepMind",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-primary text-text-primary font-mono antialiased">
        <Nav />
        <TickerBar />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
