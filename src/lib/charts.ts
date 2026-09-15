/**
 * Configuración común de Chart.js.
 *
 * Chart.js se usa aquí y no divs como en hidratación porque estas gráficas
 * necesitan ejes reales, escala invertida, bandas de fondo y tooltips; el
 * historial de agua eran 30 barras sin ejes y no compensaba la librería.
 *
 * Los colores salen de los tokens del tema leídos en tiempo de ejecución, así
 * que alternar claro/oscuro los repinta sin regenerar nada.
 */

export function themeRGB(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function themeColor(token: string): string {
  return `rgb(${themeRGB(`--rgb-${token}`)})`;
}

/** Overlay translúcido que funciona en ambos temas. */
export function edge(alpha: number): string {
  return `rgb(${themeRGB('--edge')} / ${alpha})`;
}

/** Ejes y rejilla deliberadamente discretos: los datos mandan, no el marco. */
export function axisStyle() {
  return {
    grid: { color: edge(0.07), drawTicks: false },
    border: { display: false },
    ticks: {
      color: themeColor('muted'),
      font: { family: 'DM Sans', size: 11 },
      padding: 8,
    },
  };
}

export function tooltipStyle() {
  return {
    backgroundColor: themeColor('surface2'),
    titleColor: themeColor('primary'),
    bodyColor: themeColor('muted'),
    borderColor: edge(0.13),
    borderWidth: 1,
    padding: 10,
    displayColors: true,
    boxPadding: 4,
  };
}

/** Leyenda: obligatoria en cuanto hay dos series, para no depender del color. */
export function legendStyle() {
  return {
    display: true,
    position: 'bottom' as const,
    labels: {
      color: themeColor('muted'),
      font: { family: 'DM Sans', size: 11 },
      usePointStyle: true,
      pointStyle: 'circle' as const,
      boxWidth: 8,
      padding: 14,
    },
  };
}

/**
 * Dibuja bandas horizontales de zona por detrás de los datos.
 *
 * Es lo que convierte la gráfica de ritmo en un diagnóstico: sin la banda, un
 * punto a 6:18 es sólo un número; con ella se ve de un vistazo que ese rodaje
 * "fácil" se corrió en zona de umbral.
 */
export function zoneBandsPlugin(
  bands: { min: number; max: number; color: string; label: string }[],
) {
  return {
    id: 'zoneBands',
    beforeDatasetsDraw(chart: any) {
      const { ctx, chartArea, scales } = chart;
      if (!scales.y || !chartArea) return;

      ctx.save();
      for (const band of bands) {
        const yTop = scales.y.getPixelForValue(band.min);
        const yBottom = scales.y.getPixelForValue(band.max);
        const top = Math.min(yTop, yBottom);
        const height = Math.abs(yBottom - yTop);
        if (!Number.isFinite(top) || !Number.isFinite(height)) continue;

        ctx.fillStyle = band.color;
        ctx.fillRect(chartArea.left, top, chartArea.right - chartArea.left, height);

        ctx.fillStyle = themeColor('muted2');
        ctx.font = '10px DM Sans';
        ctx.textAlign = 'left';
        ctx.fillText(band.label, chartArea.left + 6, top + 12);
      }
      ctx.restore();
    },
  };
}

/** Línea de referencia horizontal, punteada. */
export function referenceLinePlugin(value: number, label: string) {
  return {
    id: `refline-${label}`,
    afterDatasetsDraw(chart: any) {
      const { ctx, chartArea, scales } = chart;
      if (!scales.y || !chartArea) return;
      const y = scales.y.getPixelForValue(value);
      if (!Number.isFinite(y)) return;

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = edge(0.25);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = themeColor('muted2');
      ctx.font = '10px DM Sans';
      ctx.textAlign = 'right';
      ctx.fillText(label, chartArea.right - 4, y - 4);
      ctx.restore();
    },
  };
}
