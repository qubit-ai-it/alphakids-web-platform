import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AlphaKids",
  description: "Plataforma educativa para niños",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={onest.variable}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
