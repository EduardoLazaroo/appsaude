import { NextResponse } from 'next/server';

export function requireAdmin(request: Request) {
  // Em desenvolvimento local, não bloqueia o fluxo do MVP.
  // Em produção, habilite `ADMIN_TOKEN` e exija o header.
  if (process.env.NODE_ENV !== 'production') return null;

  const expected = process.env.ADMIN_TOKEN?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_TOKEN não configurado no servidor.' },
      { status: 500 },
    );
  }

  const provided = request.headers.get('x-admin-token')?.trim();
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  return null;
}

export function getClientIp(request: Request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

