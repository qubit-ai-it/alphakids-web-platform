import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'AlphaKids | Aprendizaje de palabras que cobra vida',
  description:
    'Kit físico + app inteligente con cámara, OCR y voz. Los niños aprenden palabras jugando, sin internet y sin pantallas todo el día.',
  openGraph: {
    title: 'AlphaKids | Aprendizaje de palabras que cobra vida',
    description:
      'Kit físico + app inteligente con cámara, OCR y voz. Los niños aprenden palabras jugando, sin internet y sin pantallas todo el día.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'AlphaKids',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
