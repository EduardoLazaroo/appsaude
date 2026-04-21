import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { approvePage } from '@/lib/notion';

export async function POST(request: Request) {
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
