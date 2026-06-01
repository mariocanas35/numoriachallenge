import { Button, NumaAvatar } from '@numoria/ui';
import Link from 'next/link';

/**
 * Página de error genérica de auth.
 *
 * Está FUERA de [locale] porque puede llegar antes de que sepamos
 * el locale del usuario (después de un OAuth fallido).
 */
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  const messages: Record<string, { title: string; description: string }> = {
    no_code: {
      title: 'Falta información de la sesión',
      description:
        'No recibimos el código de autenticación. Esto puede pasar si volviste a esta página después de cerrar el correo.',
    },
    exchange_failed: {
      title: 'No pudimos completar tu inicio de sesión',
      description: 'El enlace mágico expiró o ya fue usado. Solicita uno nuevo.',
    },
    no_profile: {
      title: 'Tu cuenta está casi lista',
      description:
        'Creamos tu cuenta pero no pudimos cargar tu perfil. Cierra sesión e inicia de nuevo. Si el problema persiste, escríbenos a support@numoriachallenge.com.',
    },
    default: {
      title: 'Algo salió mal',
      description: 'No pudimos completar tu inicio de sesión. Inténtalo de nuevo.',
    },
  };

  const reasonKey = reason && reason in messages ? reason : 'default';
  const msg = messages[reasonKey] ?? messages.default;

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <NumaAvatar pose="sad" size="2xl" />
        <h1 className="font-display text-3xl font-bold text-numoria-ink">{msg?.title}</h1>
        <p className="max-w-md text-numoria-mid">{msg?.description}</p>
        <Button variant="primary" size="lg" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
