'use server';

import { createServerClient } from '@numoria/database/server';
import { defaultLocale } from '@numoria/i18n';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

/**
 * Server Actions de autenticación.
 *
 * Funcionan tanto desde Client Components (via <form action={action}>)
 * como invocadas directamente desde otros server contexts.
 */

// ============================================================
// SCHEMAS — validación con Zod
// ============================================================

const emailSchema = z.string().trim().toLowerCase().email();

const signInSchema = z.object({
  email: emailSchema,
  next: z.string().optional(),
});

const signUpSchema = z.object({
  email: emailSchema,
  display_name: z.string().trim().min(1).max(100),
  role: z.enum(['student', 'parent', 'teacher']),
  locale: z.enum(['es', 'en']).optional(),
  country_code: z.string().length(2).optional(),
  next: z.string().optional(),
});

// ============================================================
// HELPERS
// ============================================================

async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export interface AuthActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

// ============================================================
// SIGN IN — Magic link (login de usuario existente)
// ============================================================

export async function signInWithEmail(formData: FormData): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    next: formData.get('next'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, next } = parsed.data;
  const supabase = await createServerClient();
  const origin = await getOrigin();
  const callbackUrl = `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: false, // login únicamente — no crea cuenta
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

// ============================================================
// SIGN UP — Crear cuenta nueva con magic link
// ============================================================

export async function signUpWithEmail(formData: FormData): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    display_name: formData.get('display_name'),
    role: formData.get('role'),
    locale: formData.get('locale') ?? undefined,
    country_code: formData.get('country_code') ?? undefined,
    next: formData.get('next'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, display_name, role, locale, country_code, next } = parsed.data;
  const supabase = await createServerClient();
  const origin = await getOrigin();
  const callbackUrl = `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: true, // crea usuario si no existe
      data: {
        display_name,
        role,
        locale: locale ?? defaultLocale,
        country_code,
      },
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

// ============================================================
// VERIFY EMAIL OTP — Canjea el código de 6 dígitos por una sesión
//
// Bypassa el bug de PKCE callback (ADR 0004) — verifyOtp no necesita el
// cookie verifier, solo el email + token de 6 dígitos del correo.
// ============================================================

const verifyOtpSchema = z.object({
  email: emailSchema,
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export async function verifyEmailOtp(formData: FormData): Promise<AuthActionResult> {
  const parsed = verifyOtpSchema.safeParse({
    email: formData.get('email'),
    token: formData.get('token'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, token } = parsed.data;
  const supabase = await createServerClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

// ============================================================
// SIGN IN WITH GOOGLE — devuelve URL de OAuth a la que redirigir
// ============================================================

export async function signInWithGoogle(
  next?: string,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const supabase = await createServerClient();
  const origin = await getOrigin();
  const callbackUrl = `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error || !data.url) {
    return { ok: false, message: error?.message ?? 'No URL returned by provider' };
  }

  return { ok: true, url: data.url };
}

// ============================================================
// SIGN OUT
// ============================================================

export async function signOut(): Promise<never> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
