'use client';

import { useRouter } from '@/i18n/navigation';
import { joinTeam } from '@/lib/teams/actions';
import { Button, NumaAvatar } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

/**
 * Card inline para que un student SIN team pueda unirse a uno
 * directamente desde su dashboard, sin tener que navegar a /join.
 */
export function JoinTeamCard() {
  const t = useTranslations('dashboard.student');
  const router = useRouter();

  const [code, setCode] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await joinTeam(code);
      if (!result.ok) {
        setError(t('joinError'));
        return;
      }
      router.refresh();
    });
  };

  return (
    <section className="rounded-xl border-2 border-numoria-blue/30 bg-numoria-blue/5 p-6">
      <div className="flex items-start gap-4">
        <NumaAvatar pose="wave" size="lg" className="hidden sm:block" />
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-numoria-ink">{t('noTeamTitle')}</h2>
          <p className="mt-1 text-sm text-numoria-mid">{t('noTeamDescription')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row" noValidate>
        <input
          type="text"
          required
          maxLength={8}
          autoComplete="off"
          placeholder={t('inviteCodePlaceholder')}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 rounded-md border-2 border-numoria-gray bg-white px-4 py-3 font-mono text-base uppercase tracking-wider text-numoria-ink placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-numoria-mid focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          style={{ textTransform: 'uppercase' }}
        />
        <Button type="submit" variant="primary" size="lg" disabled={isPending || code.length !== 8}>
          {isPending ? t('joining') : t('joinButton')}
        </Button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm text-numoria-red">
          {error}
        </p>
      )}
    </section>
  );
}
