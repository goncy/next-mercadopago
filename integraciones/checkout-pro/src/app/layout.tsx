import type {Metadata} from "next";

import {Geist} from "next/font/google";
import Link from "next/link";

import "./globals.css";

const geist = Geist({subsets: ["latin"], variable: "--font-geist"});

export const metadata: Metadata = {
  title: "Next.js + Mercado Pago",
  description: "Como integrar Mercado Pago en una aplicación Next.js - By Goncy",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html className={geist.variable} lang="en">
      <body className="container m-auto grid min-h-screen max-w-screen-sm grid-rows-[auto_1fr_auto] px-4 font-sans antialiased">
        <header className="flex h-16 items-center border-b border-neutral-800 font-semibold">
          <Link href="/">▲ Next.js + Mercado Pago</Link>
        </header>
        <main className="py-8">{children}</main>
        <footer className="flex h-16 items-center justify-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Next.js + Mercado Pago
        </footer>
      </body>
    </html>
  );
}
