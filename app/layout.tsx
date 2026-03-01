import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReviNord — Revision tracking for medical students",
  description:
    "Track every topic you study. Know exactly when to return. ReviNord brings spaced repetition and quiet clarity to medical revision.",
  openGraph: {
    title: "ReviNord — Revision tracking for medical students",
    description:
      "Track every topic you study. Know exactly when to return. Spaced repetition, simplified.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
