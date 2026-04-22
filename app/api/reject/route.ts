import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { rejectPage } from '@/lib/notion';
import { getClientIp, requireAdmin } from '@/lib/admin';
import { rateLimitOrNull } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const ip = getClientIp(request);
  const limited = rateLimitOrNull({ key: `reject:${ip}`, limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { pageId } = await request.json();
    if (!pageId) {
      return NextResponse.json({ error: 'ID da página é obrigatório.' }, { status: 400 });
    }

    await rejectPage(pageId);
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reject route:', error);
    return NextResponse.json({ error: 'Erro ao reprovar conteúdo.' }, { status: 500 });
  }
}
