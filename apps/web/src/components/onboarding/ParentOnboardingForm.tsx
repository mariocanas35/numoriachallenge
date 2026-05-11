'use client';

import { useRouter } from '@/i18n/navigation';
import { completeParentOnboarding } from '@/lib/onboarding/actions';
import { COUNTRY_CONFIG, type CountryConfig } from '@numoria/i18n';
import { Button } from '@numoria/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

interface ParentOnboardingFormProps {
  defaultCountry?: string;
}

interface ChildDraft {
  /** ID local del cliente, solo para tracking en React (no DB). */
  clientId: string;
  display_name: string;
  email: string;
  birth_year: string;
  birth_month: string;
  grade: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = CURRENT_YEAR - 20;
const MAX_BIRTH_YEAR = CURRENT_YEAR - 5;
const YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);
const MAX_CHILDREN = 4;

function sortCountries(locale: 'es' | 'en' | 'pt'): Array<[string, CountryConfig]> {
  return Object.entries(COUNTRY_CONFIG).sort(([, a], [, b]) =>
    a.name[locale].localeCompare(b.name[locale]),
  );
}

function emptyChild(): ChildDraft {
  return {
    clientId: crypto.randomUUID(),
    display_name: '',
    email: '',
    birth_year: '',
    birth_month: '',
    grade: '',
  };
}

export function ParentOnboardingForm({ defaultCountry = 'HN' }: ParentOnboardingFormProps) {
  const t = useTranslations('onboarding.parent');
  const tStudent = useTranslations('onboarding.student');
  const tMonths = useTranslations('onboarding.months');
  const locale = useLocale() as 'es' | 'en';
  const router = useRouter();

  const [country, setCountry] = useState(defaultCountry);
  const [children, setChildren] = useState<ChildDraft[]>([emptyChild()]);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const countries = sortCountries(locale);

  const addChild = () => {
    if (children.length >= MAX_CHILDREN) return;
    setChildren((prev) => [...prev, emptyChild()]);
  };

  const removeChild = (clientId: string) => {
    setChildren((prev) => (prev.length > 1 ? prev.filter((c) => c.clientId !== clientId) : prev));
  };

  const updateChild = (clientId: string, field: keyof ChildDraft, value: string) => {
    setChildren((prev) =>
      prev.map((c) => (c.clientId === clientId ? { ...c, [field]: value } : c)),
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    startTransition(async () => {
      const result = await completeParentOnboarding({
        country_code: country,
        children: children.map((c) => ({
          display_name: c.display_name,
          email: c.email,
          birth_year: Number(c.birth_year),
          birth_month: Number(c.birth_month),
          grade: Number(c.grade),
        })),
      });

      if (!result.ok) {
        setServerError(result.message ?? 'No pudimos completar el onboarding');
        return;
      }

      const count = result.childrenCreated ?? children.length;
      router.replace(`/onboarding/parent/done?count=${count}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          👨‍👩‍👧 {t('title')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{t('subtitle')}</p>
      </header>

      {/* SECCIÓN PADRE */}
      <section className="rounded-xl border-2 border-numoria-gray bg-numoria-cloud/40 p-5">
        <h2 className="mb-3 font-display font-bold text-numoria-ink">{t('yourInfo')}</h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-numoria-ink">{t('yourCountry')}</span>
          <select
            name="country_code"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          >
            {countries.map(([code, config]) => (
              <option key={code} value={code}>
                {config.flag} {config.name[locale]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* SECCIÓN HIJOS */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display font-bold text-numoria-ink">{t('children')}</h2>
          <span className="text-xs text-numoria-mid">
            {children.length} / {MAX_CHILDREN}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {children.map((child, idx) => (
            <article
              key={child.clientId}
              className="rounded-xl border-2 border-numoria-gray bg-white p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-numoria-ink">
                  🎓 {t('child', { n: idx + 1 })}
                </h3>
                {children.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChild(child.clientId)}
                    className="text-xs font-bold text-numoria-red hover:underline"
                  >
                    ✕ {t('removeChild')}
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-numoria-ink">{t('childName')}</span>
                  <input
                    type="text"
                    required
                    minLength={1}
                    maxLength={100}
                    placeholder={t('childNamePlaceholder')}
                    value={child.display_name}
                    onChange={(e) => updateChild(child.clientId, 'display_name', e.target.value)}
                    className="rounded-md border-2 border-numoria-gray bg-white px-3 py-2 text-sm text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-numoria-ink">{t('childEmail')}</span>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={child.email}
                    onChange={(e) => updateChild(child.clientId, 'email', e.target.value)}
                    className="rounded-md border-2 border-numoria-gray bg-white px-3 py-2 text-sm text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
                  />
                  <span className="text-xs text-numoria-mid">{t('childEmailHelp')}</span>
                </label>

                <fieldset className="flex flex-col gap-1">
                  <legend className="text-xs font-semibold text-numoria-ink">
                    {t('childBirth')}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      required
                      value={child.birth_month}
                      onChange={(e) => updateChild(child.clientId, 'birth_month', e.target.value)}
                      className="rounded-md border-2 border-numoria-gray bg-white px-3 py-2 text-sm text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
                    >
                      <option value="" disabled>
                        {tStudent('birthMonth')}
                      </option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {tMonths(m.toString())}
                        </option>
                      ))}
                    </select>
                    <select
                      required
                      value={child.birth_year}
                      onChange={(e) => updateChild(child.clientId, 'birth_year', e.target.value)}
                      className="rounded-md border-2 border-numoria-gray bg-white px-3 py-2 text-sm text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
                    >
                      <option value="" disabled>
                        {tStudent('birthYear')}
                      </option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </fieldset>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-numoria-ink">{t('childGrade')}</span>
                  <select
                    required
                    value={child.grade}
                    onChange={(e) => updateChild(child.clientId, 'grade', e.target.value)}
                    className="rounded-md border-2 border-numoria-gray bg-white px-3 py-2 text-sm text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
                  >
                    <option value="" disabled>
                      —
                    </option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {tStudent('gradeOption', { grade: g })}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>

        {children.length < MAX_CHILDREN && (
          <button
            type="button"
            onClick={addChild}
            className="mt-4 w-full rounded-md border-2 border-dashed border-numoria-blue bg-numoria-blue/5 px-4 py-3 text-sm font-bold text-numoria-blue hover:bg-numoria-blue/10"
          >
            {t('addChild')}
          </button>
        )}
      </section>

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending}>
        {isPending ? t('saving') : `📧 ${t('submit')}`}
      </Button>

      {serverError && (
        <p role="alert" className="text-center text-sm text-numoria-red">
          {serverError}
        </p>
      )}
    </form>
  );
}
