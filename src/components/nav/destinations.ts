import type { IconName } from './Icon.astro';

/**
 * Destinos de la navegación principal.
 *
 * Fuente única para la barra superior y la inferior. El layout anterior tenía
 * la misma lista escrita dos veces —una para la barra lateral y otra para la
 * inferior— y se desincronizaban en cuanto se tocaba una.
 */
export interface NavDestination {
  id: string;
  href: string;
  label: string;
  icon: IconName;
}

export const NAV_DESTINATIONS: NavDestination[] = [
  { id: 'inicio', href: '/', label: 'Inicio', icon: 'inicio' },
  { id: 'fuerza', href: '/fuerza', label: 'Fuerza', icon: 'fuerza' },
  { id: 'running', href: '/progreso-running', label: 'Running', icon: 'running' },
  { id: 'nutricion', href: '/nutricion', label: 'Nutrición', icon: 'nutricion' },
  { id: 'agua', href: '/hidratacion', label: 'Agua', icon: 'agua' },
  { id: 'calendario', href: '/calendario', label: 'Calendario', icon: 'calendario' },
  { id: 'rutina', href: '/rutina', label: 'Rutina', icon: 'rutina' },
  { id: 'notas', href: '/notas', label: 'Notas', icon: 'notas' },
];
