/**
 * @numoria/database — public API
 *
 * NOTA: Para evitar bundling de código server en el cliente, importa directamente
 * desde subpath:
 *   - `@numoria/database/server` para Server Components, Route Handlers, Server Actions
 *   - `@numoria/database/browser` para Client Components
 *   - `@numoria/database/middleware` para apps/web/src/middleware.ts
 *
 * Este barrel solo re-exporta tipos (sin código de runtime).
 */

export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  Json,
} from './types.gen';
