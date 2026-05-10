import { Link } from '@/i18n/navigation';
import { BRAND_NAME } from '@numoria/i18n';
import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '../LocaleSwitcher';

export async function Footer() {
  const t = await getTranslations('footer');
  const tBrand = await getTranslations('brand');
  const year = new Date().getFullYear();

  const links = [
    { href: '/about', key: 'about' as const },
    { href: '/help', key: 'help' as const },
    { href: '/privacy', key: 'privacy' as const },
    { href: '/terms', key: 'terms' as const },
    { href: '/contact', key: 'contact' as const },
  ];

  return (
    <footer className="bg-numoria-ink text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        {BRAND_NAME}
      </h2>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3">
          {/* Brand block */}
          <div>
            <p className="font-display text-2xl font-bold">{tBrand('name')}</p>
            <p className="mt-2 max-w-sm text-sm text-white/70">{tBrand('tagline')}</p>
          </div>

          {/* Links */}
          <nav aria-label={t('about')} className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {links.map(({ href, key }) => (
              <Link
                key={key}
                href={href}
                className="text-white/80 transition-colors hover:text-white hover:underline"
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* Locale switcher */}
          <div className="sm:col-span-2 lg:col-span-1 lg:justify-self-end">
            <LocaleSwitcher />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/60">
          <p>{t('copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
