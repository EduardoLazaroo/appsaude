import './globals.css';

export const metadata = {
  title: 'Central de Saúde Preventiva',
  description: 'Crie e aprove conteúdos para LinkedIn com a ajuda de IA.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#ff75b6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
