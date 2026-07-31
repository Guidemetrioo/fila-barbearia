import type { Metadata } from 'next';
import './globals.css';
import { QueueProvider } from '@/context/QueueContext';
import { LayoutProvider } from '@/context/LayoutContext';

export const metadata: Metadata = {
  title: 'Barbearia Del Rey - Fila Online em Tempo Real',
  description:
    'Acompanhe a fila de espera da Barbearia Del Rey em tempo real. Entre na fila pelo celular, sem precisar baixar nada. Mais que um corte, uma experiência real.',
  keywords: 'barbearia, fila online, corte de cabelo, barba, del rey, fila tempo real',
  authors: [{ name: 'Barbearia Del Rey' }],
  openGraph: {
    title: 'Barbearia Del Rey - Fila Online em Tempo Real',
    description: 'Acompanhe a fila de espera da Barbearia Del Rey em tempo real.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#d4af37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Del Rey Fila" />
        <link rel="icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;600;700;800&family=Oswald:wght@500;600;700&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LayoutProvider>
          <QueueProvider>{children}</QueueProvider>
        </LayoutProvider>
      </body>
    </html>
  );
}
