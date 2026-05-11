'use client';

import { useRouter } from '@/i18n/navigation';
import { verifyEmailOtp } from '@/lib/auth/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

interface VerifyCodeFormProps {
  email: string;
  next?: string;
}

/**
 * Form para canjear el código OTP de 6 dígitos por una sesión.
 *
 * Reemplaza el flow de magic link clicable que tenía el bug PKCE
 * documentado en ADR 0004. El usuario tipea el código del correo
 * directamente y `verifyEmailOtp` lo intercambia por una sesión
 * sin necesidad de cookies de verifier (no PKCE roundtrip).
 */
export function VerifyCodeForm({ email, next }: VerifyCodeFormProps) {
  const t = useTranslations('auth.verifyCode');
  const router = useRouter();

  const [code, setCode] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError(t('errorIncomplete'));
      return;
    }

    const formData = new FormData();
    formData.set('email', email);
    formData.set('token', code);

    startTransition(async () => {
      const result = await verifyEmailOtp(formData);

      if (!result.ok) {
        const msg = (result.message ?? '').toLowerCase();
        if (msg.includes('expired') || msg.includes('invalid')) {
          setError(t('errorInvalid'));
        } else {
          setError(t('errorGeneric'));
        }
        return;
      }

      // Sesión establecida — redirigir a next o home
      const safeNext = next?.startsWith('/') ? next : '/';
      router.replace(safeNext);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-2">
        <span className="text-center text-sm font-medium text-numoria-ink">{t('label')}</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="• • • • • •"
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-4 text-center font-mono text-3xl tracking-[0.5em] text-numoria-ink placeholder:text-numoria-gray focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          aria-label={t('label')}
        />
      </label>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={isPending || code.length !== 6}
      >
        {isPending ? t('verifying') : `🔓 ${t('verifyButton')}`}
      </Button>

      {error && (
        <p role="alert" className="text-center text-sm text-numoria-red">
          {error}
        </p>
      )}
    </form>
  );
}
