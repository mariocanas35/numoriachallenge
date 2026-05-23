import { Link } from '@/i18n/navigation';
import {
  type AggregatedLeaderboardData,
  getPracticesAggregatedLeaderboard,
} from '@/lib/contests/leaderboard';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

/**
 * /contests/practices/leaderboard — Leaderboard AGREGADO de todas las prácticas.
 *
 * Cobertura:
 *   - Suma scores de TODAS las prácticas activas (contest_type='practice')
 *   - Solo cuenta attempts submitted
 *
 * Scope (filtros via query param):
 *   - ?scope=team → estudiantes del team del usuario (default si tiene team)
 *   - ?scope=division → todos los estudiantes de la división del usuario
 *
 * Audiencias:
 *   - Estudiante: ve a sus compañeros del team o la división
 *   - Maestro: ve sus alumnos por team (o vista expandida por división)
 *   - Highlight fila del usuario actual con badge "TÚ"
 */
export default async function PracticesLeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ scope?: string; team?: string }>;
}) {
  const { locale } = await params;
  const { scope: scopeParam, team: teamParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('contests');
  const format = await getFormatter();

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Get profile
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;
  if (!profile) {
    redirect(`/${locale}/auth-error`);
  }

  // Identificar team y división del usuario
  let userTeamId: string | null = null;
  let userTeamName: string | null = null;
  let userDivision: 'elementary' | 'middle' | null = null;

  if (profile.role === 'student') {
    const { data: memberRow } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.id)
      .maybeSingle();
    if (memberRow) {
      const tid = (memberRow as { team_id: string }).team_id;
      const { data: teamRow } = await supabase
        .from('teams')
        .select('id, name, division')
        .eq('id', tid)
        .single();
      const team = teamRow as {
        id: string;
        name: string;
        division: 'elementary' | 'middle';
      } | null;
      if (team) {
        userTeamId = team.id;
        userTeamName = team.name;
        userDivision = team.division;
      }
    }
  } else if (profile.role === 'teacher') {
    // Para teachers, usar el primer team que coach (o el especificado en query)
    const { data: teamsRows } = await supabase
      .from('teams')
      .select('id, name, division')
      .eq('coach_id', user.id)
      .order('created_at', { ascending: true });
    const teams =
      (teamsRows as Array<{
        id: string;
        name: string;
        division: 'elementary' | 'middle';
      }> | null) ?? [];
    if (teams.length > 0) {
      const targetTeam = teamParam ? teams.find((tm) => tm.id === teamParam) : teams[0];
      if (targetTeam) {
        userTeamId = targetTeam.id;
        userTeamName = targetTeam.name;
        userDivision = targetTeam.division;
      }
    }
  }

  // Determinar scope effectivo
  const scope: 'team' | 'division' =
    scopeParam === 'division' ? 'division' : userTeamId ? 'team' : 'division';

  // Fetch leaderboard
  let leaderboardData: AggregatedLeaderboardData;
  if (scope === 'team' && userTeamId) {
    leaderboardData = await getPracticesAggregatedLeaderboard(supabase, {
      currentUserId: user.id,
      teamId: userTeamId,
    });
  } else {
    leaderboardData = await getPracticesAggregatedLeaderboard(supabase, {
      currentUserId: user.id,
      division: userDivision ?? 'elementary',
    });
  }

  // Teacher teams para selector (si es teacher)
  let teacherTeams: Array<{ id: string; name: string; division: 'elementary' | 'middle' }> = [];
  if (profile.role === 'teacher') {
    const { data: tt } = await supabase
      .from('teams')
      .select('id, name, division')
      .eq('coach_id', user.id);
    teacherTeams =
      (tt as Array<{ id: string; name: string; division: 'elementary' | 'middle' }> | null) ?? [];
  }

  const divisionLabel =
    leaderboardData.division === 'elementary'
      ? t('card.divisionE')
      : leaderboardData.division === 'middle'
        ? t('card.divisionM')
        : '';

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumbs */}
      <header>
        <div className="flex items-center gap-2 text-sm text-numoria-mid">
          <Link href="/contests" className="hover:text-numoria-orange hover:underline">
            🏆 {t('listTitle')}
          </Link>
          <span>›</span>
          <Link href="/contests/practices" className="hover:text-numoria-orange hover:underline">
            📚 Prácticas
          </Link>
          <span>›</span>
          <span className="font-bold text-numoria-grafito">Resumen acumulado</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-numoria-grafito sm:text-3xl">
          🏅 Resumen acumulado de prácticas
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">
          Ranking con la suma total de puntos en todas las prácticas completadas.
        </p>
      </header>

      {/* Scope tabs + Teacher team selector */}
      <div className="flex flex-wrap items-center gap-3">
        {userTeamId && (
          <div className="flex gap-2 rounded-xl bg-numoria-cloud p-1">
            <ScopeTab
              active={scope === 'team'}
              href={`/contests/practices/leaderboard?scope=team${teamParam ? `&team=${teamParam}` : ''}`}
              label={`Mi equipo${userTeamName ? `: ${userTeamName}` : ''}`}
            />
            <ScopeTab
              active={scope === 'division'}
              href="/contests/practices/leaderboard?scope=division"
              label={`Toda la división${divisionLabel ? ` (${divisionLabel})` : ''}`}
            />
          </div>
        )}

        {profile.role === 'teacher' && teacherTeams.length > 1 && scope === 'team' && (
          <form className="flex items-center gap-2 text-sm">
            <label htmlFor="team-select" className="text-numoria-mid">
              Equipo:
            </label>
            <select
              id="team-select"
              name="team"
              defaultValue={teamParam ?? teacherTeams[0]?.id ?? ''}
              className="rounded-md border-2 border-numoria-niebla/40 bg-white px-3 py-2 focus:border-numoria-orange focus:outline-none"
            >
              {teacherTeams.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>
            <input type="hidden" name="scope" value="team" />
            <button
              type="submit"
              className="rounded-md bg-numoria-orange px-4 py-2 font-semibold text-white hover:bg-numoria-orange/90"
            >
              Ver
            </button>
          </form>
        )}
      </div>

      {/* Summary card */}
      <div className="rounded-xl border-2 border-numoria-orange/30 bg-numoria-orange/5 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryStat
            label="Estudiantes"
            value={String(leaderboardData.entries.length)}
            icon="👥"
          />
          <SummaryStat
            label="Prácticas activas"
            value={String(leaderboardData.totalPractices)}
            icon="📚"
          />
          {leaderboardData.currentUserRank && (
            <SummaryStat
              label="Tu posición"
              value={`#${leaderboardData.currentUserRank}`}
              icon="🎯"
              highlight
            />
          )}
        </div>
      </div>

      {/* Leaderboard table */}
      {leaderboardData.entries.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-10 text-center">
          <p className="font-display text-lg font-bold text-numoria-grafito">🌱 Aún no hay datos</p>
          <p className="mt-2 text-sm text-numoria-mid">
            Cuando los estudiantes completen prácticas, aparecerán aquí ordenados por puntaje
            acumulado.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border-2 border-numoria-niebla/30 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-numoria-cloud text-xs font-bold uppercase tracking-wider text-numoria-mid">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Estudiante</th>
                <th className="px-4 py-3 text-left">Equipo</th>
                <th className="px-4 py-3 text-right">Score total</th>
                <th className="px-4 py-3 text-right">Prácticas</th>
                <th className="px-4 py-3 text-right">% Promedio</th>
                <th className="px-4 py-3 text-right">Última actividad</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.entries.map((entry) => {
                const percent =
                  entry.totalMaxPossible > 0
                    ? Math.round((entry.totalScore / entry.totalMaxPossible) * 100)
                    : 0;
                return (
                  <tr
                    key={entry.studentId}
                    className={`border-t border-numoria-niebla/20 ${
                      entry.isCurrentUser ? 'bg-numoria-orange/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-numoria-ink">
                      {entry.rank <= 3 ? (
                        <span aria-label={`Top ${entry.rank}`}>
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="text-numoria-mid">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-numoria-ink">
                      {entry.studentName}
                      {entry.isCurrentUser && (
                        <span className="ml-2 rounded-full bg-numoria-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Tú
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-numoria-mid">{entry.teamName}</td>
                    <td className="px-4 py-3 text-right font-bold text-numoria-orange">
                      {entry.totalScore}
                    </td>
                    <td className="px-4 py-3 text-right text-numoria-ink">
                      {entry.practicesCompleted} / {leaderboardData.totalPractices}
                    </td>
                    <td className="px-4 py-3 text-right text-numoria-ink">
                      {entry.totalMaxPossible > 0 ? `${percent}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-numoria-mid">
                      {entry.lastActivityAt
                        ? format.dateTime(new Date(entry.lastActivityAt), {
                            day: 'numeric',
                            month: 'short',
                          })
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ScopeTab({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-white text-numoria-orange shadow-sm'
          : 'text-numoria-mid hover:text-numoria-ink'
      }`}
    >
      {label}
    </Link>
  );
}

function SummaryStat({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-numoria-mid">{label}</p>
        <p
          className={`mt-0.5 font-display text-xl font-bold ${
            highlight ? 'text-numoria-orange' : 'text-numoria-grafito'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
