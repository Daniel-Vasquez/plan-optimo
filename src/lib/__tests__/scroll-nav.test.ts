import { describe, expect, it } from 'vitest';
import { nextBottomNavState } from '../scroll-nav';

/** Estado de partida: abajo en la página, barra visible, página larga. */
const base = { lastY: 500, hidden: false, scrollable: 3000 };

describe('nextBottomNavState', () => {
  it('oculta la barra al bajar', () => {
    expect(nextBottomNavState({ ...base, y: 600 }).hidden).toBe(true);
  });

  it('la muestra al subir', () => {
    expect(nextBottomNavState({ ...base, y: 400, hidden: true }).hidden).toBe(false);
  });

  it('la muestra al subir aunque el movimiento sea justo el mínimo', () => {
    // Subir debe responder de inmediato: es el gesto con el que se busca
    // volver a la navegación.
    expect(nextBottomNavState({ ...base, y: 492, hidden: true }).hidden).toBe(false);
  });

  describe('umbral', () => {
    it('ignora movimientos por debajo del umbral', () => {
      const result = nextBottomNavState({ ...base, y: 505 });
      expect(result.hidden).toBe(false);
    });

    it('no actualiza lastY por debajo del umbral', () => {
      // Es lo que impide que muchos micromovimientos de 7 px sumen un
      // desplazamiento grande sin llegar nunca a disparar la reacción.
      expect(nextBottomNavState({ ...base, y: 505 }).lastY).toBe(500);
    });

    it('acumula: varios temblores seguidos acaban superando el umbral', () => {
      let state = { hidden: false, lastY: 500 };
      for (const y of [504, 507, 505, 509]) {
        state = nextBottomNavState({ ...base, y, ...state });
      }
      // 509 - 500 = 9, por encima del umbral de 8: reacciona.
      expect(state.hidden).toBe(true);
      expect(state.lastY).toBe(509);
    });

    it('respeta un umbral personalizado', () => {
      expect(nextBottomNavState({ ...base, y: 520, threshold: 50 }).hidden).toBe(false);
      expect(nextBottomNavState({ ...base, y: 560, threshold: 50 }).hidden).toBe(true);
    });
  });

  describe('cerca del principio de la página', () => {
    it('se muestra aunque se esté bajando', () => {
      // Ocultarla en los primeros píxeles no gana espacio y desconcierta.
      expect(nextBottomNavState({ ...base, y: 40, lastY: 0, hidden: true }).hidden).toBe(false);
    });

    it('vuelve a aparecer al llegar arriba del todo', () => {
      expect(nextBottomNavState({ ...base, y: 0, lastY: 300, hidden: true }).hidden).toBe(false);
    });

    it('sí se oculta justo por encima del límite', () => {
      expect(nextBottomNavState({ ...base, y: 200, lastY: 100, hidden: false }).hidden).toBe(true);
    });
  });

  describe('páginas que no se desplazan', () => {
    it('mantiene la barra visible', () => {
      const result = nextBottomNavState({ ...base, y: 600, scrollable: 0, hidden: true });
      expect(result.hidden).toBe(false);
    });

    it('la mantiene visible aunque el contenido crezca un poco', () => {
      const result = nextBottomNavState({ ...base, y: 600, scrollable: 50, hidden: true });
      expect(result.hidden).toBe(false);
    });
  });

  it('no cambia de estado si ya estaba oculta y se sigue bajando', () => {
    const result = nextBottomNavState({ ...base, y: 700, lastY: 600, hidden: true });
    expect(result.hidden).toBe(true);
    expect(result.lastY).toBe(700);
  });
});
