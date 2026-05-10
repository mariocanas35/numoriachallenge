import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Wrappers localizados de Link, redirect, usePathname, useRouter.
 *
 * Usar SIEMPRE estos en lugar de los nativos de next/link y next/navigation,
 * para que respeten el prefijo de locale automáticamente.
 *
 * @example
 * import { Link } from '@/i18n/navigation';
 * <Link href="/competitions">{t('viewAll')}</Link>
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
