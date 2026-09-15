/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Usuario autenticado, resuelto por el middleware. `null` si no hay sesión. */
    user: import('better-auth/types').User | null;
    session: import('better-auth/types').Session | null;
  }
}

interface Window {
  showToast?: (message: string, type?: string) => void;
}
