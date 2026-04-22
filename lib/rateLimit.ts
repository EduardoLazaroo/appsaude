import { NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimitOrNull(params: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = buckets.get(params.key);

  if (!current || now >= current.resetAt) {
    buckets.set(params.key, { count: 1, resetAt: now + params.windowMs });
    return null;
  }

  if (current.count >= params.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em instantes.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      },
    );
  }

  current.count += 1;
  buckets.set(params.key, current);
  return null;
}