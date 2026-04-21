import { NextResponse } from 'next/server';
import { rejectPage } from '../../../lib/notion';

export async function POST(request: Request) {
  try {
    const { pageId } = await request.json();
    if (!pageId) {
      return NextResponse.json({ error: 'ID da página é obrigatório.' }, { status: 400 });
    }

    await rejectPage(pageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reject route:', error);
    return NextResponse.json({ error: 'Erro ao reprovar conteúdo.' }, { status: 500 });
  }
}
