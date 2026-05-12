# Supabase Email Templates — Numoria Challenge

> **Problema que resuelve**: A veces Supabase envía solo el magic link (que falla por PKCE bug, ADR 0004) sin el código OTP de 6 dígitos. Esto es porque los templates default solo incluyen `{{ .ConfirmationURL }}`, no `{{ .Token }}`. La solución: actualizar los 3 templates para que SIEMPRE incluyan ambos, con el código prominente.
>
> **Ubicación en Supabase Dashboard**: Authentication → Email Templates → (Confirm signup / Magic Link / Reauthentication)
>
> **Variables disponibles**:
> - `{{ .Token }}` — código OTP 6 dígitos
> - `{{ .ConfirmationURL }}` — magic link
> - `{{ .Email }}` — email del usuario
> - `{{ .SiteURL }}` — URL del sitio
> - `{{ .RedirectTo }}` — URL de redirect

---

## 1. Confirm signup

**Subject**: `Bienvenido a Numoria Challenge — confirma tu cuenta`

**Body (HTML)**:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #FFF7ED; padding: 32px 16px; color: #1F2937; line-height: 1.5; }
  .container { max-width: 480px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .logo { font-family: Georgia, serif; font-weight: 800; font-size: 28px; color: #1E1B4B; margin-bottom: 4px; letter-spacing: -0.5px; }
  .logo-dot { color: #F97316; }
  .tagline { font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase; margin-bottom: 24px; }
  h1 { font-family: Georgia, serif; color: #1E1B4B; font-size: 22px; margin: 0 0 16px; }
  p { color: #1F2937; margin: 0 0 16px; }
  .code-box { background: #FFF7ED; border: 2px solid #F97316; padding: 20px 24px; border-radius: 12px; text-align: center; margin: 24px 0; }
  .code { font-family: "Courier New", monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1E1B4B; }
  .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 8px; }
  .button { display: inline-block; background: #F97316; color: white !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px; }
  .footer { color: #94A3B8; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; }
</style>
</head>
<body>
  <div class="container">
    <div class="logo">Numoria<span class="logo-dot">.</span></div>
    <div class="tagline">CHALLENGE</div>

    <h1>¡Bienvenido! Confirma tu cuenta</h1>

    <p>Para activar tu cuenta de Numoria Challenge, ingresa este código en la app:</p>

    <div class="code-box">
      <div class="code-label">Tu código de confirmación</div>
      <div class="code">{{ .Token }}</div>
    </div>

    <p>O alternativamente, haz click aquí (puede fallar — usa el código si tienes problemas):</p>
    <a href="{{ .ConfirmationURL }}" class="button">Confirmar mi cuenta</a>

    <div class="footer">
      <p>Si no creaste esta cuenta, ignora este email.</p>
      <p>El código expira en 1 hora.</p>
      <p>— El equipo de Numoria Challenge</p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Magic Link

**Subject**: `Tu código de Numoria Challenge`

**Body (HTML)**:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #FFF7ED; padding: 32px 16px; color: #1F2937; line-height: 1.5; }
  .container { max-width: 480px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .logo { font-family: Georgia, serif; font-weight: 800; font-size: 28px; color: #1E1B4B; margin-bottom: 4px; letter-spacing: -0.5px; }
  .logo-dot { color: #F97316; }
  .tagline { font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase; margin-bottom: 24px; }
  h1 { font-family: Georgia, serif; color: #1E1B4B; font-size: 22px; margin: 0 0 16px; }
  p { color: #1F2937; margin: 0 0 16px; }
  .code-box { background: #FFF7ED; border: 2px solid #F97316; padding: 20px 24px; border-radius: 12px; text-align: center; margin: 24px 0; }
  .code { font-family: "Courier New", monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1E1B4B; }
  .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 8px; }
  .button { display: inline-block; background: #F97316; color: white !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px; }
  .footer { color: #94A3B8; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; }
</style>
</head>
<body>
  <div class="container">
    <div class="logo">Numoria<span class="logo-dot">.</span></div>
    <div class="tagline">CHALLENGE</div>

    <h1>Tu código para iniciar sesión</h1>

    <p>Usa este código en la pantalla de login para entrar a Numoria Challenge:</p>

    <div class="code-box">
      <div class="code-label">Código de 6 dígitos</div>
      <div class="code">{{ .Token }}</div>
    </div>

    <p>O alternativamente (si tienes problemas con el código), haz click aquí:</p>
    <a href="{{ .ConfirmationURL }}" class="button">Iniciar sesión</a>

    <div class="footer">
      <p>Si no fuiste tú, ignora este email. Nadie podrá entrar a tu cuenta sin este código.</p>
      <p>El código expira en 1 hora.</p>
      <p>— El equipo de Numoria Challenge</p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Reauthentication

**Subject**: `Confirma tu identidad — Numoria Challenge`

**Body (HTML)**:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #FFF7ED; padding: 32px 16px; color: #1F2937; line-height: 1.5; }
  .container { max-width: 480px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .logo { font-family: Georgia, serif; font-weight: 800; font-size: 28px; color: #1E1B4B; margin-bottom: 4px; letter-spacing: -0.5px; }
  .logo-dot { color: #F97316; }
  .tagline { font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase; margin-bottom: 24px; }
  h1 { font-family: Georgia, serif; color: #1E1B4B; font-size: 22px; margin: 0 0 16px; }
  p { color: #1F2937; margin: 0 0 16px; }
  .code-box { background: #FFF7ED; border: 2px solid #F97316; padding: 20px 24px; border-radius: 12px; text-align: center; margin: 24px 0; }
  .code { font-family: "Courier New", monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1E1B4B; }
  .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 8px; }
  .footer { color: #94A3B8; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; }
</style>
</head>
<body>
  <div class="container">
    <div class="logo">Numoria<span class="logo-dot">.</span></div>
    <div class="tagline">CHALLENGE</div>

    <h1>Confirma que eres tú</h1>

    <p>Para continuar con esta acción sensible, ingresa este código:</p>

    <div class="code-box">
      <div class="code-label">Código de verificación</div>
      <div class="code">{{ .Token }}</div>
    </div>

    <div class="footer">
      <p>Si no solicitaste esto, asegura tu cuenta inmediatamente cambiando tu contraseña.</p>
      <p>El código expira en 10 minutos.</p>
      <p>— El equipo de Numoria Challenge</p>
    </div>
  </div>
</body>
</html>
```

---

## Pasos para aplicar

1. Login en Supabase Dashboard del proyecto `numoria-challenge-dev`
2. Sidebar → **Authentication** → **Email Templates**
3. Selecciona "Confirm signup" — pega Subject + Body del template #1
4. Click **Save**
5. Selecciona "Magic Link" — pega Subject + Body del template #2 → Save
6. Selecciona "Reauthentication" — pega Subject + Body del template #3 → Save

Después de los 3 saves, **todos los emails de auth tendrán el código OTP de 6 dígitos prominente**. El magic link sigue como fallback pero ya no es el path principal.

---

## A mediano plazo: SMTP custom

Estos templates funcionan con el SMTP default de Supabase (4 emails/hora limit). Para eliminar el rate limit:

1. Habilita 2FA en `mimathonline@gmail.com`
2. Gmail Settings → Security → App Passwords → "Numoria Challenge"
3. Supabase → Project Settings → Auth → **SMTP Settings**:
   - Sender email: `mimathonline@gmail.com`
   - Sender name: `Numoria Challenge`
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `mimathonline@gmail.com`
   - Password: el App Password generado
4. Save → ahora límite es 500 emails/día desde tu Gmail

Refs:
- ADR 0004 — auth callback PKCE bug
- memory `project-phase1-closed.md` (auth session bug deferred)
