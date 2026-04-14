// ============================================================
// doc-generator.js — Word Document Builder
// T-FLAWS Assessment Management Tool
// Uses docx v9.6.1 via esm.sh CDN
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  TableOfContents,
  Header,
  Footer,
  PageNumber,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
} from "https://esm.sh/docx@9.6.1";

// ============================================================
// MAIN EXPORT
// ============================================================

export async function generateDocument(courseContent, references) {
  const { referenceEntries, bibliographyOrder } = references;

  const doc = new Document({
    creator: courseContent.meta.organization,
    title: courseContent.meta.title,
    description: courseContent.meta.subtitle,
    features: { updateFields: true },
    styles: buildStyles(),
    numbering: buildNumbering(),
    sections: [
      buildCoverSection(courseContent.meta),
      buildTocSection(courseContent.meta.title),
      buildIntroductionSection(courseContent.introduction),
      ...courseContent.sections.map((section, idx) =>
        buildTflawsSection(section, idx + 1, courseContent.meta.title)
      ),
      buildJournalSection(courseContent.journalSection, courseContent.meta.title),
      buildBibliographySection(referenceEntries, bibliographyOrder, courseContent.meta.title),
    ],
  });

  return await Packer.toBlob(doc);
}

// ============================================================
// STYLES
// ============================================================

function buildStyles() {
  return {
    default: {
      document: {
        run: {
          font: "Calibri",
          size: 24, // 12pt
        },
        paragraph: {
          spacing: { after: 160, line: 276, lineRule: "auto" },
        },
      },
    },
    paragraphStyles: [
      {
        id: "CourseTitle",
        name: "Course Title",
        basedOn: "Normal",
        run: {
          font: "Calibri Light",
          size: 64,
          color: "1F3864",
          bold: true,
        },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { after: 400, before: 400 },
        },
      },
      {
        id: "CoverSubtitle",
        name: "Cover Subtitle",
        basedOn: "Normal",
        run: {
          font: "Calibri Light",
          size: 32,
          color: "2E74B5",
          italics: true,
        },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
        },
      },
      {
        id: "CoverMeta",
        name: "Cover Meta",
        basedOn: "Normal",
        run: {
          font: "Calibri",
          size: 22,
          color: "595959",
        },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          font: "Calibri Light",
          size: 36,
          color: "1F3864",
          bold: true,
        },
        paragraph: {
          spacing: { before: 480, after: 240 },
          outlineLevel: 0,
        },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          font: "Calibri Light",
          size: 30,
          color: "2E74B5",
          bold: true,
        },
        paragraph: {
          spacing: { before: 360, after: 160 },
          outlineLevel: 1,
        },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          font: "Calibri Light",
          size: 26,
          color: "2E74B5",
          bold: true,
          italics: true,
        },
        paragraph: {
          spacing: { before: 240, after: 120 },
          outlineLevel: 2,
        },
      },
      {
        id: "BodyText",
        name: "Body Text",
        basedOn: "Normal",
        run: {
          font: "Calibri",
          size: 24,
          color: "000000",
        },
        paragraph: {
          spacing: { after: 200, line: 276, lineRule: "auto" },
        },
      },
      {
        id: "Caption",
        name: "Caption",
        basedOn: "Normal",
        run: {
          font: "Calibri",
          size: 20,
          italics: true,
          color: "595959",
        },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 280 },
        },
      },
      {
        id: "Bibliography",
        name: "Bibliography",
        basedOn: "Normal",
        run: {
          font: "Calibri",
          size: 22,
          color: "000000",
        },
        paragraph: {
          spacing: { after: 120, line: 276, lineRule: "auto" },
          indent: { left: 720, hanging: 720 },
        },
      },
      {
        id: "Disclaimer",
        name: "Disclaimer",
        basedOn: "Normal",
        run: {
          font: "Calibri",
          size: 18,
          color: "808080",
          italics: true,
        },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        },
      },
      {
        id: "JournalItem",
        name: "Journal Item",
        basedOn: "Normal",
        run: {
          font: "Calibri",
          size: 22,
        },
        paragraph: {
          spacing: { after: 160 },
          indent: { left: 360, hanging: 360 },
        },
      },
    ],
  };
}

// ============================================================
// NUMBERING (for bullet lists)
// ============================================================

function buildNumbering() {
  return {
    config: [
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0,
            format: "bullet",
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 },
              },
              run: { font: "Symbol" },
            },
          },
        ],
      },
    ],
  };
}

// ============================================================
// PAGE PROPERTIES
// ============================================================

function pageProperties() {
  return {
    page: {
      size: {
        width: convertInchesToTwip(8.5),
        height: convertInchesToTwip(11),
      },
      margin: {
        top: convertInchesToTwip(1),
        right: convertInchesToTwip(1),
        bottom: convertInchesToTwip(1),
        left: convertInchesToTwip(1.25),
        header: convertInchesToTwip(0.5),
        footer: convertInchesToTwip(0.5),
      },
    },
  };
}

// ============================================================
// HEADER & FOOTER
// ============================================================

function buildHeader(courseTitle) {
  return {
    default: new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: courseTitle,
              font: "Calibri",
              size: 18,
              color: "595959",
              italics: true,
            }),
          ],
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E74B5" },
          },
        }),
      ],
    }),
    first: new Header({ children: [new Paragraph({ children: [] })] }),
  };
}

function buildFooter() {
  return {
    default: new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              children: [PageNumber.CURRENT],
              font: "Calibri",
              size: 18,
              color: "595959",
            }),
          ],
          border: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "2E74B5" },
          },
        }),
      ],
    }),
    first: new Footer({ children: [new Paragraph({ children: [] })] }),
  };
}

// ============================================================
// COVER PAGE SECTION
// ============================================================

function buildCoverSection(meta) {
  return {
    properties: {
      titlePage: true,
      ...pageProperties(),
    },
    headers: {
      first: new Header({ children: [new Paragraph({ children: [] })] }),
    },
    footers: {
      first: new Footer({ children: [new Paragraph({ children: [] })] }),
    },
    children: [
      // Top spacer
      spacer(1200),

      // Course series label
      new Paragraph({
        style: "CoverMeta",
        children: [
          new TextRun({
            text: meta.courseNumber.toUpperCase(),
            font: "Calibri",
            size: 22,
            color: "2E74B5",
            bold: true,
            allCaps: true,
          }),
        ],
      }),

      spacer(400),

      // Main title
      new Paragraph({
        style: "CourseTitle",
        children: [new TextRun({ text: meta.title })],
      }),

      spacer(400),

      // Subtitle
      new Paragraph({
        style: "CoverSubtitle",
        children: [new TextRun({ text: meta.subtitle })],
      }),

      spacer(800),

      // Divider
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "─────────────────────────────────────",
            color: "2E74B5",
            size: 22,
          }),
        ],
      }),

      spacer(400),

      // Organization
      new Paragraph({
        style: "CoverMeta",
        children: [new TextRun({ text: meta.organization, bold: true, size: 24 })],
      }),

      // Date
      new Paragraph({
        style: "CoverMeta",
        children: [new TextRun({ text: meta.date })],
      }),

      // Version
      new Paragraph({
        style: "CoverMeta",
        children: [new TextRun({ text: `Version ${meta.version}` })],
      }),

      spacer(800),

      // Disclaimer
      new Paragraph({
        style: "Disclaimer",
        children: [new TextRun({ text: meta.disclaimer })],
      }),

      spacer(400),

      // TOC note
      new Paragraph({
        style: "Disclaimer",
        children: [
          new TextRun({
            text: "Note: After opening this document in Microsoft Word, right-click the Table of Contents and select \"Update Field\" to populate page numbers.",
          }),
        ],
      }),

      // Page break to next section
      new Paragraph({ children: [new PageBreak()] }),
    ],
  };
}

// ============================================================
// TABLE OF CONTENTS SECTION
// ============================================================

function buildTocSection(courseTitle) {
  return {
    properties: {
      titlePage: false,
      ...pageProperties(),
    },
    headers: buildHeader(courseTitle),
    footers: buildFooter(),
    children: [
      new Paragraph({
        style: "Heading1",
        children: [new TextRun({ text: "Table of Contents" })],
      }),
      spacer(200),
      new TableOfContents("Table of Contents", {
        headingStyleRange: "1-3",
        hyperlink: true,
      }),
      new Paragraph({ children: [new PageBreak()] }),
    ],
  };
}

// ============================================================
// INTRODUCTION SECTION
// ============================================================

function buildIntroductionSection(intro) {
  const children = [
    new Paragraph({
      style: "Heading1",
      children: [new TextRun({ text: intro.title })],
    }),
  ];

  intro.paragraphs.forEach((p) => {
    children.push(renderParagraph(p));
  });

  intro.subsections.forEach((sub) => {
    children.push(
      new Paragraph({
        style: "Heading2",
        children: [new TextRun({ text: sub.heading })],
      })
    );
    sub.paragraphs.forEach((p) => {
      children.push(renderParagraph(p));
    });
  });

  children.push(new Paragraph({ children: [new PageBreak()] }));

  return {
    properties: { titlePage: false, ...pageProperties() },
    headers: buildHeader("T-FLAWS – Assessment Management Tool"),
    footers: buildFooter(),
    children,
  };
}

// ============================================================
// T-FLAWS COMPONENT SECTION
// ============================================================

function buildTflawsSection(section, figureNum, courseTitle) {
  const children = [
    // Section heading (Heading 1)
    new Paragraph({
      style: "Heading1",
      children: [new TextRun({ text: section.fullTitle })],
    }),
  ];

  const subs = section.subsections;

  // What It Is
  children.push(
    new Paragraph({ style: "Heading2", children: [new TextRun({ text: subs.whatItIs.heading })] })
  );
  subs.whatItIs.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  // Why It Matters
  children.push(
    new Paragraph({ style: "Heading2", children: [new TextRun({ text: subs.whyItMatters.heading })] })
  );
  subs.whyItMatters.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  // How to Assess
  children.push(
    new Paragraph({ style: "Heading2", children: [new TextRun({ text: subs.howToAssess.heading })] })
  );
  subs.howToAssess.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  // What Abnormal Findings Indicate
  children.push(
    new Paragraph({
      style: "Heading2",
      children: [new TextRun({ text: subs.abnormalFindings.heading })],
    })
  );
  subs.abnormalFindings.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  // Recommended Management Responses
  children.push(
    new Paragraph({
      style: "Heading2",
      children: [new TextRun({ text: subs.managementResponses.heading })],
    })
  );
  subs.managementResponses.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  // Image placeholder
  const placeholder = subs.managementResponses.imagePlaceholder;
  children.push(...createImagePlaceholder(placeholder.caption, placeholder.description));

  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));

  return {
    properties: { titlePage: false, ...pageProperties() },
    headers: buildHeader(courseTitle),
    footers: buildFooter(),
    children,
  };
}

// ============================================================
// JOURNALS SECTION
// ============================================================

function buildJournalSection(journalSection, courseTitle) {
  const children = [
    new Paragraph({
      style: "Heading1",
      children: [new TextRun({ text: journalSection.title })],
    }),
    renderParagraph(journalSection.intro),
    spacer(200),
    new Paragraph({
      style: "Heading2",
      children: [new TextRun({ text: "Peer-Reviewed Journals" })],
    }),
  ];

  journalSection.journals.forEach((j) => {
    children.push(
      new Paragraph({
        style: "BodyText",
        children: [
          new TextRun({ text: j.name, bold: true }),
          new TextRun({ text: `. ${j.publisher}. `, italics: false }),
          new TextRun({ text: j.scope, color: "404040" }),
          new TextRun({ text: ` ISSN: ${j.issn}.`, color: "595959" }),
        ],
        spacing: { after: 160 },
        indent: { left: 360, hanging: 360 },
      })
    );
  });

  children.push(
    spacer(200),
    new Paragraph({
      style: "Heading2",
      children: [new TextRun({ text: "Key Institutional Resources" })],
    })
  );

  journalSection.institutionalResources.forEach((r) => {
    children.push(
      new Paragraph({
        style: "BodyText",
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: r })],
      })
    );
  });

  children.push(new Paragraph({ children: [new PageBreak()] }));

  return {
    properties: { titlePage: false, ...pageProperties() },
    headers: buildHeader(courseTitle),
    footers: buildFooter(),
    children,
  };
}

// ============================================================
// BIBLIOGRAPHY SECTION
// ============================================================

function buildBibliographySection(referenceEntries, bibliographyOrder, courseTitle) {
  const children = [
    new Paragraph({
      style: "Heading1",
      children: [new TextRun({ text: "References" })],
    }),
    spacer(120),
  ];

  bibliographyOrder.forEach((key) => {
    const ref = referenceEntries[key];
    if (!ref) return;
    children.push(
      new Paragraph({
        style: "Bibliography",
        children: [new TextRun({ text: ref.apa })],
      })
    );
  });

  return {
    properties: { titlePage: false, ...pageProperties() },
    headers: buildHeader(courseTitle),
    footers: buildFooter(),
    children,
  };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Renders a paragraph string, highlighting [NEEDS SOURCE] in bold red.
 */
function renderParagraph(text) {
  const parts = text.split(/(\[NEEDS SOURCE[^\]]*\])/g);
  const runs = parts.map((part) => {
    if (/^\[NEEDS SOURCE/.test(part)) {
      return new TextRun({ text: part, bold: true, color: "CC0000", size: 24 });
    }
    return new TextRun({ text: part, size: 24 });
  });

  return new Paragraph({
    style: "BodyText",
    children: runs,
  });
}

/**
 * Creates a visible image placeholder: a gray bordered table cell with description,
 * followed by a caption paragraph beneath.
 */
function createImagePlaceholder(caption, description) {
  const placeholderTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "F2F2F2", color: "auto" },
            margins: {
              top: convertInchesToTwip(0.15),
              bottom: convertInchesToTwip(0.15),
              left: convertInchesToTwip(0.2),
              right: convertInchesToTwip(0.2),
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "BFBFBF" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "BFBFBF" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "BFBFBF" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "BFBFBF" },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 240, after: 160 },
                children: [
                  new TextRun({
                    text: "[ IMAGE PLACEHOLDER ]",
                    bold: true,
                    color: "7F7F7F",
                    size: 28,
                    font: "Calibri",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 240 },
                children: [
                  new TextRun({
                    text: description,
                    italics: true,
                    color: "888888",
                    size: 20,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const captionParagraph = new Paragraph({
    style: "Caption",
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: caption, italics: true, font: "Calibri", size: 20 })],
  });

  return [spacer(120), placeholderTable, captionParagraph, spacer(120)];
}

/**
 * Creates an empty paragraph used for vertical spacing.
 */
function spacer(spacingBefore = 240) {
  return new Paragraph({
    children: [],
    spacing: { before: spacingBefore, after: 0 },
  });
}
