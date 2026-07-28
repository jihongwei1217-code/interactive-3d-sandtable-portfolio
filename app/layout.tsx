import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D 沙盘实验室｜可交互开源模板",
  description: "可交互、可复制、可导入导出的 3D 沙盘系统公开演示模板。",
  other: {
    "codex-preview": "development",
  },
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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
