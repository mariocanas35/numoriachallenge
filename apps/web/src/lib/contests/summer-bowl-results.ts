import { createAdminClient } from '@numoria/database/server';
import type { Database } from '@numoria/database/types';

/**
 * Resultados públicos del Summer Bowl (cuadro de honor + estadísticas).
 *
 * Se calcula en el servidor con la service role porque cruza datos de varios
 * estudiantes. Solo sale de aquí lo que se puede publicar:
 *   - nombre + inicial del apellido (formatPublicName), colegio y país
 *   - puntajes y estadísticas agregadas
 *   - los problemas con su respuesta y solución, SOLO cuando la ventana del
 *     bowl ya cerró (antes de eso devuelve null y la página da 404).
 * Nunca correos, apellidos completos ni fechas de nacimiento.
 */

export const SUMMER_BOWL_1_SLUG = 'numoria-sb1-2026';

type ProblemCategory = Database['public']['Enums']['problem_category'];

export interface HonorRollEntry {
  rank: number;
  name: string;
  school: string | null;
  countryCode: string | null;
  score: number;
  correct: number;
}

export interface ProblemResult {
  position: number;
  category: ProblemCategory;
  points: number;
  /** 0..1, sobre el total de participantes que enviaron. */
  correctRate: number;
  titleEs: string;
  titleEn: string;
  bodyEs: string;
  bodyEn: string;
  expectedAnswer: string;
  explanationEs: string | null;
  explanationEn: string | null;
  diagramUrl: string | null;
  diagramCaptionEs: string | null;
  diagramCaptionEn: string | null;
}

export interface SummerBowlResults {
  titleEs: string;
  titleEn: string;
  division: Database['public']['Enums']['school_division'];
  calculatorAllowed: boolean;
  durationMinutes: number;
  startsAt: string;
  endsAt: string;
  maxScore: number;
  participants: number;
  averageScore: number;
  medianScore: number;
  bestScore: number;
  averageMinutes: number | null;
  countryCodes: string[];
  honorRoll: HonorRollEntry[];
  problems: ProblemResult[];
}

/**
 * Convierte el display_name que escribió el estudiante en "Nombre I.".
 *
 * - Quita números, emojis y símbolos ("Dennis Portillo 7 🥶" → "Dennis P.").
 * - Separa por espacios, puntos, guiones y guiones bajos
 *   ("ricardo.jacome.2012" → "Ricardo J.").
 * - Una sola palabra que venía de un usuario con números o separadores
 *   ("fvalerio528") podría contener el apellido completo: se muestra solo la
 *   inicial ("F."). Una sola palabra limpia ("Cesar") se muestra tal cual.
 */
export function formatPublicName(raw: string | null | undefined): string {
  const original = (raw ?? '').normalize('NFC').trim();
  const words = original
    .replace(/[^\p{L}\s._'-]/gu, ' ')
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, ''))
    .filter((w) => w.length > 0);

  if (words.length === 0) return '—';

  const capitalize = (w: string) =>
    w.charAt(0).toLocaleUpperCase('es') + w.slice(1).toLocaleLowerCase('es');
  const initial = (w: string) => `${w.charAt(0).toLocaleUpperCase('es')}.`;

  const first = words[0] as string;
  if (words.length === 1) {
    const looksLikeUsername = /[\d._-]/.test(original);
    return looksLikeUsername ? initial(first) : capitalize(first);
  }
  const last = words[words.length - 1] as string;
  return `${capitalize(first)} ${initial(last)}`;
}

/**
 * Ranking de competencia: mismo puntaje, mismo puesto; el siguiente salta
 * (13, 12, 12, 10 → 1, 2, 2, 4). Desempata el orden de presentación por nombre.
 */
export function rankByScore<T extends { score: number; name: string }>(
  rows: T[],
): Array<T & { rank: number }> {
  const sorted = [...rows].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'es'));
  let previousScore: number | null = null;
  let previousRank = 0;
  return sorted.map((row, index) => {
    const rank = row.score === previousScore ? previousRank : index + 1;
    previousScore = row.score;
    previousRank = rank;
    return { ...row, rank };
  });
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2
    : (sorted[mid] as number);
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getSummerBowlResults(
  slug: string = SUMMER_BOWL_1_SLUG,
  now: Date = new Date(),
): Promise<SummerBowlResults | null> {
  const admin = createAdminClient();

  const { data: contestRow } = await admin
    .from('contests')
    .select(
      'id, title_es, title_en, division, calculator_allowed, scheduled_at, calendar_window_days, duration_minutes',
    )
    .eq('slug', slug)
    .maybeSingle();
  const contest = contestRow as {
    id: string;
    title_es: string;
    title_en: string;
    division: Database['public']['Enums']['school_division'];
    calculator_allowed: boolean;
    scheduled_at: string;
    calendar_window_days: number | null;
    duration_minutes: number;
  } | null;
  if (!contest) return null;

  const startsAt = new Date(contest.scheduled_at);
  const endsAt = new Date(startsAt.getTime() + (contest.calendar_window_days ?? 0) * DAY_MS);
  // Nunca publicar resultados ni soluciones mientras la ventana siga abierta.
  if (now < endsAt) return null;

  const { data: attemptRows } = await admin
    .from('contest_attempts')
    .select('id, student_id, total_score, total_correct, max_possible_score, time_spent_seconds')
    .eq('contest_id', contest.id)
    .not('submitted_at', 'is', null);
  const attempts = (attemptRows ?? []) as Array<{
    id: string;
    student_id: string;
    total_score: number;
    total_correct: number;
    max_possible_score: number;
    time_spent_seconds: number | null;
  }>;

  const studentIds = [...new Set(attempts.map((a) => a.student_id))];
  const { data: profileRows } = studentIds.length
    ? await admin
        .from('profiles')
        .select('id, display_name, country_code, school_id')
        .in('id', studentIds)
    : { data: [] };
  const profiles = new Map(
    (
      (profileRows ?? []) as Array<{
        id: string;
        display_name: string | null;
        country_code: string | null;
        school_id: string | null;
      }>
    ).map((p) => [p.id, p]),
  );

  const schoolIds = [...new Set([...profiles.values()].map((p) => p.school_id).filter(Boolean))];
  const { data: schoolRows } = schoolIds.length
    ? await admin
        .from('schools')
        .select('id, name')
        .in('id', schoolIds as string[])
    : { data: [] };
  const schools = new Map(
    ((schoolRows ?? []) as Array<{ id: string; name: string }>).map((s) => [s.id, s.name]),
  );

  const { data: cpRows } = await admin
    .from('contest_problems')
    .select('position, problem_id')
    .eq('contest_id', contest.id)
    .order('position', { ascending: true });
  const positions = (cpRows ?? []) as Array<{ position: number; problem_id: string }>;

  const { data: problemRows } = positions.length
    ? await admin
        .from('problems')
        .select(
          'id, category, points, title_es, title_en, body_es, body_en, expected_answer, explanation_es, explanation_en, has_diagram, diagram_svg_url, diagram_caption_es, diagram_caption_en',
        )
        .in(
          'id',
          positions.map((p) => p.problem_id),
        )
    : { data: [] };
  const problemsById = new Map(
    (
      (problemRows ?? []) as Array<{
        id: string;
        category: ProblemCategory;
        points: number;
        title_es: string;
        title_en: string;
        body_es: string;
        body_en: string;
        expected_answer: string;
        explanation_es: string | null;
        explanation_en: string | null;
        has_diagram: boolean;
        diagram_svg_url: string | null;
        diagram_caption_es: string | null;
        diagram_caption_en: string | null;
      }>
    ).map((p) => [p.id, p]),
  );

  const { data: answerRows } = attempts.length
    ? await admin
        .from('problem_attempts')
        .select('problem_id, is_correct')
        .in(
          'contest_attempt_id',
          attempts.map((a) => a.id),
        )
    : { data: [] };
  const correctByProblem = new Map<string, number>();
  for (const row of (answerRows ?? []) as Array<{
    problem_id: string;
    is_correct: boolean | null;
  }>) {
    if (row.is_correct) {
      correctByProblem.set(row.problem_id, (correctByProblem.get(row.problem_id) ?? 0) + 1);
    }
  }

  const honorRoll = rankByScore(
    attempts.map((a) => {
      const profile = profiles.get(a.student_id);
      return {
        name: formatPublicName(profile?.display_name),
        school: profile?.school_id ? (schools.get(profile.school_id) ?? null) : null,
        countryCode: profile?.country_code ?? null,
        score: a.total_score,
        correct: a.total_correct,
      };
    }),
  );

  const scores = attempts.map((a) => a.total_score);
  // Tiempos fuera de la duración (intentos que se cerraron solos días después)
  // no representan tiempo real de resolución.
  const minutes = attempts
    .map((a) => a.time_spent_seconds)
    .filter((s): s is number => s !== null && s <= contest.duration_minutes * 60)
    .map((s) => s / 60);

  const participants = attempts.length;
  const problems: ProblemResult[] = [];
  for (const { position, problem_id } of positions) {
    const p = problemsById.get(problem_id);
    if (!p) continue;
    problems.push({
      position,
      category: p.category,
      points: p.points,
      correctRate: participants ? (correctByProblem.get(p.id) ?? 0) / participants : 0,
      titleEs: p.title_es,
      titleEn: p.title_en,
      bodyEs: p.body_es,
      bodyEn: p.body_en,
      expectedAnswer: p.expected_answer,
      explanationEs: p.explanation_es,
      explanationEn: p.explanation_en,
      diagramUrl: p.has_diagram ? p.diagram_svg_url : null,
      diagramCaptionEs: p.diagram_caption_es,
      diagramCaptionEn: p.diagram_caption_en,
    });
  }

  return {
    titleEs: contest.title_es,
    titleEn: contest.title_en,
    division: contest.division,
    calculatorAllowed: contest.calculator_allowed,
    durationMinutes: contest.duration_minutes,
    startsAt: startsAt.toISOString(),
    // La ventana cubre N días desde el inicio: el último día es endsAt - 1.
    endsAt: new Date(endsAt.getTime() - DAY_MS).toISOString(),
    maxScore: problems.reduce((sum, p) => sum + p.points, 0),
    participants,
    averageScore: participants ? scores.reduce((s, x) => s + x, 0) / participants : 0,
    medianScore: median(scores),
    bestScore: participants ? Math.max(...scores) : 0,
    averageMinutes: minutes.length ? minutes.reduce((s, x) => s + x, 0) / minutes.length : null,
    countryCodes: [
      ...new Set(honorRoll.map((h) => h.countryCode).filter((c): c is string => Boolean(c))),
    ],
    honorRoll,
    problems,
  };
}
