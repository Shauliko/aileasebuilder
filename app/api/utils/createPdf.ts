import { PDFDocument } from "pdf-lib";

export async function createPdfFromHtml(htmlContent: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Standard Letter Size

  const fontSize = 12;
  const margin = 40;

  // Strip HTML tags for now (simple version)
  const text = htmlContent.replace(/<[^>]+>/g, "");

  page.drawText(text, {
    x: margin,
    y: page.getHeight() - margin - fontSize,
    size: fontSize
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
