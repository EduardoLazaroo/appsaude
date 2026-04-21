import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { queryIdeas } from '@/lib/notion';

export async function GET() {
  try {
    const ideas = await queryIdeas();
    return NextResponse.json(ideas);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar ideias no Notion.' }, { status: 500 });
  }
}
