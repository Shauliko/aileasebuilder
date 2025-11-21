import {
  Document,
  HeadingLevel,
  Paragraph,
  TextRun,
  PageBreak,
  AlignmentType,
} from "docx";

import { Packer } from "docx";

/**
 * Convert markdown → structured DOCX paragraphs
 */
function mdToParagraphs(md: string): Paragraph[] {
  const lines = md.split("\n");
  const paragraphs: Paragraph[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      paragraphs.push(new Paragraph(""));
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace("# ", ""),
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 240 },
        })
      );
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace("## ", ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^[-*]\s+/, ""),
          bullet: { level: 0 },
          spacing: { after: 120 },
        })
      );
      continue;
    }

    // Normal paragraph
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: "Times New Roman",
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  return paragraphs;
}

/**
 * Create full legal-style DOCX file
 */
export async function createDocxFromMarkdown(leaseMd: string): Promise<Buffer> {
  const mainContent = mdToParagraphs(leaseMd);

  // ----- TITLE PAGE -----
  const titlePage = [
    new Paragraph({
      children: [
        new TextRun({
          text: "RESIDENTIAL LEASE AGREEMENT",
          bold: true,
          size: 48,
          font: "Times New Roman",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 600 },
    }),
    new Paragraph({ children: [], pageBreakBefore: true }),
  ];

  // ----- SIGNATURE PAGE -----
  const signaturePage = [
    new Paragraph({ text: "SIGNATURES", heading: HeadingLevel.HEADING_1 }),
    new Paragraph(" "),
    new Paragraph("Landlord Signature: _______________________________"),
    new Paragraph("Printed Name: _____________________________________"),
    new Paragraph("Date: _____________________________________________"),
    new Paragraph(" "),
    new Paragraph("Tenant Signature: __________________________________"),
    new Paragraph("Printed Name: _____________________________________"),
    new Paragraph("Date: _____________________________________________"),
    new Paragraph({ children: [], pageBreakBefore: true }),
  ];

  // ----- EXHIBITS -----
  const exhibits = [
    new Paragraph({
      text: "EXHIBIT A – MOVE-IN/MOVE-OUT CHECKLIST",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph("- Walls"),
    new Paragraph("- Floors"),
    new Paragraph("- Appliances"),
    new Paragraph("- Electrical"),
    new Paragraph("- Plumbing"),
    new Paragraph({ children: [], pageBreakBefore: true }),

    new Paragraph({
      text: "EXHIBIT B – PET AGREEMENT",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph("Tenant agrees to follow all pet rules and responsibilities."),
    new Paragraph({ children: [], pageBreakBefore: true }),

    new Paragraph({
      text: "EXHIBIT C – LEAD-BASED PAINT DISCLOSURE",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph("Required for homes built before 1978."),
  ];

  // ----- COMPLETE DOC -----
  const doc = new Document({
    sections: [
      { children: titlePage },
      { children: mainContent },
      { children: signaturePage },
      { children: exhibits },
    ],
  });

  // FIXED: correct docx output
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
