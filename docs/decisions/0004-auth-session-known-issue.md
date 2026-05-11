# ADR 0004 — Known issue: auth session establishment after magic link / OAuth callback

- **Estado:** Aceptado como issue conocido — diferido a Phase 2 Chunk 2.0
- **Fecha:** 2026-05-10
- **Decididores:** Mario Cañas (founder), Claude Code (co-developer)

---

## Contexto

Durante las pruebas manuales de Chunk 1.7 (auth flow), descubrimos que el signup vía magic link y vía Google OAuth crean correctamente el usuario en `auth.users` y el profile en `public.profiles` (vía trigger `handle_new_user`), pero el **callback handler falla al establecer la sesión activa** en el navegador, mostrando `/auth/error?reason=exchange_failed`.

## Diagnóstico

El flujo completo es:

1. Usuario submite form de signup → server action `signUpWithEmail` llama `supabase.auth.signInWithOtp(...)` ✅
2. Supabase envía correo con magic link ✅
3. Usuario hace click → browser navega a `https://biqxblpfgagzsjsflnhh.supabase.co/auth/v1/verify?token=...`
4. Supabase verifica token, crea user, marca email confirmed ✅
5. **Trigger `handle_new_user` crea profile** ✅
6. Supabase redirige a `http://localhost:3000/auth/callback?code=...`
7. Nuestro route handler llama `supabase.auth.exchangeCodeForSession(code)` ❌ **FALLA**

Pruebas realizadas con `mcanas@seishn.com` (magic link) y cuenta Google personal — ambos crean el user y profile correctamente. Solo falla el último paso.

## Causa probable

PKCE (Proof Key for Code Exchange) requiere un cookie `sb-...-auth-token-code-verifier` que se establece en el paso 1 y se lee en el paso 7. El cookie no está disponible cuando el callback handler corre porque:

1. **Brave Browser Shields** puede estar bloqueando cookies de privacy
2. **Cookies de PKCE pueden no estar persistiendo** correctamente entre la server action y el route handler en Next.js 15 + @supabase/ssr 0.5.2
3. **SameSite policies** durante el round-trip a supabase.co podrían descartar el cookie

## Decisión

**Diferir el debug a Phase 2 Chunk 2.0** porque:

- El código de auth está completo y arquitecturalmente correcto
- El database side funciona al 100% (validado con queries en Supabase Dashboard)
- El problema requiere debugging en profundidad de cookies/PKCE que puede consumir horas
- No bloquea el cierre de Phase 1 (todos los demás chunks están funcionales)
- Phase 2 abre con onboarding + roles, que naturalmente requerirá refactor del auth flow

## Próximos pasos (Phase 2 Chunk 2.0)

### Opciones a explorar (en orden de simplicidad)

1. **Test en Chrome** — descartar Brave Shields como causa
2. **Verificar cookies en DevTools** post-signInWithOtp — confirmar que el verifier cookie se está estableciendo
3. **Cambiar a OTP code flow** (6-digit code via email) en lugar de magic link — bypassa el PKCE cookie roundtrip completamente
4. **Verificar cookie names** vs lo que espera @supabase/ssr 0.5.2 — puede haber un mismatch
5. **Considerar upgrade** a @supabase/ssr 0.6+ si ya está released — puede tener fixes

### Definition of Done para Chunk 2.0

- Magic link signup → user creado + sesión activa en navegador
- Magic link login → sesión activa
- Google OAuth → sesión activa
- E2E test en Playwright cubriendo el flow completo (con mock de email)

## Workarounds para development en Phase 2

Mientras se debuggea, para test manual:

1. **Crear users vía SQL Editor en Supabase:** `INSERT INTO auth.users (email, ...) VALUES (...)`
2. **Usar magic link en Chrome incognito** (sin extensiones que bloqueen cookies)
3. **Implementar dev-only signin que bypassa el callback** — server action que crea sesión directamente con service_role key (solo NODE_ENV=development)

## Impacto en MVP timeline

**Cero impacto.** El bug se ataca en la primera semana de Phase 2 antes de empezar onboarding. Cierre de Phase 1 procede según plan.
