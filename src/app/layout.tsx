import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Nunito } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const nunito = Nunito({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["800"],
});

export const metadata: Metadata = {
  title: "OKnautic — Yacht Parts Marketplace",
  description: "B2B/B2C marketplace for marine equipment and yacht parts",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  return (
    <html
      lang="ru"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand-50">
        <CartProvider>
          <Header user={user} role={profile?.role ?? "customer"} />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
