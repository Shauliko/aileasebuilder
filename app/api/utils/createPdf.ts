import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Sanitize text (TimesRoman cannot encode unicode)
 */
function sanitizeForPdf(text: string): string {
  return text
    .replace(/☐/g, "[ ]")
    .replace(/✓/g, "[x]")
    .replace(/✔/g, "[x]")
    .replace(/[•–—]/g, "-") 
    .replace(/[^\x00-\x7F]/g, ""); // strip remaining unicode
}

/** Split HTML into structured text blocks */
function parseHtml(html: string) {
  const cleaned = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

  const lines = cleaned.split(/\n+/);
  const blocks: Array<{ type: "heading" | "paragraph" | "bullet"; text: string }> = [];

  for (let raw of lines) {
    const text = raw.trim();
    if (!text) continue;

    if (/^\d+\./.test(text) || /^[A-Z ]{5,}$/.test(text)) {
      blocks.push({ type: "heading", text });
    } else if (text.startsWith("•")) {
      blocks.push({ type: "bullet", text: text.slice(1).trim() });
    } else {
      blocks.push({ type: "paragraph", text });
    }
  }

  return blocks;
}

export async function createPdfFromHtml(html: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // Fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Layout settings
  const margin = 72; // 1 inch margins
  const fontSize = 12;
  const lineHeight = 16;
  const headingSize = 16;
  const headingSpacing = 26;
  const bulletIndent = 20;

  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();
  let cursorY = height - margin;

  const pages: any[] = [page];

  const newPage = () => {
    page = pdfDoc.addPage();
    pages.push(page);
    ({ width, height } = page.getSize());
    cursorY = height - margin;
  };

  const ensureSpace = (needed: number) => {
    if (cursorY - needed < margin) newPage();
  };

  /** Draw centered footer page numbers */
  const drawPageNumbers = () => {
    const total = pages.length;
    pages.forEach((p, i) => {
      const label = `Page ${i + 1} of ${total}`;
      p.drawText(label, {
        x: width / 2 - fontRegular.widthOfTextAtSize(label, 10) / 2,
        y: margin / 2,
        size: 10,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });
    });
  };

  /** Draw title page */
  const drawTitlePage = () => {
    const title = "RESIDENTIAL LEASE AGREEMENT";
    const safeTitle = sanitizeForPdf(title);

    page.drawText(safeTitle, {
      x: width / 2 - fontBold.widthOfTextAtSize(safeTitle, 26) / 2,
      y: height / 2 + 100,
      font: fontBold,
      size: 26,
    });

    cursorY = height / 2;
    newPage();
  };

  drawTitlePage();

  /** Draw headings */
  const drawHeading = (text: string) => {
    ensureSpace(headingSpacing);
    const safe = sanitizeForPdf(text);
    page.drawText(safe, {
      x: margin,
      y: cursorY,
      font: fontBold,
      size: headingSize,
    });
    cursorY -= headingSpacing;
  };

  /** Draw wrapped paragraphs */
  const drawParagraph = (text: string, indent = 0) => {
    const safe = sanitizeForPdf(text);
    const words = safe.split(/\s+/);
    let line = "";

    for (const word of words) {
      const testLine = line ? line + " " + word : word;
      const w = fontRegular.widthOfTextAtSize(testLine, fontSize);

      if (w > width - margin * 2 - indent) {
        ensureSpace(lineHeight);
        page.drawText(line, {
          x: margin + indent,
          y: cursorY,
          font: fontRegular,
          size: fontSize,
        });
        cursorY -= lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line.trim()) {
      ensureSpace(lineHeight);
      page.drawText(line.trim(), {
        x: margin + indent,
        y: cursorY,
        font: fontRegular,
        size: fontSize,
      });
      cursorY -= lineHeight * 1.4;
    }
  };

  // Convert html → blocks
  const blocks = parseHtml(html);

  // Render the main content
  for (const block of blocks) {
    if (block.type === "heading") drawHeading(block.text);
    else if (block.type === "bullet") drawParagraph("- " + block.text, bulletIndent);
    else drawParagraph(block.text);
  }

  /** Signature Section */
  drawHeading("SIGNATURES");

  drawParagraph("Landlord Signature: ________________________________");
  drawParagraph("Printed Name: ______________________________________");
  drawParagraph("Date: ______________________________________________");

  cursorY -= 20;

  drawParagraph("Tenant Signature: ___________________________________");
  drawParagraph("Printed Name: ______________________________________");
  drawParagraph("Date: ______________________________________________");

  /** Exhibits */
  newPage();
  drawHeading("EXHIBIT A – MOVE-IN / MOVE-OUT CONDITION CHECKLIST");
  drawParagraph("This checklist must be completed at the start and end of the tenancy.");
  drawParagraph("[ ] Walls");
  drawParagraph("[ ] Floors");
  drawParagraph("[ ] Appliances");
  drawParagraph("[ ] Electrical");
  drawParagraph("[ ] Plumbing");

  newPage();
  drawHeading("EXHIBIT B – PET AGREEMENT");
  drawParagraph("Tenant agrees to comply with all pet rules and responsibilities...");

  newPage();
  drawHeading("EXHIBIT C – LEAD-BASED PAINT DISCLOSURE");
  drawParagraph("Required for any property built before 1978.");

  // Footer page numbers
  drawPageNumbers();

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
