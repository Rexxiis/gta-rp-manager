import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "./components/AppShell";
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
  title: "GTA RP Manager",
  description: "Gestion financière et logistique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-slate-950 text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}