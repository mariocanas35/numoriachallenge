'use client';

import { useRouter } from '@/i18n/navigation';
import { signUpWithEmail } from '@/lib/auth/actions';
import { Button } from '@numoria/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { GoogleButton } from './GoogleButton';

interface RegisterFormProps {
  defaultRole?: 'student' | 'parent' | 'teacher';
  next?: string;
}

const roles = [
  { value: 'student', emoji: '🎓', labelKey: 'iAmStudent' as const },
  { value: 'parent', emoji: '👨‍👩‍👧', labelKey: 'iAmParent' as const },
  { value: 'teacher', emoji: '👩‍🏫', labelKey: 'iAmTeacher' as const },
] as const;

export function RegisterForm({ defaultRole = 'student', next }: RegisterFormProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | 'teacher'>(defaultRole);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('role', selectedRole);
    formData.set('locale', locale);
    setErrors({});
    setServerError(null);

    startTransition(async () => {
      const result = await signUpWithEmail(formData);
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        if (result.message) setServerError(result.message);
        return;
      }
      const email = formData.get('email')?.toString() ?? '';
      const params = new URLSearchParams({ email });
      if (next) params.set('next', next);
      router.push(`/check-email?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next ?? ''} />

      {/* Role selector */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-numoria-ink">{t('selectRole')}</legend>
        <div className="grid grid-cols-3 gap-2">
          {roles.map((role) => (
            <label
              key={role.value}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 p-3 text-center transition-colors ${
                selectedRole === role.value
                  ? 'border-numoria-blue bg-numoria-blue/5 ring-2 ring-numoria-blue/20'
                  : 'border-numoria-gray bg-white hover:border-numoria-mid'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={() => setSelectedRole(role.value)}
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

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-numoria-ink">{t('name')}</span>
        <input
          type="text"
          name="display_name"
          required
          minLength={1}
          maxLength={100}
          autoComplete="name"
          placeholder={t('namePlaceholder')}
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink placeholder:text-numoria-mid focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          aria-invalid={errors.display_name ? true : undefined}
        />
        {errors.display_name && (
          <span role="alert" className="text-sm text-numoria-red">
            {t('errors.nameRequired')}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-numoria-ink">{t('email')}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 text-base text-numoria-ink placeholder:text-numoria-mid focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30"
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email && (
          <span role="alert" className="text-sm text-numoria-red">
            {t('errors.invalidEmail')}
          </span>
        )}
      </label>

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending}>
        {isPending ? '...' : t('continueWithEmail')}
      </Button>

      {serverError && (
        <p role="alert" className="text-center text-sm text-numoria-red">
          {serverError}
        </p>
      )}

      <div className="my-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-numoria-gray" />
        <span className="text-sm text-numoria-mid">{t('or')}</span>
        <div className="h-px flex-1 bg-numoria-gray" />
      </div>

      <GoogleButton next={next} />
    </form>
  );
}
