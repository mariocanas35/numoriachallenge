'use client';

import { updateSchoolDetails, updateSchoolLogo } from '@/lib/settings/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';

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
  const t = useTranslations('settings');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Logo upload — estado separado del form principal porque es un upload
  // independiente con su propio botón y feedback (no comparte el "Guardar
  // cambios" del form de texto).
  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logo_url);
  const [logoPending, startLogoTransition] = useTransition();
  const [logoFeedback, setLogoFeedback] = useState<{
    kind: 'ok' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(formData: FormData) {
    setFeedback(null);
    setErrors({});
    startTransition(async () => {
      const result = await updateSchoolDetails(formData);
      if (result.ok) {
        setFeedback({ kind: 'ok', message: t('school.successMessage') });
      } else {
        setFeedback({ kind: 'error', message: result.message });
        if (result.fieldErrors) setErrors(result.fieldErrors);
      }
    });
  }

  function handleLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFeedback(null);
    const formData = new FormData();
    formData.append('logo', file);
    startLogoTransition(async () => {
      const result = await updateSchoolLogo(formData);
      if (result.ok && result.data) {
        setLogoUrl(result.data.logoUrl);
        setLogoFeedback({ kind: 'ok', message: t('school.logoUploadSuccess') });
      } else if (!result.ok) {
        setLogoFeedback({ kind: 'error', message: result.message });
      }
      // Reset el input para permitir re-subir el mismo archivo si user lo desea
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {/* Logo upload — fuera del form principal porque envía su propio
          POST con file; el form de texto solo maneja strings. */}
      <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-numoria-gray bg-numoria-cloud p-4 sm:flex-row sm:items-center">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={t('school.logoLabel')}
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
          <p className="font-bold text-numoria-grafito">{t('school.logoLabel')}</p>
          <p className="mt-1">{logoUrl ? t('school.logoHint') : t('school.logoNoFile')}</p>
          {logoFeedback && (
            <p
              className={`mt-2 font-bold ${
                logoFeedback.kind === 'ok' ? 'text-numoria-teal' : 'text-numoria-coral'
              }`}
            >
              {logoFeedback.message}
            </p>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleLogoSelected}
            disabled={logoPending}
            className="hidden"
            // Necesita id para que el label/button externo no lo confunda con el form
            id="school-logo-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={logoPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {logoPending ? t('school.logoUploading') : t('school.logoUploadButton')}
          </Button>
        </div>
      </div>

      {/* Nombre */}
      <Field
        label={t('school.nameLabel')}
        name="name"
        defaultValue={initial.name}
        required
        errors={errors.name}
      />

      {/* País + Ciudad */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-numoria-grafito">
            {t('school.countryLabel')} <span className="text-numoria-coral">*</span>
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
        <Field
          label={t('school.cityLabel')}
          name="city"
          defaultValue={initial.city ?? ''}
          errors={errors.city}
        />
      </div>

      <Field
        label={t('school.addressLabel')}
        name="address"
        defaultValue={initial.address ?? ''}
        placeholder={t('school.addressPlaceholder')}
        errors={errors.address}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label={t('school.phoneLabel')}
          name="phone"
          defaultValue={initial.phone ?? ''}
          placeholder={t('school.phonePlaceholder')}
          errors={errors.phone}
        />
        <Field
          label={t('school.websiteLabel')}
          name="website"
          defaultValue={initial.website ?? ''}
          placeholder={t('school.websitePlaceholder')}
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
          {pending ? t('saving') : t('saveButton')}
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
