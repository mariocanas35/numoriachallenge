import { createServerClient } from '@numoria/database/server';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Logout endpoint.
 *
 * Acepta GET y POST. POST es preferido (no es idempotente — termina sesión)
 * pero GET funciona para enlaces simples.
 */
async function handleLogout(request: NextRequest) {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${request.nextUrl.origin}/`);
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}
