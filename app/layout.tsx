import type { Metadata } from "next";
import { Cinzel, Barlow } from "next/font/google";
import "./globals.css";

// Display: serif de inscricao (epico / L2). Pesos altos p/ nao ficar fino.
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

// Corpo/UI: sturdy, alta legibilidade, otimo peso.
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.l2versus.com"),
  title: "L2 Versus — Servidor Lineage 2 High Five",
  description:
    "L2 Versus — servidor privado de Lineage 2, crônica High Five (Chaotic Throne 2.6). Eventos automáticos, itens custom, zonas de farm próprias e economia equilibrada.",
  openGraph: {
    type: "website",
    url: "https://www.l2versus.com",
    siteName: "L2 Versus",
    title: "L2 Versus — Servidor Lineage 2",
    description:
      "Servidor privado de Lineage 2 — eventos automáticos, itens custom e economia equilibrada. Entre na luta.",
    locale: "pt_BR",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "L2 Versus — Lineage 2",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "L2 Versus — Servidor Lineage 2",
    description:
      "Servidor privado de Lineage 2 — eventos automáticos, itens custom e economia equilibrada.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
