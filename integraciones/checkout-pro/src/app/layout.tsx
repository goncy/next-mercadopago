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
      <body className="container m-auto max-w-screen-sm px-4 antialiased">
        <header className="flex h-16 items-center border-b border-neutral-800 font-semibold">
          <Link href="/">Next.js + Mercado Pago (Checkout Pro)</Link>
        </header>
        <main className="py-8">{children}</main>
      </body>
    </html>
  );
}
