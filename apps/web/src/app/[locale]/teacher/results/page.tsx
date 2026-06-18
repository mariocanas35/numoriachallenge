import { Link } from '@/i18n/navigation';
import { getTeacherStudentResults } from '@/lib/contests/teacher-results';
import { createServerClient } from '@numoria/database/server';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const TYPE_LABEL: Record<string, string> = {
  practice: 'Práctica',
  official: 'Oficial',
  summer_bowl: 'Summer Bowl',
};

function fmtDate(iso: string): string {
  // Formato corto es-HN; sin hora.
  return new Date(iso).toLocaleDateString('es-HN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * /teacher/results — "Resultados de mis estudiantes".
 *
 * Para cada challenge en el que participaron los estudiantes del maestro,
 * muestra el detalle por estudiante (puntaje, correctas, estado). Solo maestros.
 * Interfaz en español (panel docente).
 */
export default async function TeacherResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profileData } = await supabase.rpc('get_my_profile');
  const profile = profileData as { role?: string } | null;
  if (profile?.role !== 'teacher') {
    redirect(`/${locale}`);
  }

  const { totalMembers, challenges } = await getTeacherStudentResults(supabase, user.id);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-6">
        <Link href="/" className="text-sm text-numoria-mid underline-offset-2 hover:underline">
          ← Volver al panel
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-numoria-ink">
          📊 Resultados de mis estudiantes
        </h1>
        <p className="mt-1 text-sm text-numoria-mid">
          Puntajes de tu clase en cada challenge. Calificación automática.
        </p>
      </header>

      {totalMembers === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-numoria-orange/40 bg-numoria-orange/5 p-8 text-center">
          <p className="text-3xl" aria-hidden="true">
            👥
          </p>
          <p className="mt-2 font-display text-lg font-bold text-numoria-ink">
            Aún no tienes estudiantes en tu clase
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-numoria-mid">
            Invita a tus estudiantes con el código de tu equipo. Cuando se unan y participen en un
            challenge, sus resultados aparecerán aquí.
          </p>
          <Link
            href="/teams"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-numoria-indigo px-5 py-2.5 text-sm font-bold text-white transition hover:bg-numoria-indigo/90"
          >
            Ir a mis equipos →
          </Link>
        </div>
      ) : challenges.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-numoria-gray bg-white p-8 text-center">
          <p className="text-3xl" aria-hidden="true">
            🕒
          </p>
          <p className="mt-2 font-display text-lg font-bold text-numoria-ink">
            Tus estudiantes aún no han participado
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-numoria-mid">
            Tienes {totalMembers} estudiante{totalMembers === 1 ? '' : 's'} en tu clase. En cuanto
            resuelvan un challenge, verás aquí sus puntajes.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {challenges.map((ch) => {
            const submitted = ch.students.filter((s) => s.submittedAt !== null);
            const avg =
              submitted.length > 0
                ? Math.round(submitted.reduce((sum, s) => sum + s.score, 0) / submitted.length)
                : null;
            return (
              <section
                key={ch.contestId}
                className="rounded-2xl border-2 border-numoria-gray bg-white"
              >
                <header className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-numoria-gray px-5 py-4">
                  <div>
                    <h2 className="font-display text-lg font-bold text-numoria-ink">
                      {ch.titleEs}
                    </h2>
                    <p className="text-xs text-numoria-mid">{fmtDate(ch.scheduledAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-numoria-indigo/10 px-2.5 py-0.5 text-xs font-bold text-numoria-indigo">
                      {TYPE_LABEL[ch.contestType] ?? ch.contestType}
                    </span>
                    <span className="text-xs text-numoria-mid">
                      {submitted.length}/{ch.totalMembers} entregaron
                      {avg !== null ? ` · prom. ${avg}` : ''}
                    </span>
                  </div>
                </header>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-numoria-mid">
                        <th className="px-5 py-2 font-semibold">Estudiante</th>
                        <th className="px-3 py-2 font-semibold">Puntaje</th>
                        <th className="px-3 py-2 font-semibold">Correctas</th>
                        <th className="px-3 py-2 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ch.students.map((s) => (
                        <tr key={s.studentId} className="border-t border-numoria-gray/60">
                          <td className="px-5 py-2.5 font-semibold text-numoria-ink">{s.name}</td>
                          <td className="px-3 py-2.5 text-numoria-grafito">
                            {s.score}
                            <span className="text-numoria-mid">/{s.maxScore}</span>
                          </td>
                          <td className="px-3 py-2.5 text-numoria-grafito">{s.correct}</td>
                          <td className="px-3 py-2.5">
                            {s.submittedAt ? (
                              <span className="font-semibold text-numoria-green">✓ Entregado</span>
                            ) : (
                              <span className="text-numoria-mid">En progreso</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
