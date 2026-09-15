/**
 * Decisión de visibilidad de la barra inferior según el desplazamiento.
 *
 * Vive fuera del componente porque es la única parte con reglas que pueden
 * fallar de forma sutil —parpadeos, quedarse oculta arriba del todo— y así se
 * puede probar sin navegador. El componente sólo lee el scroll y aplica la
 * clase.
 */

export interface ScrollNavInput {
  /** Desplazamiento actual, en píxeles. */
  y: number;
  /** Desplazamiento de la última decisión tomada. */
  lastY: number;
  /** Si la barra está oculta ahora mismo. */
  hidden: boolean;
  /** Cuánto se puede desplazar la página: `scrollHeight - innerHeight`. */
  scrollable: number;
  /** Movimiento mínimo para reaccionar. Evita parpadeos por temblores. */
  threshold?: number;
  /** Por debajo de esta altura la barra siempre se muestra. */
  revealAbove?: number;
}

export interface ScrollNavState {
  hidden: boolean;
  lastY: number;
}

export function nextBottomNavState({
  y,
  lastY,
  hidden,
  scrollable,
  threshold = 8,
  revealAbove = 80,
}: ScrollNavInput): ScrollNavState {
  // Una página que apenas se desplaza no tiene por qué esconder nada: no se
  // gana espacio y el usuario pierde la navegación sin entender por qué.
  if (scrollable <= revealAbove) return { hidden: false, lastY: y };

  const delta = y - lastY;

  // Por debajo del umbral no se decide nada Y NO se actualiza `lastY`: si se
  // actualizara, una sucesión de micromovimientos de 7 px acabaría sumando un
  // desplazamiento grande que nunca llegaría a disparar la reacción.
  if (Math.abs(delta) < threshold) return { hidden, lastY };

  // Cerca del principio, siempre visible.
  if (y <= revealAbove) return { hidden: false, lastY: y };

  // Bajar oculta; subir muestra de inmediato.
  return { hidden: delta > 0, lastY: y };
}
