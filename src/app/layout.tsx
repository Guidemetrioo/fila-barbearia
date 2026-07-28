import type { Metadata } from 'next';
import './globals.css';
import { QueueProvider } from '@/context/QueueContext';

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
        <meta name="theme-color" content="#FBB123" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Del Rey Fila" />
        <link rel="icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>
      <body>
        <QueueProvider>{children}</QueueProvider>
      </body>
    </html>
  );
}
