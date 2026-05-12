'use client';

import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';

interface PrintButtonProps {
  /** Label override. Default usa 'contests.print.printButton' del i18n. */
  label?: string;
}

/**
 * Botón que dispara el print dialog del browser.
 *
 * Es Client Component porque `window.print()` solo existe en runtime browser.
 * Trivial pero needed para que la página print sea Server Component (server-render
 * + KaTeX) y este solo wrappee el handler.
 */
export function PrintButton({ label }: PrintButtonProps) {
  const t = useTranslations('contests.print');
  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={() => window.print()}
      className="print:hidden"
    >
      🖨️ {label ?? t('printButton')}
    </Button>
  );
}
