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
    .replace(/[^\x00-\x7F]/g, "");
}

/**
 * Convert HTML → text blocks with structure
 * Matches EXACT behavior of public lease PDF generator
 */
function parseHtml(html: string) {
  const cleaned = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

  const lines = cleaned.split(/\n+/);

  const blocks: Array<{ type: "heading" | "paragraph" | "bullet"; text: string }> = [];

  for (let raw of lines) {
    const text = raw.trim();
    if (!text) continue;

    // MATCH PUBLIC GENERATOR HEADING RULES EXACTLY
    if (
      text.startsWith("# ") ||
      text.startsWith("## ") ||
      /^[A-Z][A-Z0-9 ,.'()/-]{3,}$/.test(text)
    ) {
      blocks.push({
        type: "heading",
        text: text.replace(/^#+\s*/, "") // remove markdown "# "
      });
      continue;
    }

    // MATCH PUBLIC GENERATOR BULLET RULES
    if (text.startsWith("- ") || text.startsWith("* ") || text.startsWith("• ")) {
      blocks.push({
        type: "bullet",
        text: text.replace(/^[-*•]\s*/, "")
      });
      continue;
    }

    blocks.push({ type: "paragraph", text });
  }

  return blocks;
}

export async function createPdfFromHtml(html: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // PUBLIC GENERATOR FONT RULES
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // PUBLIC GENERATOR SPACING + TYPOGRAPHY
  const margin = 72; // 1 inch
  const fontSize = 12;
  const lineHeight = 18;
  const headingSize = 18;
  const headingSpacing = 32;

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

  /**
   * Public generator footer
   */
  const drawPageNumbers = () => {
    const total = pages.length;
    pages.forEach((p, i) => {
      const label = `Page ${i + 1} of ${total}`;
      p.drawText(label, {
        x: width / 2 - fontRegular.widthOfTextAtSize(label, 10) / 2,
        y: margin / 2,
        size: 10,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
    });
  };

  /**
   * TITLE — Matches main generator
   */
  const drawTitlePage = () => {
    const title = "RESIDENTIAL LEASE AGREEMENT";
    page.drawText(title, {
      x: margin,
      y: height - margin - 40,
      font: fontBold,
      size: 24,
    });

    cursorY = height - margin - 80;
    newPage();
  };

  drawTitlePage();

  /**
   * Draw heading EXACTLY like public generator
   */
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

  /**
   * Draw paragraphs identical to public generator behavior
   */
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

  /**
   * PARSE → DRAW
   * Produces identical output to public generator
   */
  const blocks = parseHtml(html);

  for (const block of blocks) {
    if (block.type === "heading") drawHeading(block.text);
    else if (block.type === "bullet") drawParagraph(block.text, 20);
    else drawParagraph(block.text);
  }

  /**
   * SIGNATURE SECTION — identical across both generators
   */
  drawHeading("SIGNATURES");
  drawParagraph("Landlord Signature: ________________________________");
  drawParagraph("Printed Name: ______________________________________");
  drawParagraph("Date: ______________________________________________");

  cursorY -= 20;

  drawParagraph("Tenant Signature: ___________________________________");
  drawParagraph("Printed Name: ______________________________________");
  drawParagraph("Date: ______________________________________________");

  /**
   * No forced exhibits.
   * Exhibits will only appear if markdown includes them — identical to public generator.
   */

  drawPageNumbers();

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
