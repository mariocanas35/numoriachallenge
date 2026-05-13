'use client';

import { useRouter } from '@/i18n/navigation';
import { createTeam } from '@/lib/teams/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

export function CreateTeamForm() {
  const t = useTranslations('teams.new');
  const tErr = useTranslations('teams.new.errors');
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
      const result = await createTeam(formData);
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        if (result.message && !result.fieldErrors) {
          // Mapear errores conocidos a strings traducidos
          if (result.message.toLowerCase().includes('school')) {
            setServerError(tErr('noSchool'));
          } else {
            setServerError(tErr('createFailed'));
          }
        }
        return;
      }
      if (result.teamId) {
        router.replace(`/teams/${result.teamId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          👥 {t('title')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{t('subtitle')}</p>
      </header>

      {/* NAME */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('name')}</span>
        <input
          type="text"
          name="name"
          required
          minLength={1}
          maxLength={100}
          placeholder={t('namePlaceholder')}
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          aria-invalid={errors.name ? true : undefined}
        />
        {errors.name && (
          <span role="alert" className="text-sm text-numoria-red">
            {tErr('nameRequired')}
          </span>
        )}
      </label>

      {/* DIVISION */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-semibold text-numoria-ink">{t('division')}</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-numoria-gray bg-white p-4 transition hover:border-numoria-blue has-[:checked]:border-numoria-blue has-[:checked]:bg-numoria-blue/5">
            <input
              type="radio"
              name="division"
              value="elementary"
              required
              defaultChecked
              className="sr-only"
            />
            <span className="text-2xl">🌱</span>
            <span className="font-semibold text-numoria-ink">{t('divisionElementary')}</span>
            <span className="text-xs text-numoria-mid">3º – 6º</span>
          </label>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-numoria-gray bg-white p-4 transition hover:border-numoria-blue has-[:checked]:border-numoria-blue has-[:checked]:bg-numoria-blue/5">
            <input type="radio" name="division" value="middle" className="sr-only" />
            <span className="text-2xl">🚀</span>
            <span className="font-semibold text-numoria-ink">{t('divisionMiddle')}</span>
            <span className="text-xs text-numoria-mid">7º – 9º</span>
          </label>
        </div>
        <span className="text-xs text-numoria-mid">{t('divisionHelp')}</span>
        {errors.division && (
          <span role="alert" className="text-sm text-numoria-red">
            {tErr('divisionRequired')}
          </span>
        )}
      </fieldset>

      {/* MAX MEMBERS (opcional) */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('maxMembers')}</span>
        <input
          type="number"
          name="max_members"
          min={1}
          max={100}
          defaultValue={30}
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
        />
        <span className="text-xs text-numoria-mid">{t('maxMembersHelp')}</span>
        {errors.max_members && (
          <span role="alert" className="text-sm text-numoria-red">
            {tErr('maxMembersInvalid')}
          </span>
        )}
      </label>

      {/* SUBMIT */}
      <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending}>
        {isPending ? t('saving') : `🚀 ${t('submit')}`}
      </Button>

      {serverError && (
        <p role="alert" className="text-center text-sm text-numoria-red">
          {serverError}
        </p>
      )}
    </form>
  );
}
