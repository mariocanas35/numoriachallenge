import { describe, expect, it } from 'vitest';
import { deriveContestState, deriveStudentDivision } from './state';

describe('deriveContestState', () => {
  const ANCHOR = new Date('2026-05-11T16:00:00Z');
  // 10 min antes — dentro del window de 35 min (no expirado todavía)
  const RECENT = new Date('2026-05-11T15:50:00Z');
  const FAR_PAST = new Date('2026-05-10T00:00:00Z'); // hace 40h
  const FUTURE = new Date('2026-05-12T00:00:00Z'); // 8h después

  it('returns completed when attempt.submitted_at is set, regardless of window', () => {
    const result = deriveContestState({
      status: 'active',
      scheduledAt: FAR_PAST.toISOString(),
      durationMinutes: 35,
      attempt: { submitted_at: ANCHOR.toISOString(), total_score: 11, max_possible_score: 14 },
      now: ANCHOR,
    });
    expect(result.state).toBe('completed');
    expect(result.yourScore).toBe(11);
    expect(result.yourMaxScore).toBe(14);
  });

  it('returns expired when contest status is closed', () => {
    const result = deriveContestState({
      status: 'closed',
      scheduledAt: RECENT.toISOString(),
      durationMinutes: 35,
      attempt: null,
      now: ANCHOR,
    });
    expect(result.state).toBe('expired');
  });

  it('returns expired when current time is past scheduled+duration window', () => {
    const result = deriveContestState({
      status: 'active',
      scheduledAt: FAR_PAST.toISOString(),
      durationMinutes: 35,
      attempt: null,
      now: ANCHOR,
    });
    expect(result.state).toBe('expired');
  });

  it('returns upcoming when status is scheduled', () => {
    const result = deriveContestState({
      status: 'scheduled',
      scheduledAt: FUTURE.toISOString(),
      durationMinutes: 35,
      attempt: null,
      now: ANCHOR,
    });
    expect(result.state).toBe('upcoming');
  });

  it('returns upcoming when status=active but scheduled time is in future', () => {
    const result = deriveContestState({
      status: 'active',
      scheduledAt: FUTURE.toISOString(),
      durationMinutes: 35,
      attempt: null,
      now: ANCHOR,
    });
    expect(result.state).toBe('upcoming');
  });

  it('returns in-progress when attempt exists but not submitted', () => {
    const result = deriveContestState({
      status: 'active',
      scheduledAt: RECENT.toISOString(),
      durationMinutes: 35,
      attempt: { submitted_at: null, total_score: 0, max_possible_score: 14 },
      now: ANCHOR,
    });
    expect(result.state).toBe('in-progress');
  });

  it('returns active when window is open and no attempt yet', () => {
    const result = deriveContestState({
      status: 'active',
      scheduledAt: RECENT.toISOString(),
      durationMinutes: 35,
      attempt: null,
      now: ANCHOR,
    });
    expect(result.state).toBe('active');
  });

  it('does not return yourScore for non-completed states', () => {
    const result = deriveContestState({
      status: 'active',
      scheduledAt: RECENT.toISOString(),
      durationMinutes: 35,
      attempt: null,
      now: ANCHOR,
    });
    expect(result.yourScore).toBeUndefined();
    expect(result.yourMaxScore).toBeUndefined();
  });
});

describe('deriveStudentDivision', () => {
  it('prioritizes team.division over grade', () => {
    expect(deriveStudentDivision({ teamDivision: 'middle', grade: 4 })).toBe('middle');
    expect(deriveStudentDivision({ teamDivision: 'elementary', grade: 8 })).toBe('elementary');
  });

  it('derives middle from grade 7+', () => {
    expect(deriveStudentDivision({ teamDivision: null, grade: 7 })).toBe('middle');
    expect(deriveStudentDivision({ teamDivision: null, grade: 8 })).toBe('middle');
  });

  it('derives elementary from grade 1-6', () => {
    expect(deriveStudentDivision({ teamDivision: null, grade: 4 })).toBe('elementary');
    expect(deriveStudentDivision({ teamDivision: null, grade: 5 })).toBe('elementary');
    expect(deriveStudentDivision({ teamDivision: null, grade: 6 })).toBe('elementary');
  });

  it('defaults to elementary when grade is null', () => {
    expect(deriveStudentDivision({ teamDivision: null, grade: null })).toBe('elementary');
  });
});
