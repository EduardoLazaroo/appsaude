import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { createPreformedPage } from '@/lib/notion';
import { getClientIp, requireAdmin } from '@/lib/admin';
import { rateLimitOrNull } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const ip = getClientIp(request);
  const limited = rateLimitOrNull({ key: `ideas-create:${ip}`, limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { theme, text } = body;

    if (!theme || !text) {
      return NextResponse.json({ error: 'Tema e texto são obrigatórios.' }, { status: 400 });
    }

    await createPreformedPage(theme, text);
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Post adicionado à base.' });
  } catch (error) {
    console.error('Create idea error:', error);
    return NextResponse.json({ error: 'Falha ao adicionar o post à base.' }, { status: 500 });
  }
}
