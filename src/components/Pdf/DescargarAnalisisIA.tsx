'use client';

import html2pdf from 'html2pdf.js';

export function DescargarAnalisisIA({
  datos,
}: {
  datos: {
    clasificacionIa: string;
    justificacionIa: string[];
    observacionesGenerales: string[];
  };
}) {
  const handleDownload = () => {
    const element = document.createElement('div');

    element.innerHTML = `
  <div style="font-family: 'Segoe UI', sans-serif; padding: 32px; line-height: 1.6; background-color: #f8f9fa;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0d47a1; margin-bottom: 4px;">🔬 Análisis IA - <span style="color: #ff5722;">FCardio</span></h1>
      <p style="color: #666; font-size: 14px;">Evaluación generada automáticamente por inteligencia artificial</p>
    </div>

    <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      <h2 style="color: #2e7d32; font-size: 22px;">Clasificación: ${datos.clasificacionIa}</h2>

      <h3 style="margin-top: 24px; color: #333;">🧩 Justificación:</h3>
      <ul style="padding-left: 20px; color: #444;">
        ${datos.justificacionIa.map(j => `<li style="margin-bottom: 8px;">${j}</li>`).join('')}
      </ul>

      <h3 style="margin-top: 24px; color: #333;">📌 Observaciones Generales:</h3>
      <ul style="padding-left: 20px; color: #444;">
        ${datos.observacionesGenerales.map(o => `<li style="margin-bottom: 8px;">${o}</li>`).join('')}
      </ul>
    </div>

    <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #999;">
      Generado por FCardio - ${new Date().toLocaleDateString()}
    </footer>
  </div>
`;


    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: 'analisis-IA-FCardio.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      })
      .save();
  };

  return (
    <button
      onClick={handleDownload}
      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded"
    >
      📄 Descargar Análisis Completo
    </button>
  );
}
