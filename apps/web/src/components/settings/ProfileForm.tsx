'use client';

import { updateUserProfile } from '@/lib/settings/actions';
import { Button } from '@numoria/ui';
import { useState, useTransition } from 'react';

interface ProfileFormProps {
  initial: {
    display_name: string;
    locale: string;
    email: string;
  };
}

const LOCALES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
];

export function ProfileForm({ initial }: ProfileFormProps) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    setFeedback(null);
    setErrors({});
    startTransition(async () => {
      const result = await updateUserProfile(formData);
      if (result.ok) {
        setFeedback({ kind: 'ok', message: '✅ Perfil actualizado' });
      } else {
        setFeedback({ kind: 'error', message: result.message });
        if (result.fieldErrors) setErrors(result.fieldErrors);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-numoria-grafito">
          Nombre visible <span className="text-numoria-coral">*</span>
        </span>
        <input
          type="text"
          name="display_name"
          defaultValue={initial.display_name}
          required
          maxLength={120}
          className="w-full rounded-lg border-2 border-numoria-gray bg-white px-3 py-2 text-sm focus:border-numoria-orange focus:outline-none"
        />
        {errors.display_name?.[0] && (
          <p className="mt-1 text-xs text-numoria-coral">{errors.display_name[0]}</p>
        )}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-numoria-grafito">Correo</span>
        <input
          type="email"
          defaultValue={initial.email}
          disabled
          className="w-full cursor-not-allowed rounded-lg border-2 border-numoria-gray bg-numoria-cloud px-3 py-2 text-sm text-numoria-mid"
        />
        <p className="mt-1 text-xs text-numoria-niebla">
          El correo no se puede cambiar desde aquí.
        </p>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-numoria-grafito">Idioma preferido</span>
        <select
          name="locale"
          defaultValue={initial.locale}
          className="w-full rounded-lg border-2 border-numoria-gray bg-white px-3 py-2 text-sm focus:border-numoria-orange focus:outline-none"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </label>

      {feedback && (
        <p
          className={`text-sm font-bold ${
            feedback.kind === 'ok' ? 'text-numoria-teal' : 'text-numoria-coral'
          }`}
        >
          {feedback.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
