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
  title: "L2 Versus — Servidor Lineage 2 Interlude",
  description:
    "L2 Versus — servidor privado de Lineage 2. Interlude com conteúdo High Five, eventos automáticos, itens custom e economia equilibrada.",
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
