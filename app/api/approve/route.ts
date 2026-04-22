import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { approvePage } from '@/lib/notion';
import { getClientIp, requireAdmin } from '@/lib/admin';
import { rateLimitOrNull } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const ip = getClientIp(request);
  const limited = rateLimitOrNull({ key: `approve:${ip}`, limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const pageId = body?.pageId;
    if (!pageId) {
      return NextResponse.json({ error: 'pageId é obrigatório.' }, { status: 400 });
    }

    await approvePage(pageId);
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao aprovar conteúdo.' }, { status: 500 });
  }
}
