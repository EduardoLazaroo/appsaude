import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { getPageById, getRecentThemes, updatePageContent } from '@/lib/notion';
import { generatePostDraft } from '@/lib/openai';
import { getClientIp, requireAdmin } from '@/lib/admin';
import { rateLimitOrNull } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const ip = getClientIp(request);
  const limited = rateLimitOrNull({ key: `generate:${ip}`, limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const pageId = body?.pageId;
    if (!pageId) {
      return NextResponse.json({ error: 'pageId é obrigatório.' }, { status: 400 });
    }

    const page = await getPageById(pageId);
    const recentThemes = await getRecentThemes();
    const text = await generatePostDraft(page.theme, page.subtheme, recentThemes);

    await updatePageContent(pageId, text);
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao gerar conteúdo.' }, { status: 500 });
  }
}
