/**
 * Numoria Challenge — Commitlint config
 * Conventional Commits: https://www.conventionalcommits.org
 *
 * Tipos permitidos:
 *   feat     — nueva funcionalidad
 *   fix      — corrección de bug
 *   docs     — solo documentación
 *   style    — formato (sin cambio de lógica)
 *   refactor — cambio de código sin nueva feature ni bug fix
 *   perf     — mejora de performance
 *   test     — agregar/corregir tests
 *   build    — cambios al sistema de build o deps
 *   ci       — cambios a CI/CD
 *   chore    — mantenimiento general
 *   revert   — revertir un commit anterior
 *
 * Ejemplos válidos:
 *   feat(auth): agregar login con Google OAuth
 *   fix(competition): corregir cálculo de puntaje cuando timer expira
 *   docs: actualizar PROGRESS.md con cierre de Fase 1
 *
 * Scopes sugeridos: web, mobile, admin, ui, i18n, db, auth, ai, grading,
 * gamification, comp (competition), cert (certificate), infra, ci, deps
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-case': [0],
    'subject-max-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [0],
  },
};
