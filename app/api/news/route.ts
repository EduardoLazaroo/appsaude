import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { fetchLatestNews } from '@/lib/rss';
import { getClientIp, requireAdmin } from '@/lib/admin';
import { rateLimitOrNull } from '@/lib/rateLimit';

export async function GET(request: Request) {
  // Notícias podem ser públicas, mas como padrão protegemos tudo para evitar abuso.
  // Remova as 2 linhas abaixo se quiser deixar público.
  const auth = requireAdmin(request);
  if (auth) return auth;

  const ip = getClientIp(request);
  const limited = rateLimitOrNull({ key: `news:${ip}`, limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const news = await fetchLatestNews();
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error in news route:', error);
    return NextResponse.json({ error: 'Erro ao buscar notícias do feed RSS.' }, { status: 500 });
  }
}
