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
  description:
    "Portfolio of Ridzkyan Buti Pratama (Kyan), a full-stack web developer building web apps with Next.js, React, TypeScript, and Tailwind CSS. Available for freelance web development.",
  keywords: [
    "Ridzkyan Buti Pratama",
    "Kyan",
    "Full-Stack Web Developer",
    "Next.js Developer",
    "React Developer",
    "TypeScript",
    "Freelance Web Developer",
  ],
  authors: [{ name: "Ridzkyan Buti Pratama" }],
  openGraph: {
    title: "Ridzkyan Buti Pratama — Full-Stack Web Developer",
    description:
      "Portfolio of Ridzkyan Buti Pratama (Kyan), a full-stack web developer building web apps with Next.js, React, TypeScript, and Tailwind CSS.",
    type: "website",
    locale: "en_US",
    siteName: "Ridzkyan Buti Pratama",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ridzkyan Buti Pratama — Full-Stack Web Developer",
    description:
      "Portfolio of Ridzkyan Buti Pratama (Kyan), a full-stack web developer building web apps with Next.js, React, TypeScript, and Tailwind CSS.",
  },
};

// Anti-FOUC: set theme class before first paint (pola sama dengan referensi).
const themeInit = `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=s?s==='dark':m;document.documentElement.classList.toggle('dark',dark);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={`${GeistSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white text-gray-900 dark:bg-ink dark:text-white min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
