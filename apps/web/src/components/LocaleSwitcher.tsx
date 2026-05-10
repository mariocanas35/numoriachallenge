'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import {
  type ActiveLocale,
  LOCALE_COOKIE_NAME,
  activeLocales,
  localeDisplayNames,
  localeFlags,
} from '@numoria/i18n';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

/**
 * Selector de idioma ES/EN. Persiste preferencia en cookie y navega
 * al equivalente del path actual en el otro locale.
 *
 * Native <select> por accesibilidad — funciona con teclado y screen
 * readers sin trabajo extra.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as ActiveLocale;
  const t = useTranslations('common');
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as ActiveLocale;
    if (next === currentLocale) return;

    // Persistir preferencia 1 año
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <label className={className}>
      <span className="sr-only">{t('language')}</span>
      <select
        value={currentLocale}
        onChange={handleChange}
        disabled={isPending}
        className="cursor-pointer rounded-md border-2 border-numoria-gray bg-white px-3 py-2 text-sm font-medium text-numoria-ink hover:border-numoria-mid focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue disabled:opacity-50"
        aria-label={t('language')}
      >
        {activeLocales.map((locale) => (
          <option key={locale} value={locale}>
            {localeFlags[locale]} {localeDisplayNames[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
