'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { joinTeam } from '@/lib/teams/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

interface JoinTeamViewProps {
  inviteCode: string;
  teamName: string;
  schoolName: string;
  division: 'elementary' | 'middle';
  /**
   * - `student-ready`: user es student onboarded → muestra botón "Unirme"
   * - `student-onboarding`: user es student pero NO onboarded → CTA volver a onboarding con code
   * - `wrong-role`: user es parent/teacher → error
   * - `anonymous`: no logged in → CTA login/register
   * - `already-member`: ya está en este team
   */
  mode: 'student-ready' | 'student-onboarding' | 'wrong-role' | 'anonymous' | 'already-member';
  /** Solo presente cuando mode === 'wrong-role' */
  userRole?: 'parent' | 'teacher' | 'admin';
}

export function JoinTeamView({
  inviteCode,
  teamName,
  schoolName,
  division,
  mode,
  userRole,
}: JoinTeamViewProps) {
  const t = useTranslations('teams.join');
  const tNew = useTranslations('teams.new');
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleJoin = () => {
    setError(null);
    startTransition(async () => {
      const result = await joinTeam(inviteCode);
      if (!result.ok) {
        const msg = (result.message ?? '').toLowerCase();
        if (msg.includes('full')) setError(t('errorFull'));
        else if (msg.includes('already')) setError(t('errorAlreadyMember'));
        else if (msg.includes('invalid') || msg.includes('disabled'))
          setError(t('errorInvalidCode'));
        else if (msg.includes('only students')) setError(t('errorWrongRole', { role: 'teacher' }));
        else setError(t('errorGeneric'));
        return;
      }
      // Éxito — recargar a la home, el dashboard mostrará el team
      router.replace('/');
      router.refresh();
    });
  };

  const divisionLabel =
    division === 'elementary' ? tNew('divisionElementary') : tNew('divisionMiddle');

  return (
    <div className="flex flex-col gap-6 text-center">
      <header>
        <div className="mb-4 inline-block rounded-full bg-numoria-blue/10 px-4 py-1 font-mono text-sm font-bold tracking-widest text-numoria-blue">
          {inviteCode}
        </div>
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          🎯 {t('validTitle', { teamName })}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">
          {t('validSubtitle', { schoolName, division: divisionLabel })}
        </p>
      </header>

      {mode === 'student-ready' && (
        <>
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleJoin}
            disabled={isPending}
          >
            {isPending ? t('joining') : `🚀 ${t('joinButton')}`}
          </Button>
          {error && (
            <p role="alert" className="text-sm text-numoria-red">
              {error}
            </p>
          )}
        </>
      )}

      {mode === 'student-onboarding' && (
        <div className="rounded-xl border-2 border-numoria-yellow/40 bg-numoria-yellow/10 p-5 text-left">
          <p className="font-semibold text-numoria-ink">⏳ {t('errorOnboardingPending')}</p>
          <Link
            href={`/onboarding/student?invite_code=${inviteCode}`}
            className="mt-3 inline-block font-bold text-numoria-blue hover:underline"
          >
            {t('goToDashboard')} →
          </Link>
        </div>
      )}

      {mode === 'anonymous' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-numoria-mid">{t('loginRequired')}</p>
          <Link
            href={`/register?invite_code=${inviteCode}&role=student`}
            className="block rounded-md bg-numoria-blue px-6 py-3 text-center font-bold text-white hover:bg-numoria-blue/90"
          >
            🎓 {t('loginAsStudent')}
          </Link>
          <Link
            href={`/login?next=/join/${inviteCode}`}
            className="block rounded-md border-2 border-numoria-blue bg-white px-6 py-3 text-center font-bold text-numoria-blue hover:bg-numoria-blue/10"
          >
            {t('loginButton')}
          </Link>
        </div>
      )}

      {mode === 'wrong-role' && (
        <p className="rounded-md border-2 border-numoria-red/30 bg-numoria-red/5 p-5 text-sm text-numoria-red">
          ⚠️ {t('errorWrongRole', { role: userRole ?? '' })}
        </p>
      )}

      {mode === 'already-member' && (
        <div className="rounded-md border-2 border-numoria-green/30 bg-numoria-green/5 p-5">
          <p className="font-semibold text-numoria-ink">✅ {t('successTitle', { teamName })}</p>
          <p className="mt-1 text-sm text-numoria-mid">{t('successSubtitle')}</p>
          <Link href="/" className="mt-3 inline-block font-bold text-numoria-blue hover:underline">
            {t('goToDashboard')} →
          </Link>
        </div>
      )}
    </div>
  );
}
