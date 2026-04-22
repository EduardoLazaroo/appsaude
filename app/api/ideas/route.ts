import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { queryIdeas } from '@/lib/notion';
import { getClientIp, requireAdmin } from '@/lib/admin';
import { rateLimitOrNull } from '@/lib/rateLimit';

export async function GET(request: Request) {
  // Protege a leitura do seu banco do Notion.
  // Se você quiser expor publicamente, basta remover isso.
  const auth = requireAdmin(request);
  if (auth) return auth;

  const ip = getClientIp(request);
  const limited = rateLimitOrNull({ key: `ideas:${ip}`, limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const ideas = await queryIdeas();
    return NextResponse.json(ideas);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar ideias no Notion.' }, { status: 500 });
  }
}
