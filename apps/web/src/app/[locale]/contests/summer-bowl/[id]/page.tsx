'use client';

import { registerForBowl } from '@/lib/contests/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

export default function SummerBowlRegisterPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const tsb = useTranslations('contests.summerBowl');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDivision) {
      setMessage('Por favor selecciona una división');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const result = await registerForBowl({
      bowlId: params.id,
      division: selectedDivision,
    });

    if (result.ok) {
      setMessage('¡Registrado exitosamente! Pronto tendrás instrucciones.');
      // TODO: redirect to bowl dashboard or results page
    } else {
      setMessage(result.message || 'Error al registrar');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md sm:rounded-lg sm:shadow">
        <div className="space-y-8 px-4 py-8 sm:px-10">
          <div className="space-y-2">
            <Link href="/contests/practices" className="text-sm text-numoria-mid hover:underline">
              ← Volver a prácticas
            </Link>
            <h1 className="font-display text-2xl font-bold text-numoria-grafito">
              Summer Bowl 2026
            </h1>
            <p className="text-sm text-numoria-mid">Completa tu registro para participar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="space-y-3">
              <legend className="block text-sm font-semibold text-numoria-grafito">División</legend>
              <div className="space-y-2">
                {['elementary', 'middle', 'high'].map((division) => (
                  <label key={division} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="division"
                      value={division}
                      checked={selectedDivision === division}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="h-4 w-4 text-numoria-orange"
                    />
                    <span className="text-sm text-numoria-grafito">
                      {tsb(`division.${division}`)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {message && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  message.includes('exitosamente')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !selectedDivision}
              className="w-full"
              variant="primary"
            >
              {isSubmitting ? 'Registrando...' : 'Registrarme'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
