import type { Metadata } from "next";
import Link from "next/link";
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
  title: "GTA RP Manager",
  description: "Gestion financière et logistique",
};

const menuItems = [
  { name: "📊 Dashboard", href: "/dashboard" },
  { name: "👥 Effectifs", href: "/effectifs" },
  { name: "🏦 Banques", href: "/banques" },
  { name: "📦 Stockages", href: "/stockages" },
  { name: "🤝 Groupes", href: "/groupes" },
  { name: "💰 Transactions", href: "/transactions" },
  { name: "📈 Patrimoine", href: "/patrimoine" },
  { name: "🧼 Blanchiment", href: "/blanchiment" },
  { name: "📜 Historique", href: "/historique" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-slate-950 text-white">
        <div className="flex min-h-screen">
          <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6">
            <h1 className="text-2xl font-bold mb-8">
              GTA RP Manager
            </h1>

            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-3 rounded-lg hover:bg-slate-800 transition"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}