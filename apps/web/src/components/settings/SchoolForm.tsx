'use client';

import { updateSchoolDetails } from '@/lib/settings/actions';
import { Button } from '@numoria/ui';
import Image from 'next/image';
import { useState, useTransition } from 'react';

interface SchoolFormProps {
  initial: {
    name: string;
    country_code: string;
    city: string | null;
    address: string | null;
    phone: string | null;
    website: string | null;
    logo_url: string | null;
    verified: boolean;
  };
}

const COUNTRIES = [
  { code: 'HN', label: 'Honduras' },
  { code: 'GT', label: 'Guatemala' },
  { code: 'SV', label: 'El Salvador' },
  { code: 'NI', label: 'Nicaragua' },
  { code: 'CR', label: 'Costa Rica' },
  { code: 'PA', label: 'Panamá' },
  { code: 'MX', label: 'México' },
  { code: 'CO', label: 'Colombia' },
  { code: 'PE', label: 'Perú' },
  { code: 'CL', label: 'Chile' },
  { code: 'AR', label: 'Argentina' },
  { code: 'EC', label: 'Ecuador' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'PY', label: 'Paraguay' },
  { code: 'BO', label: 'Bolivia' },
  { code: 'VE', label: 'Venezuela' },
  { code: 'DO', label: 'República Dominicana' },
  { code: 'CU', label: 'Cuba' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'ES', label: 'España' },
];

export function SchoolForm({ initial }: SchoolFormProps) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    setFeedback(null);
    setErrors({});
    startTransition(async () => {
      const result = await updateSchoolDetails(formData);
      if (result.ok) {
        setFeedback({ kind: 'ok', message: '✅ Datos de escuela guardados' });
      } else {
        setFeedback({ kind: 'error', message: result.message });
        if (result.fieldErrors) setErrors(result.fieldErrors);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {/* Logo (read-only en esta iteración) */}
      <div className="flex items-center gap-4 rounded-xl border-2 border-dashed border-numoria-gray bg-numoria-cloud p-4">
        {initial.logo_url ? (
          <Image
            src={initial.logo_url}
            alt="Logo de la escuela"
            width={64}
            height={64}
            className="h-16 w-16 rounded-lg object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-numoria-gray text-2xl text-numoria-mid">
            🏫
          </div>
        )}
        <div className="flex-1 text-xs text-numoria-mid">
          <p className="font-bold text-numoria-grafito">Logo de la escuela</p>
          <p className="mt-1">
            Cambio de logo: próximamente. Por ahora muestra el subido en onboarding.
          </p>
        </div>
      </div>

      {/* Nombre */}
      <Field
        label="Nombre de la escuela"
        name="name"
        defaultValue={initial.name}
        required
        errors={errors.name}
      />

      {/* País + Ciudad */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-numoria-grafito">
            País <span className="text-numoria-coral">*</span>
          </span>
          <select
            name="country_code"
            defaultValue={initial.country_code}
            required
            className="w-full rounded-lg border-2 border-numoria-gray bg-white px-3 py-2 text-sm focus:border-numoria-orange focus:outline-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.country_code?.[0] && (
            <p className="mt-1 text-xs text-numoria-coral">{errors.country_code[0]}</p>
          )}
        </label>
        <Field label="Ciudad" name="city" defaultValue={initial.city ?? ''} errors={errors.city} />
      </div>

      <Field
        label="Dirección"
        name="address"
        defaultValue={initial.address ?? ''}
        placeholder="Calle, número, colonia"
        errors={errors.address}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Teléfono"
          name="phone"
          defaultValue={initial.phone ?? ''}
          placeholder="(+504) 1234-5678"
          errors={errors.phone}
        />
        <Field
          label="Sitio web"
          name="website"
          defaultValue={initial.website ?? ''}
          placeholder="https://escuela.edu"
          errors={errors.website}
        />
      </div>

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

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  errors,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  errors?: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-numoria-grafito">
        {label}
        {required && <span className="text-numoria-coral"> *</span>}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border-2 border-numoria-gray bg-white px-3 py-2 text-sm focus:border-numoria-orange focus:outline-none"
      />
      {errors?.[0] && <p className="mt-1 text-xs text-numoria-coral">{errors[0]}</p>}
    </label>
  );
}
