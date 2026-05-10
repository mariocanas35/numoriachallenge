import { Link } from '@/i18n/navigation';
import { Button, NumaAvatar } from '@numoria/ui';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('errors');
  const tCommon = useTranslations('common');

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <NumaAvatar pose="sad" size="2xl" />
        <h1 className="font-display text-5xl font-bold text-numoria-ink">404</h1>
        <p className="max-w-md text-lg text-numoria-mid">{t('notFound')}</p>
        <Button variant="primary" size="lg" asChild>
          <Link href="/">{tCommon('back')}</Link>
        </Button>
      </div>
    </main>
  );
}
