import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {AntdRegistry} from "@ant-design/nextjs-registry"; // 解决页面加载闪烁

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dw Chat",
  description: "Dw Chat App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body  className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}
