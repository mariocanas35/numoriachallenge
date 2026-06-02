'use client';

import { useRouter } from '@/i18n/navigation';
import { chooseRole } from '@/lib/onboarding/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

type Role = 'student' | 'parent' | 'teacher';

const roles = [
  { value: 'student', emoji: '🎓', labelKey: 'iAmStudent' as const },
  { value: 'parent', emoji: '👨‍👩‍👧', labelKey: 'iAmParent' as const },
  { value: 'teacher', emoji: '👩‍🏫', labelKey: 'iAmTeacher' as const },
] as const;

/**
 * Paso de onboarding donde el usuario elige su rol. Se muestra sobre todo a
 * los sign-ups con Google (que entran como 'student' por defecto) para que
 * los maestros no queden atrapados como estudiantes.
 */
export function RoleChoiceForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [selected, setSelected] = useState<Role>('student');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await chooseRole(selected);
      if (!result.ok) {
        setError(result.message ?? 'Error');
        return;
      }
      // Ir directo al onboarding del rol elegido (no a /onboarding, para no
      // re-disparar la pregunta de rol).
      router.replace(`/onboarding/${selected}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-numoria-ink">{t('selectRole')}</legend>
        <div className="grid grid-cols-3 gap-2">
          {roles.map((role) => (
            <label
              key={role.value}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 p-3 text-center transition-colors ${
                selected === role.value
                  ? 'border-numoria-blue bg-numoria-blue/5 ring-2 ring-numoria-blue/20'
                  : 'border-numoria-gray bg-white hover:border-numoria-mid'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selected === role.value}
                onChange={() => setSelected(role.value)}
                className="sr-only"
              />
              <span className="text-2xl" aria-hidden="true">
                {role.emoji}
              </span>
              <span className="text-xs font-medium text-numoria-ink">{t(role.labelKey)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending}>
        {isPending ? '...' : tCommon('next')}
      </Button>

      {error && (
        <p role="alert" className="text-center text-sm text-numoria-red">
          {error}
        </p>
      )}
    </form>
  );
}
