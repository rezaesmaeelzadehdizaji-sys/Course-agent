// ============================================================
// doc-generator.ts — Word Document Builder
// T-FLAWS Assessment Management Tool
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
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
} from "docx";

import type { DocCourseContent, DocReferences } from "./types";

// ============================================================
// IMAGE LOADING
// ============================================================

async function loadImageFromUrl(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// Allow callers (e.g. local generation scripts) to supply pre-loaded image
// buffers directly instead of fetching via HTTP.
export type ImageMap = Map<string, Buffer>;

// Photos embedded per section (T-FLAWS specific)
const SECTION_PHOTOS: Record<string, Array<{ file: string; caption: string; ext: "jpg" | "png" }>> = {
  toes: [
    { file: "fpd_hockburn.jpg", caption: "Photo 1. Visual scoring reference for footpad dermatitis (top row) and hock burn (bottom row). Source: Vasdal et al., Animals, CC BY 4.0. Based on Welfare Quality® Protocol.", ext: "jpg" },
  ],
  feathers: [
    { file: "feather_loss.jpg", caption: "Photo 2. A hen showing significant feather loss on the back and neck, classic feather pecking damage. Source: Wikimedia Commons, CC BY 1.0.", ext: "jpg" },
  ],
  legs: [
    { file: "lame_broiler.jpg", caption: "Photo 3. A commercial broiler with significant leg impairment, consistent with Gait Score 3-4. Source: Glass Walls Project (Israel), CC BY-SA 4.0.", ext: "jpg" },
    { file: "splay_leg_broiler.jpg", caption: "Photo 4. Splay-legged broilers, Gait Score 4-5. Requires immediate humane euthanasia. Source: Glass Walls Project (Israel), CC BY-SA 4.0.", ext: "jpg" },
    { file: "tibial_td.png", caption: "Photo 5. Tibial dyschondroplasia (TD) seen on post-mortem examination. The white cartilaginous plug indicates calcium:phosphorus imbalance or Vitamin D3 deficiency. Source: Wikimedia Commons, CC BY 4.0.", ext: "png" },
  ],
  activity: [
    { file: "broiler_house.jpg", caption: "Photo 6. Inside a commercial broiler house. Even distribution with active birds is a sign of a well-managed environment. Source: USDA, Public Domain.", ext: "jpg" },
  ],
  weight: [],
  skin: [
    { file: "bumblefoot.jpg", caption: "Photo 7. Bumblefoot (pododermatitis) in a rooster, showing advanced bacterial skin infection. Source: Sylvain Larrat / Wikimedia Commons, CC BY 4.0.", ext: "jpg" },
    { file: "cyanosis_chickens.jpg", caption: "Photo 8. Chickens showing cyanosis. Multiple cyanotic birds is a same-day veterinary emergency. Source: Otwarte Klatki / Wikimedia Commons, CC BY 2.0.", ext: "jpg" },
  ],
};

// ============================================================
// MAIN EXPORT
// ============================================================

export async function generateDocument(
  courseContent: DocCourseContent,
  references: DocReferences,
  imageBaseUrl?: string,
  preloadedImages?: ImageMap
): Promise<Buffer> {
  const { referenceEntries, bibliographyOrder } = references;

  // Use pre-loaded images if provided (e.g. from local generation scripts),
  // otherwise fetch via HTTP from the given base URL.
  const images: ImageMap = preloadedImages ?? new Map<string, Buffer>();
  if (!preloadedImages && imageBaseUrl) {
    const allFiles = [
      "logo.png",
      ...Object.values(SECTION_PHOTOS).flat().map((p) => p.file),
    ];
    await Promise.all(
      allFiles.map(async (file) => {
        const buf = await loadImageFromUrl(`${imageBaseUrl}/images/${file}`);
        if (buf) images.set(file, buf);
      })
    );
  }

  const logoBuffer = images.get("logo.png") ?? null;

  const doc = new Document({
    creator: courseContent.meta.organization,
    title: courseContent.meta.title,
    description: courseContent.meta.subtitle,
    features: {
      updateFields: true,
    },
    styles: buildStyles(),
    numbering: buildNumbering(),
    sections: [
      buildCoverSection(courseContent.meta, logoBuffer),
      buildTocSection(courseContent.meta.title),
      buildIntroductionSection(courseContent.introduction, courseContent.meta.title),
      ...courseContent.sections.map((section, idx) =>
        buildTflawsSection(section, idx + 1, courseContent.meta.title, images)
      ),
      buildJournalSection(courseContent.journalSection, courseContent.meta.title),
      buildBibliographySection(referenceEntries, bibliographyOrder, courseContent.meta.title),
    ],
  });

  return await Packer.toBuffer(doc);
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
          size: 24,
        },
        paragraph: {
          spacing: { after: 160, line: 276, lineRule: "auto" as const },
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
          spacing: { after: 200, line: 276, lineRule: "auto" as const },
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
          spacing: { after: 120, line: 276, lineRule: "auto" as const },
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
// NUMBERING
// ============================================================

function buildNumbering() {
  return {
    config: [
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0,
            format: "bullet" as const,
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

function buildHeader(courseTitle: string) {
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

function buildCoverSection(meta: DocCourseContent["meta"], logoBuffer: Buffer | null) {
  const logoEl = logoBuffer
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 110, height: 110 },
            type: "png",
          }),
        ],
      })
    : spacer(200);

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
      spacer(800),
      new Paragraph({
        style: "CoverMeta",
        alignment: AlignmentType.CENTER,
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
      spacer(300),
      logoEl,
      new Paragraph({
        style: "CourseTitle",
        children: [new TextRun({ text: meta.title })],
      }),
      spacer(300),
      new Paragraph({
        style: "CoverSubtitle",
        children: [new TextRun({ text: meta.subtitle })],
      }),
      spacer(800),
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
      new Paragraph({
        style: "CoverMeta",
        children: [new TextRun({ text: meta.organization, bold: true, size: 24 })],
      }),
      new Paragraph({
        style: "CoverMeta",
        children: [new TextRun({ text: meta.date })],
      }),
      spacer(800),
      new Paragraph({
        style: "Disclaimer",
        children: [new TextRun({ text: meta.disclaimer })],
      }),
      new Paragraph({ children: [new PageBreak()] }),
    ],
  };
}

// ============================================================
// TABLE OF CONTENTS SECTION
// ============================================================

function buildTocSection(courseTitle: string) {
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

function buildIntroductionSection(
  intro: DocCourseContent["introduction"],
  courseTitle: string
) {
  const children: Paragraph[] = [
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
    headers: buildHeader(courseTitle),
    footers: buildFooter(),
    children,
  };
}

// ============================================================
// T-FLAWS COMPONENT SECTION
// ============================================================

function buildTflawsSection(
  section: DocCourseContent["sections"][number],
  _figureNum: number,
  courseTitle: string,
  images: Map<string, Buffer>
) {
  const children: Paragraph[] = [
    new Paragraph({
      style: "Heading1",
      children: [new TextRun({ text: section.fullTitle })],
    }),
  ];

  const subs = section.subsections;

  children.push(
    new Paragraph({ style: "Heading2", children: [new TextRun({ text: subs.whatItIs.heading })] })
  );
  subs.whatItIs.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  children.push(
    new Paragraph({ style: "Heading2", children: [new TextRun({ text: subs.whyItMatters.heading })] })
  );
  subs.whyItMatters.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  children.push(
    new Paragraph({ style: "Heading2", children: [new TextRun({ text: subs.howToAssess.heading })] })
  );
  subs.howToAssess.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  children.push(
    new Paragraph({
      style: "Heading2",
      children: [new TextRun({ text: subs.abnormalFindings.heading })],
    })
  );
  subs.abnormalFindings.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  children.push(
    new Paragraph({
      style: "Heading2",
      children: [new TextRun({ text: subs.managementResponses.heading })],
    })
  );
  subs.managementResponses.paragraphs.forEach((p) => children.push(renderParagraph(p)));

  const placeholder = subs.managementResponses.imagePlaceholder;
  children.push(...buildScoringTableAndPhotos(section.id, placeholder.caption, images));

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

function buildJournalSection(
  journalSection: DocCourseContent["journalSection"],
  courseTitle: string
) {
  const children: Paragraph[] = [
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
          new TextRun({ text: `. ${j.publisher}. ` }),
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

function buildBibliographySection(
  referenceEntries: DocReferences["referenceEntries"],
  bibliographyOrder: string[],
  courseTitle: string
) {
  const children: Paragraph[] = [
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

function renderParagraph(text: string): Paragraph {
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

// ============================================================
// SCORING TABLES + PHOTO EMBEDDING PER SECTION
// ============================================================

function buildScoringTableAndPhotos(sectionId: string, figureCaption: string, images: Map<string, Buffer>): Paragraph[] {
  const elements: Paragraph[] = [];

  // Scoring table (Figure)
  const table = buildScoringTable(sectionId);
  if (table) {
    elements.push(spacer(160));
    elements.push(table as unknown as Paragraph);
    elements.push(
      new Paragraph({
        style: "Caption",
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: figureCaption, italics: true, font: "Calibri", size: 20 })],
      })
    );
    elements.push(spacer(160));
  }

  // Photos
  const photos = SECTION_PHOTOS[sectionId] ?? [];
  for (const photo of photos) {
    const buf = images.get(photo.file) ?? null;
    if (!buf) continue;
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 80 },
        children: [
          new ImageRun({
            data: buf,
            transformation: { width: 440, height: 280 },
            type: photo.ext,
          }),
        ],
      })
    );
    elements.push(
      new Paragraph({
        style: "Caption",
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: photo.caption, italics: true, font: "Calibri", size: 20 })],
      })
    );
    elements.push(spacer(120));
  }

  return elements;
}

// ── Colored scoring tables ──────────────────────────────────

function tableHeader(text: string, cols: number): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: cols,
        shading: { type: ShadingType.CLEAR, fill: "1F3864", color: "auto" },
        margins: { top: convertInchesToTwip(0.06), bottom: convertInchesToTwip(0.06), left: convertInchesToTwip(0.1), right: convertInchesToTwip(0.1) },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 22, font: "Calibri" })],
          }),
        ],
      }),
    ],
  });
}

function scoreCell(score: string, label: string, body: string, fill: string): TableCell {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill, color: "auto" },
    margins: { top: convertInchesToTwip(0.06), bottom: convertInchesToTwip(0.06), left: convertInchesToTwip(0.08), right: convertInchesToTwip(0.08) },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: score, bold: true, size: 22, font: "Calibri" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, bold: true, size: 20, font: "Calibri" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: body, size: 18, font: "Calibri" })] }),
    ],
  });
}

function buildScoringTable(sectionId: string): Table | null {
  switch (sectionId) {
    case "toes":
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader("Footpad Dermatitis Scoring Scale (Welfare Quality®)", 3),
          new TableRow({
            children: [
              scoreCell("Score 0", "Normal", "No lesion. Intact plantar skin. No discoloration.", "D8F0D2"),
              scoreCell("Score 1", "Mild", "Superficial lesion. Mild discoloration. Surface erosion only.", "FFF2CC"),
              scoreCell("Score 2", "Severe", "Deep ulceration. Necrosis. Affects >1/3 of footpad surface.", "FFD7D7"),
            ],
          }),
        ],
      });

    case "feathers":
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader("Feather Coverage Scoring Scale (LayWel Protocol)", 5),
          new TableRow({
            children: [
              scoreCell("Score 0", "Full Cover", "Complete feather coverage. No bare areas visible.", "D0E4FF"),
              scoreCell("Score 1", "Slight Loss", "Fewer than 5 feathers missing. No bare skin visible.", "C8E6FF"),
              scoreCell("Score 2", "Moderate", "Bare skin visible. Area less than 5 cm².", "FFF2CC"),
              scoreCell("Score 3", "Significant", "Bare area 5–10 cm². Multiple body regions affected.", "FFE0B2"),
              scoreCell("Score 4", "Severe", "Bare area >10 cm² or open wound present.", "FFD7D7"),
            ],
          }),
        ],
      });

    case "legs":
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader("Bristol Gait Scoring Scale", 6),
          new TableRow({
            children: [
              scoreCell("Score 0", "Normal", "Normal gait. Full weight bearing. Fluid movement.", "D8F0D2"),
              scoreCell("Score 1", "Slight", "Minor gait abnormality. Slight limp or stiffness.", "C8F0C0"),
              scoreCell("Score 2", "Definite", "Definite gait abnormality. Noticeable difficulty walking.", "FFF2CC"),
              scoreCell("Score 3", "Marked", "Marked impairment. Reluctant to move. Significant pain.", "FFD27F"),
              scoreCell("Score 4", "Severe", "Unable to walk without wing support. Cannot reach resources.", "FFB347"),
              scoreCell("Score 5", "Cannot Walk", "Unable to walk. Lateral recumbency. Immediate action required.", "FFD7D7"),
            ],
          }),
        ],
      });

    case "activity":
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader("Flock Distribution Patterns", 2),
          new TableRow({
            children: [
              scoreCell("NORMAL", "Even Distribution", "Birds spread evenly across the full barn floor. All areas occupied.", "D8F0D2"),
              scoreCell("ABNORMAL", "Clustering", "Dense clusters with large empty floor areas. Indicates temperature, air quality, or light gradient problem.", "FFD7D7"),
            ],
          }),
        ],
      });

    case "weight":
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader("Body Weight Distribution — Uniform vs Non-Uniform Flock", 2),
          new TableRow({
            children: [
              scoreCell("Uniform Flock", "CV < 10%", "Narrow bell curve. Consistent access to feed, water, and optimal environment. Target for every weigh.", "D8F0D2"),
              scoreCell("Non-Uniform Flock", "CV > 15%", "Wide, flat distribution. Winners and losers in the barn. Investigate temperature gradient, feeder access, or drinker flow.", "FFD7D7"),
            ],
          }),
        ],
      });

    case "skin":
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader("Key Skin Conditions in Commercial Broiler Production", 3),
          new TableRow({
            children: [
              scoreCell("Score A", "Cellulitis", "Subcutaneous fibrinous exudate. #1 cause of whole-carcass condemnation. Entry via skin breaks.", "FFD7D7"),
              scoreCell("Score B", "Breast Blister", "Fluid-filled swelling over keel bone. Caused by chronic breast-to-litter contact in heavy birds.", "FFF2CC"),
              scoreCell("Score C", "Ammonia Burn", "Reddened inflamed ventral skin. Indicates litter moisture >35% and ammonia >25 ppm.", "FFE0B2"),
            ],
          }),
        ],
      });

    default:
      return null;
  }
}


function spacer(spacingBefore = 240): Paragraph {
  return new Paragraph({
    children: [],
    spacing: { before: spacingBefore, after: 0 },
  });
}
