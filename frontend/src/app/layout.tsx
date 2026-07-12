import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { AntdRegistry } from "@/lib/antd";
import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EcoMerge AI – ESG Management Platform",
  description: "Enterprise-grade ESG management, carbon accounting, governance, and gamification portal.",
  icons: {
    icon: "/Euler-Img.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <QueryProvider>
          <AntdRegistry>
            <div id="root-layout">{children}</div>
          </AntdRegistry>
        </QueryProvider>
        {/* {process.env.NODE_ENV === "development" && (
          <StagewiseToolbar config={{ plugins: [] }} />
        )} */}
      </body>
    </html>
  );
}

