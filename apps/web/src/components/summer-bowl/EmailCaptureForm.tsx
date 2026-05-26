'use client';

import { Link } from '@/i18n/navigation';
import { captureEmail } from '@/lib/marketing/email-capture';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

/**
 * Form de email capture para landing pública Summer Bowl.
 *
 * Flow:
 * 1. Usuario ingresa email → submit
 * 2. Server action captureEmail() valida + inserta en email_captures
 * 3. UI cambia a estado success con CTA secundario "regístrate ahora"
 *
 * UX decisions:
 * - Solo email (sin nombre/escuela) → máxima conversión
 * - Idempotente: si el email ya está, mensaje igual al de éxito
 * - Después de success: CTA a /register para conversión completa
 */
export function EmailCaptureForm({ locale }: { locale: string }) {
  const t = useTranslations('contests.summerBowlLanding');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const result = await captureEmail({
        email,
        source: 'summer_bowl_landing',
        metadata: { locale },
      });

      if (result.ok) {
        setStatus('success');
        return;
      }

      setStatus('error');
      if (result.message === 'invalid_email') {
        setErrorMsg(
          locale === 'en'
            ? 'Invalid email format. Please check.'
            : 'El email no es válido. Revisa el formato.',
        );
      } else {
        setErrorMsg(
          locale === 'en'
            ? "We couldn't save your email. Try again in a moment."
            : 'No pudimos guardar tu email. Intenta de nuevo en un momento.',
        );
      }
    });
  };

  // === Estado: SUCCESS ===
  if (status === 'success') {
    return (
      <div className="rounded-xl border-2 border-numoria-green/40 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-4 text-5xl" aria-hidden>
          🎉
        </div>
        <h3 className="font-display text-xl font-bold text-numoria-ink sm:text-2xl">
          {t('successTitle')}
        </h3>
        <p
          className="mt-2 text-sm text-numoria-mid sm:text-base"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: rich text from i18n with {email} replaced
          dangerouslySetInnerHTML={{
            __html: t('successBody', { email: `<strong>${escapeHtml(email)}</strong>` }),
          }}
        />
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button variant="primary" size="lg" asChild>
            <Link href="/register">{t('successCtaRegister')}</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => {
              setEmail('');
              setStatus('idle');
            }}
          >
            {t('successCtaAnother')}
          </Button>
        </div>
        <p className="mt-4 text-xs text-numoria-mid">{t('successDisclaimer')}</p>
      </div>
    );
  }

  // === Estado: IDLE / ERROR ===
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border-2 border-numoria-orange/30 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="text-center">
        <h3 className="font-display text-xl font-bold text-numoria-ink sm:text-2xl">
          📩 {t('emailHeader')}
        </h3>
        <p className="mt-2 text-sm text-numoria-mid sm:text-base">{t('emailSub')}</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          disabled={isPending}
          className="flex-1 rounded-md border-2 border-numoria-niebla/40 bg-white px-4 py-3 text-base text-numoria-ink placeholder:text-numoria-mid focus-visible:border-numoria-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-orange/30 disabled:opacity-60"
          aria-label={t('emailHeader')}
        />
        <Button type="submit" variant="primary" size="lg" disabled={isPending || !email}>
          {isPending ? t('emailSending') : t('emailCta')}
        </Button>
      </div>

      {status === 'error' && errorMsg && (
        <p role="alert" className="mt-3 text-center text-sm text-numoria-coral">
          {errorMsg}
        </p>
      )}

      <p className="mt-4 text-center text-xs text-numoria-mid">{t('emailSpamFree')}</p>
    </form>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
