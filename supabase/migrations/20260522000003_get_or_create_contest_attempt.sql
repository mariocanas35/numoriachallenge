-- ==========================================================
-- Numoria Challenge — RPC: get_my_contest_attempt
--
-- Problem: When inserting a contest_attempt that already exists (unique
-- constraint on contest_id+student_id), the duplicate key error fires.
-- The previous SELECT with .maybeSingle() returns NULL due to RLS edge
-- cases, causing the code to attempt INSERT instead of returning existing.
--
-- Solution: RPC with SECURITY DEFINER that returns the existing attempt
-- for the currently authenticated student. Bypasses RLS for read-only
-- lookup, scoped to current user only (auth.uid() check).
-- ==========================================================

CREATE OR REPLACE FUNCTION public.get_my_contest_attempt(p_contest_id uuid)
RETURNS TABLE(id uuid, submitted_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT ca.id, ca.submitted_at
  FROM public.contest_attempts ca
  WHERE ca.contest_id = p_contest_id
    AND ca.student_id = auth.uid()
  LIMIT 1;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_contest_attempt(uuid) TO authenticated;
