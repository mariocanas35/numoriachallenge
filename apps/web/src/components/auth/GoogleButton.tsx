'use client';

import { signInWithGoogle } from '@/lib/auth/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

interface GoogleButtonProps {
  /** Path to redirect to after successful auth (default: /). */
  next?: string;
}

export function GoogleButton({ next }: GoogleButtonProps) {
  const t = useTranslations('auth');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await signInWithGoogle(next);
      if (!result.ok) {
        setError(t('errors.providerError'));
        return;
      }
      // Redirigir al usuario al consentimiento OAuth de Google
      window.location.href = result.url;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleClick}
        disabled={isPending}
      >
        {/* Logo de Google inline (no requiere asset) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.4-4.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"
          />
          <path
            fill="#4CAF50"
            d="M24 45.5c5.4 0 10.3-2 14-5.4l-6.5-5.5c-2 1.4-4.6 2.4-7.5 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 41.1 16.3 45.5 24 45.5z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.8 5.6l6.5 5.5c-.5.4 6.5-4.7 6.5-14.1 0-1.5-.2-3-.4-4.5z"
          />
        </svg>
        {t('continueWithGoogle')}
      </Button>
      {error && (
        <p role="alert" className="text-center text-sm text-numoria-red">
          {error}
        </p>
      )}
    </div>
  );
}
