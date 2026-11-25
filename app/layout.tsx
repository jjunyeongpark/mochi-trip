import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모찌트립 · 설레는 일본 여행의 시작",
  description: "취향대로 발견하고, 동선까지 가볍게. 나만의 일본 여행 다이어리 모찌트립입니다.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
