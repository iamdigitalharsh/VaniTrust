import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VaniTrust | High-Stakes Vernacular Voice AI with Guardrails",
  description: "Multilingual Voice AI powered by Sarvam and real-time hallucination verification by Failproof AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

