# @numoria/database

Cliente Supabase tipado y helpers compartidos para todas las apps del monorepo.

> Wraps `@supabase/ssr` con tipos generados desde el schema y configuración pre-establecida.

---

## Imports

```typescript
// Server components / route handlers / server actions
import { createServerClient } from '@numoria/database/server';

// Client components
import { createBrowserClient } from '@numoria/database/browser';

// Middleware (refresh de tokens)
import { updateSession } from '@numoria/database/middleware';

// Tipos generados desde schema
import type { Database, Tables, Enums } from '@numoria/database/types';
```

---

## Patrón de uso

### En un Server Component

```tsx
import { createServerClient } from '@numoria/database/server';

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return <Profile profile={profile} />;
}
```

### En un Client Component

```tsx
'use client';
import { createBrowserClient } from '@numoria/database/browser';

const supabase = createBrowserClient();

export function Comments() {
  // ... realtime subscription, optimistic updates, etc.
}
```

### Middleware (refresh tokens)

```ts
import { updateSession } from '@numoria/database/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

---

## Generación de tipos

Después de aplicar migraciones a tu proyecto Supabase, regenera tipos:

```bash
pnpm db:types
```

Esto sobreescribe `src/types.gen.ts` con tipos derivados de tu schema actual. Debes commitearlo para que el resto del equipo (y CI) tenga los tipos correctos.

---

## Variables de entorno

Lee de `.env.local` de la app que lo consume:

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — publishable key (browser-safe)
- `SUPABASE_SERVICE_ROLE_KEY` — secret key (solo server, bypassa RLS)
