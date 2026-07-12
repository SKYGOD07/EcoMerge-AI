import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
// import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { AntdRegistry } from "@/lib/antd";
import QueryProvider from "@/components/providers/QueryProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
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
      <body className={`${outfit.variable} font-sans antialiased bg-[#030408] text-slate-100`}>
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

