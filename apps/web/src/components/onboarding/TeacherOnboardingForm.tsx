'use client';

import { useRouter } from '@/i18n/navigation';
import { completeTeacherOnboarding } from '@/lib/onboarding/actions';
import { COUNTRY_CONFIG, type CountryConfig } from '@numoria/i18n';
import { Button } from '@numoria/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, useTransition } from 'react';

interface TeacherOnboardingFormProps {
  defaultCountry?: string;
}

const DEFAULT_COLOR = '#2563eb'; // numoria-blue
const MAX_LOGO_SIZE = 524288; // 512KB
const ALLOWED_LOGO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

function sortCountries(locale: 'es' | 'en' | 'pt'): Array<[string, CountryConfig]> {
  return Object.entries(COUNTRY_CONFIG).sort(([, a], [, b]) =>
    a.name[locale].localeCompare(b.name[locale]),
  );
}

/**
 * Genera un slug URL-friendly a partir del nombre de la escuela.
 * Quita acentos, espacios → guiones, solo letras minúsculas/números/guiones.
 */
function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // quitar diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // solo letras/números/espacios/guiones
    .replace(/\s+/g, '-') // espacios → guion
    .replace(/-+/g, '-') // múltiples guiones → uno solo
    .replace(/^-+|-+$/g, '') // sin guiones al inicio/fin
    .slice(0, 50);
}

export function TeacherOnboardingForm({ defaultCountry = 'HN' }: TeacherOnboardingFormProps) {
  const t = useTranslations('onboarding.teacher');
  const tErrors = useTranslations('onboarding.teacherErrors');
  const locale = useLocale() as 'es' | 'en';
  const router = useRouter();
  const logoInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [country, setCountry] = useState(defaultCountry);
  const [city, setCity] = useState('');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoLocalError, setLogoLocalError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const countries = sortCountries(locale);

  // Auto-generar slug mientras el user no lo haya editado manualmente
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  // Cleanup del object URL para evitar memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleLogoChange = (file: File | null) => {
    setLogoLocalError(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }

    if (!file) {
      setLogoFile(null);
      return;
    }

    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      setLogoLocalError(tErrors('logoTypeInvalid'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setLogoLocalError(tErrors('logoTooLarge'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    // Solo permitir caracteres válidos en input directo
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setServerError(null);

    if (logoLocalError) return;

    const formData = new FormData();
    formData.set('name', name);
    formData.set('slug', slug);
    formData.set('country_code', country);
    if (city.trim()) formData.set('city', city.trim());
    if (primaryColor) formData.set('primary_color', primaryColor);
    if (logoFile) formData.set('logo', logoFile);

    startTransition(async () => {
      const result = await completeTeacherOnboarding(formData);

      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        if (result.message && !result.fieldErrors) setServerError(result.message);
        return;
      }

      // Después de crear la escuela, llevar al teacher directo a crear su primer team
      router.replace('/teams/new');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          🏫 {t('title')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{t('subtitle')}</p>
      </header>

      {/* NOMBRE DE ESCUELA */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('schoolName')}</span>
        <input
          type="text"
          name="name"
          required
          minLength={2}
          maxLength={200}
          placeholder={t('schoolNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          aria-invalid={errors.name ? true : undefined}
        />
        {errors.name && (
          <span role="alert" className="text-sm text-numoria-red">
            {tErrors('nameRequired')}
          </span>
        )}
      </label>

      {/* SLUG */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('schoolSlug')}</span>
        <div className="flex items-center gap-1 rounded-md border-2 border-numoria-gray bg-white px-3 py-2 focus-within:border-numoria-blue focus-within:ring-2 focus-within:ring-numoria-blue/30">
          <span className="select-none text-sm text-numoria-mid">numoria.app/schools/</span>
          <input
            type="text"
            name="slug"
            required
            minLength={3}
            maxLength={50}
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-numoria-ink focus:outline-none"
            aria-invalid={errors.slug ? true : undefined}
          />
        </div>
        <span className="text-xs text-numoria-mid">{t('schoolSlugHelp', { slug })}</span>
        {errors.slug && (
          <span role="alert" className="text-sm text-numoria-red">
            {errors.slug[0]?.toLowerCase().includes('taken')
              ? tErrors('slugTaken')
              : tErrors('slugInvalid')}
          </span>
        )}
      </label>

      {/* PAÍS */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('country')}</span>
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

      {/* CIUDAD */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('city')}</span>
        <input
          type="text"
          name="city"
          maxLength={100}
          placeholder={t('cityPlaceholder')}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
        />
      </label>

      {/* COLOR PRIMARIO */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-numoria-ink">{t('primaryColor')}</span>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="primary_color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-12 w-16 cursor-pointer rounded-md border-2 border-numoria-gray bg-white"
            aria-label={t('primaryColor')}
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => {
              const v = e.target.value.toUpperCase();
              if (/^#[0-9A-F]{0,6}$/.test(v)) setPrimaryColor(v);
            }}
            maxLength={7}
            className="flex-1 rounded-md border-2 border-numoria-gray bg-white px-3 py-2 font-mono text-sm uppercase text-numoria-ink focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          />
          <div
            className="h-12 w-12 rounded-md border-2 border-numoria-gray"
            style={{ backgroundColor: primaryColor }}
            aria-hidden
          />
        </div>
        <span className="text-xs text-numoria-mid">{t('primaryColorHelp')}</span>
        {errors.primary_color && (
          <span role="alert" className="text-sm text-numoria-red">
            {tErrors('colorInvalid')}
          </span>
        )}
      </label>

      {/* LOGO */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={logoInputId} className="text-sm font-semibold text-numoria-ink">
          {t('logo')}
        </label>

        {logoPreview ? (
          <div className="flex items-center gap-4 rounded-md border-2 border-numoria-gray bg-white p-3">
            <img
              src={logoPreview}
              alt={t('logoPreview')}
              className="h-20 w-20 rounded-md object-contain"
            />
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-semibold text-numoria-ink">{logoFile?.name}</span>
              <span className="text-xs text-numoria-mid">
                {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : ''}
              </span>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-numoria-blue hover:underline"
                >
                  {t('logoChange')}
                </button>
                <span className="text-numoria-mid">·</span>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs font-bold text-numoria-red hover:underline"
                >
                  {t('logoRemove')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border-2 border-dashed border-numoria-gray bg-numoria-cloud/40 px-4 py-6 text-sm font-bold text-numoria-blue hover:bg-numoria-cloud/70"
          >
            📁 {t('logoChoose')}
          </button>
        )}

        <input
          id={logoInputId}
          ref={fileInputRef}
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
        />

        <span className="text-xs text-numoria-mid">{t('logoHelp')}</span>
        {(logoLocalError || errors.logo) && (
          <span role="alert" className="text-sm text-numoria-red">
            {logoLocalError ?? errors.logo?.[0]}
          </span>
        )}
      </div>

      {/* SUBMIT */}
      <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending}>
        {isPending ? t('saving') : `🚀 ${t('submit')}`}
      </Button>

      <p className="text-center text-xs text-numoria-mid">{t('unverifiedNote')}</p>

      {serverError && (
        <p role="alert" className="text-center text-sm text-numoria-red">
          {serverError}
        </p>
      )}
    </form>
  );
}
