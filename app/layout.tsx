import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import GridBackground from "@/components/GridBackground";
import CursorGlow from "@/components/CursorGlow";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cypra — Log Intelligence for AI Agents",
  description:
    "Compress millions of log lines into structured IncidentCapsules. 95% fewer tokens. Same signal. Built for AI coding agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col">
        <GridBackground />
        <CursorGlow />
        <ScrollReveal />
        <Nav />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
