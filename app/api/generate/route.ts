import { NextResponse } from 'next/server';
import { getPageById, getRecentThemes, updatePageContent } from '../../../lib/notion';
import { generatePostDraft } from '../../../lib/openai';

export async function POST(request: Request) {
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
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao gerar conteúdo.' }, { status: 500 });
  }
}
