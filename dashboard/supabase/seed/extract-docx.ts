/**
 * Reusable extractor: parse a course .docx (word/document.xml) into the
 * dashboard content model — introduction, sections (+ subsections), journals,
 * references — by walking Heading1 / Heading2 paragraphs in document order.
 *
 * Heading map:
 *   H1 "Table of Contents"                     -> ignored (plus its TOC1/TOC2 rows)
 *   H1 "Introduction"                          -> introduction
 *   H1 /journals?/i (Recommended ... Journals) -> journal_sections
 *   H1 /references|further reading/i           -> references
 *   any other H1                               -> a content section
 *   H2 under an H1                             -> a subsection of that block
 */

import JSZip from 'jszip'
import { readFileSync } from 'fs'

export interface ExtractedSubsection {
  heading: string
  paragraphs: string[]
}
export interface ExtractedSection {
  title: string
  subsections: ExtractedSubsection[]
}
export interface Extracted {
  introduction: { title: string; paragraphs: string[]; subsections: ExtractedSubsection[] }
  sections: ExtractedSection[]
  journals: string[]
  references: string[]
}

const HEADING_STYLES = new Set(['Heading1', 'Title'])
const SUBHEADING_STYLES = new Set(['Heading2'])
const SKIP_STYLES = new Set(['TOC1', 'TOC2', 'TOC3', 'Heading3']) // Heading3 folded into body below

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')
}

interface Para {
  style: string
  text: string
}

function parseParagraphs(xml: string): Para[] {
  const paras: Para[] = []
  const re = /<w:p\b[^>]*>[\s\S]*?<\/w:p>|<w:p\b[^>]*\/>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) {
    const block = m[0]
    const styleM = block.match(/<w:pStyle w:val="([^"]+)"\/>/)
    const style = styleM ? styleM[1] : 'Normal'
    const text = [...block.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
      .map((t) => decodeXml(t[1]))
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
    paras.push({ style, text })
  }
  return paras
}

type BlockKind = 'intro' | 'journals' | 'references' | 'section'

function classifyH1(text: string): BlockKind {
  const t = text.toLowerCase()
  if (/^table of contents$/.test(t)) return 'section' // handled by caller (dropped)
  if (/^introduction\b/.test(t)) return 'intro'
  if (/journal/.test(t)) return 'journals'
  if (/references|further reading|bibliography/.test(t)) return 'references'
  return 'section'
}

export async function extractDocxAsync(docxPath: string): Promise<Extracted> {
  const zip = await JSZip.loadAsync(readFileSync(docxPath))
  const xml = await zip.file('word/document.xml')!.async('string')
  const paras = parseParagraphs(xml)

  const out: Extracted = {
    introduction: { title: 'Introduction', paragraphs: [], subsections: [] },
    sections: [],
    journals: [],
    references: [],
  }

  let mode: BlockKind | null = null
  let curSection: ExtractedSection | null = null
  let curSub: ExtractedSubsection | null = null

  const pushBodyToIntro = (text: string) => {
    if (curSub) curSub.paragraphs.push(text)
    else out.introduction.paragraphs.push(text)
  }

  for (const p of paras) {
    if (SKIP_STYLES.has(p.style)) continue

    if (HEADING_STYLES.has(p.style)) {
      if (!p.text) continue
      // starting a new top-level block
      const t = p.text.toLowerCase()
      if (/^table of contents$/.test(t)) {
        mode = null
        curSection = null
        curSub = null
        continue
      }
      const kind = classifyH1(p.text)
      mode = kind
      curSub = null
      if (kind === 'intro') {
        out.introduction.title = p.text
        curSection = null
      } else if (kind === 'section') {
        curSection = { title: p.text, subsections: [] }
        out.sections.push(curSection)
      } else {
        curSection = null
      }
      continue
    }

    if (SUBHEADING_STYLES.has(p.style)) {
      if (!p.text) continue
      curSub = { heading: p.text, paragraphs: [] }
      if (mode === 'intro') {
        out.introduction.subsections.push(curSub)
      } else if (mode === 'section' && curSection) {
        curSection.subsections.push(curSub)
      } else {
        // subheading appearing under journals/references — treat as body line there
        curSub = null
        if (mode === 'journals') out.journals.push(p.text)
        else if (mode === 'references') out.references.push(p.text)
      }
      continue
    }

    // body paragraph
    if (!p.text) continue
    if (mode === 'intro') {
      pushBodyToIntro(p.text)
    } else if (mode === 'section' && curSection) {
      if (curSub) curSub.paragraphs.push(p.text)
      else {
        // lead paragraph before first H2 — hold in an untitled subsection
        curSub = { heading: '', paragraphs: [p.text] }
        curSection.subsections.push(curSub)
      }
    } else if (mode === 'journals') {
      out.journals.push(p.text)
    } else if (mode === 'references') {
      out.references.push(p.text)
    }
  }

  return out
}
