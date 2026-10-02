import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Ridzkyan Buti Pratama — Full-Stack Web Developer",
  description: "Fresh graduate in Informatics Engineering building web apps with Next.js, React, TypeScript, and Tailwind CSS. Available for freelance web development.",
  openGraph: {
    title: "Ridzkyan Buti Pratama — Full-Stack Web Developer",
    description: "Fresh graduate in Informatics Engineering building web apps with Next.js, React, TypeScript, and Tailwind CSS. Available for freelance web development.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${GeistSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900 min-h-screen flex flex-col justify-between`}>
        {children}
      </body>
    </html>
  );
}
