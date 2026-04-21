import './globals.css';

export const metadata = {
  title: 'Central de Conteúdo Saúde Preventiva',
  description: 'MVP para gerar posts usando Notion e OpenAI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
