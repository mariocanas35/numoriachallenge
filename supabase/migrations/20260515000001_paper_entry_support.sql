-- ==========================================================
-- Numoria Challenge — Migration 0019: Paper-entry support
--
-- Phase 4 Chunk 4.2a — agrega soporte para que teachers transcriban
-- respuestas de papel (boletines impresos) a la plataforma.
--
-- Modelo dual de delivery (memory: business-model-decisions.md):
--   - Online: student toma contest en /contests/[id] con timer, autosave, etc.
--   - Paper:  teacher imprime PDF (Phase 4.3), students toman en papel,
--             teacher transcribe respuestas vía UI /contests/[id]/paper-entry
--
-- Ambos generan filas en contest_attempts + problem_attempts. Diferencia:
--   - is_paper_entry=false (default): attempt online
--   - is_paper_entry=true: attempt creado por teacher via paper-entry batch
--
-- Time tracking en paper attempts:
--   - started_at = submitted_at = momento de la transcripción (no del paper)
--   - time_spent_seconds = NULL (no se mide para paper)
--
-- Audit: el contest_session.notes puede registrar "paper batch by <teacher>"
-- pero el column is_paper_entry es el flag autoritativo para queries/leaderboard.
-- ==========================================================

alter table public.contest_attempts
  add column is_paper_entry boolean not null default false;

create index contest_attempts_paper_entry_idx
  on public.contest_attempts(is_paper_entry)
  where is_paper_entry = true;

comment on column public.contest_attempts.is_paper_entry is
  'TRUE si el attempt fue creado por teacher vía paper-entry UI (Phase 4.2). FALSE para attempts online normales. Phase 3 attempts legacy son FALSE por default.';
