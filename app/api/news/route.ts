import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { fetchLatestNews } from '@/lib/rss';

export async function GET() {
  try {
    const news = await fetchLatestNews();
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error in news route:', error);
    return NextResponse.json({ error: 'Erro ao buscar notícias do feed RSS.' }, { status: 500 });
  }
}
