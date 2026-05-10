'use client';

import { useRouter } from '@/i18n/navigation';
import { signInWithEmail } from '@/lib/auth/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { GoogleButton } from './GoogleButton';

interface LoginFormProps {
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErrors({});
    setServerError(null);

    startTransition(async () => {
      const result = await signInWithEmail(formData);
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        if (result.message) setServerError(result.message);
        return;
      }
      // Magic link enviado — ir a página de confirmación
      const email = formData.get('email')?.toString() ?? '';
      router.push(`/check-email?email=${encodeURIComponent(email)}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next ?? ''} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-numoria-ink">{t('email')}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink placeholder:text-numoria-mid focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="text-sm text-numoria-red">
            {t('errors.invalidEmail')}
          </span>
        )}
      </label>

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending}>
        {isPending ? '...' : t('magicLink')}
      </Button>

      {serverError && (
        <p role="alert" className="text-center text-sm text-numoria-red">
          {serverError}
        </p>
      )}

      {/* Divider */}
      <div className="my-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-numoria-gray" />
        <span className="text-sm text-numoria-mid">{t('or')}</span>
        <div className="h-px flex-1 bg-numoria-gray" />
      </div>

      <GoogleButton next={next} />
    </form>
  );
}
