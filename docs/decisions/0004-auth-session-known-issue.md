# ADR 0004 — Auth session — bug intermitente del PKCE callback

- **Estado:** 🟡 **REABIERTO 2026-05-11 (tarde)** — el bug es real e intermitente
- **Fecha original:** 2026-05-10
- **Primera "resolución" (después invalidada):** 2026-05-11 (mañana)
- **Reapertura:** 2026-05-11 (tarde) durante validación de Chunk 2.7
- **Decididores:** Mario Cañas (founder), Claude Code (co-developer)

## 🔴 ACTUALIZACIÓN 2026-05-11 (tarde): bug es real, NO falso positivo

Durante la validación de Chunk 2.7 (role-aware dashboards), el founder intentó
registrarse como teacher con `mcanas@seishn.com`. El flow falló idéntico a Phase 1:

1. Form `/register` con role=teacher
2. Magic link enviado → email recibido
3. Click en link → callback intenta `exchangeCodeForSession(code)` → falla
4. Redirect a `/auth/error?reason=exchange_failed`

**La "resolución" como falso positivo de la mañana fue incorrecta.** Lo que pasó
ese día con `mimathonline+phase1test@gmail.com` fue una **coincidencia de cookies**:
el browser tenía las cookies PKCE bien posicionadas en ese intento específico. La
nueva validación demuestra que el bug es **intermitente y reproducible**.

### Causas plausibles del intermitency

1. **PKCE verifier cookie pierde en restarts del dev server** — el cookie persiste
   pero Next.js/Supabase puede invalidar el contexto
2. **Click del link en browser diferente al del register** — si el user abrió Gmail
   en Edge pero el dev en Chrome, el cookie del verifier no existe en Edge
3. **Hard refresh (Ctrl+Shift+R)** entre registrar y clickear el link puede limpiar
   cookies de sesión SameSite=Lax
4. **Brave Shields / extensions de privacy** bloquean el cookie roundtrip

### Workaround inmediato

Como el bug es de **callback** y NO de creación de user:

- El user `mcanas@seishn.com` SÍ existe en `auth.users` después del primer intento
- Probar **login** (no register) con el mismo email → magic link nuevo → callback
  debería funcionar si el cookie PKCE persiste
- Si sigue fallando: usar **Google OAuth** que no depende del cookie PKCE

### Solución real — implementar en Phase 2.8 antes de cerrar Phase 2

**Opción preferida:** switch a **OTP code flow** (6-digit code) en lugar de magic link.

```ts
// En lugar de:
await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } });

// Hacer:
await supabase.auth.signInWithOtp({ email });
// User ingresa código de 6 dígitos en una página, no se redirige
await supabase.auth.verifyOtp({ email, token: '123456', type: 'email' });
```

Esto elimina el PKCE cookie roundtrip completamente. Trade-off: 1 click más para
el usuario (tipear el código), pero gana confiabilidad 100%.

**Opción alternativa:** upgrade `@supabase/ssr` a 0.6.x (cuando esté released
estable) — puede traer fixes al cookie handling.

### Tech debt explícito para Chunk 2.8

- [ ] Implementar OTP code flow como reemplazo del magic link
- [ ] Mantener Google OAuth (funciona, no usa PKCE)
- [ ] Update /auth/error page con tips de recovery
- [ ] Test E2E con Playwright que valide el callback flow end-to-end
- [ ] Considerar bajar dependencia a @supabase/ssr canary si 0.6 no está released

---

## 🟢 (HISTÓRICO — invalidado) Resolución 2026-05-11 (mañana)

Esta sección documentaba la "resolución" como falso positivo pero la nueva
evidencia del 11 de mayo en la tarde la invalida. Se mantiene por trazabilidad.

## 🟢 ACTUALIZACIÓN 2026-05-11: bug FALSO POSITIVO

Después de construir el componente `AuthIndicator` (badge flotante esquina superior derecha que muestra estado de auth), se descubrió que **la sesión SÍ se establecía correctamente** en todos los intentos anteriores. El usuario percibía "no funciona" porque después del callback la app redirige a `/{locale}/` que era visualmente idéntica a la landing pública — no había ningún indicio visible de "estás logueado".

**Validación end-to-end exitosa con `mimathonline+phase1test@gmail.com`:**
1. ✅ Signup form (role=teacher seleccionado)
2. ✅ Email magic link enviado (bypaseando rate limit con alias Gmail `+phase1test`)
3. ✅ Click en magic link
4. ✅ Callback intercambia code → sesión cookies establecidas
5. ✅ Redirige a /es/
6. ✅ AuthIndicator badge muestra "Mario Ernesto Cañas · 👩‍🏫 Profesor"
7. ✅ Trigger handle_new_user creó profile con todos los metadata correctos

**Sub-issue menor descubierto:** la query a `profiles` desde un Server Component con cliente normal (anon key + session cookie) devuelve null aunque el profile existe. Probable que @supabase/ssr 0.5.x no propaga el JWT correctamente al postgrest call en contexto de Server Component, haciendo que RLS auth.uid() devuelva null. **Workaround temporal:** AuthIndicator usa admin client (service_role) para leer su propio profile — seguro porque solo lee `user.id` ya autenticado.

**Tech debt para Phase 2 Chunk 2.x:**
- Investigar por qué auth.uid() devuelve null en postgrest desde Server Components
- Posibles soluciones: (a) upgrade a @supabase/ssr 0.6+, (b) crear RPC `get_my_profile()` con SECURITY DEFINER, (c) refactor a Client Component que use createBrowserClient
- Reemplazar admin client usage en AuthIndicator con solución limpia

---

## 📚 Contexto histórico (para referencia)

- **Estado original:** Aceptado como issue conocido — diferido a Phase 2 Chunk 2.0

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
