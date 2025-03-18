import type {Metadata} from "next";

import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + Mercado Pago",
  description: "Como integrar Mercado Pago en una aplicación Next.js - By Goncy",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="container m-auto grid min-h-screen max-w-screen-sm grid-rows-[auto_1fr_auto] px-4 font-sans antialiased">
        <header className="text-xl leading-[4rem] font-bold">
          <Link href="/">Next.js + Mercado Pago</Link>
        </header>
        <main className="py-4">{children}</main>
        <footer className="text-center leading-[4rem] opacity-70">
          © {new Date().getFullYear()} Next.js + Mercado Pago
        </footer>
      </body>
    </html>
  );
}
