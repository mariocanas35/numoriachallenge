'use client';

import { useRouter } from '@/i18n/navigation';
import { completeStudentOnboarding } from '@/lib/onboarding/actions';
import { COUNTRY_CONFIG, type CountryConfig, getCountryConfig } from '@numoria/i18n';
import { Button } from '@numoria/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

interface StudentOnboardingFormProps {
  /** Country detectado o pre-existente en el profile. */
  defaultCountry?: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = CURRENT_YEAR - 20; // hasta 20 años
const MAX_BIRTH_YEAR = CURRENT_YEAR - 5; // mínimo 5 años

// Generar años en orden descendente (más reciente primero)
const YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

// Ordenar países alfabéticamente por nombre en el locale actual
function sortCountries(locale: 'es' | 'en' | 'pt'): Array<[string, CountryConfig]> {
  return Object.entries(COUNTRY_CONFIG).sort(([, a], [, b]) =>
    a.name[locale].localeCompare(b.name[locale]),
  );
}

export function StudentOnboardingForm({ defaultCountry = 'HN' }: StudentOnboardingFormProps) {
  const t = useTranslations('onboarding.student');
  const tErrors = useTranslations('onboarding.errors');
  const tMonths = useTranslations('onboarding.months');
  const locale = useLocale() as 'es' | 'en';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const countries = sortCountries(locale);
  const detectedCountry = getCountryConfig(defaultCountry);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErrors({});
    setServerError(null);

    startTransition(async () => {
      const result = await completeStudentOnboarding(formData);
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        if (result.message) setServerError(result.message);
        return;
      }
      // Onboarding completo — redirigir a home (middleware ya no lo redirigirá)
      router.replace('/');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          🎓 {t('title')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{t('subtitle')}</p>
      </header>

      {/* COUNTRY */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('country')}</span>
        <select
          name="country_code"
          required
          defaultValue={defaultCountry}
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          aria-invalid={errors.country_code ? true : undefined}
        >
          {countries.map(([code, config]) => (
            <option key={code} value={code}>
              {config.flag} {config.name[locale]}
            </option>
          ))}
        </select>
        <span className="text-xs text-numoria-mid">
          {t('countryHelp')} ({detectedCountry.flag} {detectedCountry.name[locale]})
        </span>
        {errors.country_code && (
          <span role="alert" className="text-sm text-numoria-red">
            {tErrors('countryRequired')}
          </span>
        )}
      </label>

      {/* BIRTH DATE */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-semibold text-numoria-ink">{t('birthDate')}</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-numoria-mid">{t('birthMonth')}</span>
            <select
              name="birth_month"
              required
              defaultValue=""
              className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
            >
              <option value="" disabled>
                —
              </option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {tMonths(m.toString())}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-numoria-mid">{t('birthYear')}</span>
            <select
              name="birth_year"
              required
              defaultValue=""
              className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
            >
              <option value="" disabled>
                —
              </option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
        <span className="text-xs text-numoria-mid">{t('birthDateHelp')}</span>
        {(errors.birth_year || errors.birth_month) && (
          <span role="alert" className="text-sm text-numoria-red">
            {tErrors('birthYearInvalid')}
          </span>
        )}
      </fieldset>

      {/* GRADE */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('grade')}</span>
        <select
          name="grade"
          required
          defaultValue=""
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
        >
          <option value="" disabled>
            —
          </option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {t('gradeOption', { grade: g })}
            </option>
          ))}
        </select>
        {errors.grade && (
          <span role="alert" className="text-sm text-numoria-red">
            {tErrors('gradeInvalid')}
          </span>
        )}
      </label>

      {/* INVITE CODE (optional) */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('inviteCode')}</span>
        <input
          type="text"
          name="invite_code"
          maxLength={8}
          autoComplete="off"
          placeholder={t('inviteCodePlaceholder')}
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base uppercase tracking-wider text-numoria-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-numoria-mid focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          style={{ textTransform: 'uppercase' }}
        />
        <span className="text-xs text-numoria-mid">{t('inviteCodeHelp')}</span>
        {errors.invite_code && (
          <span role="alert" className="text-sm text-numoria-red">
            {tErrors('inviteCodeInvalid')}
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
