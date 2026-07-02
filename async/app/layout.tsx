import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Body font — clean, modern
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Terminal / accent font — everything monospace uses this
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AsynC — automation that runs while you sleep",
  description:
    "AI-powered automation for Indian startups. Bring your own keys, describe your workflow in plain English, and let the agent run it in the background.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrains.variable} bg-void text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
