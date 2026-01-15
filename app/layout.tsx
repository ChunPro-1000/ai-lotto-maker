import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 꿈해석 로또번호 추천기",
  description: "AI가 당신의 꿈을 해석하고 로또번호를 알려드립니다.",
  keywords: ["AI", "꿈해석", "로또", "로또번호", "추천", "꿈", "해석", "동양사상"],
  authors: [{ name: "Brain Chun" }],
  creator: "Brain Chun",
  publisher: "Brain Chun",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "AI 꿈해석 로또번호 추천기",
    description: "AI가 당신의 꿈을 해석하고 로또번호를 알려드립니다.",
    siteName: "AI 꿈해석 로또번호 추천기",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 꿈해석 로또번호 추천기",
    description: "AI가 당신의 꿈을 해석하고 로또번호를 알려드립니다.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
