export interface FaqEntry {
  question: string;
  /** Answer HTML, tag-balanced so it can be rendered on its own. */
  answer: string;
}

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
  ndash: "–", mdash: "—", hellip: "…",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      return String.fromCodePoint(parseInt(code.slice(2), 16));
    }
    if (code.startsWith("#")) return String.fromCodePoint(parseInt(code.slice(1), 10));
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

/**
 * Slicing between headings cuts list and item tags in half, leaving closers
 * with no opener (and vice versa). Drop the orphans and close what is left so
 * the fragment renders as valid markup.
 */
function balanceHtml(fragment: string): string {
  const stack: string[] = [];
  let out = "";
  const tagPattern = /<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(fragment)) !== null) {
    out += fragment.slice(cursor, match.index);
    cursor = match.index + match[0].length;

    const [full, closing, rawName, attrs] = match;
    const name = rawName.toLowerCase();

    if (VOID_TAGS.has(name) || attrs.trim().endsWith("/")) {
      out += full;
      continue;
    }
    if (closing) {
      const depth = stack.lastIndexOf(name);
      if (depth === -1) continue; // orphan closer — drop it
      // Close anything left open inside this element.
      for (let i = stack.length - 1; i > depth; i--) out += `</${stack[i]}>`;
      stack.length = depth;
      out += full;
      continue;
    }
    stack.push(name);
    out += full;
  }

  out += fragment.slice(cursor);
  for (let i = stack.length - 1; i >= 0; i--) out += `</${stack[i]}>`;
  return out.trim();
}

/**
 * Split a WordPress-style content page into question/answer pairs. Each `<h2>`
 * starts a new entry and everything up to the next one is its answer.
 * Returns an empty array when the content has no headings to split on.
 */
export function parseFaqContent(html: string): FaqEntry[] {
  if (!html) return [];

  const headingPattern = /<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings: { start: number; end: number; text: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(html)) !== null) {
    headings.push({
      start: match.index,
      end: match.index + match[0].length,
      text: stripTags(match[2]),
    });
  }

  if (headings.length === 0) return [];

  return headings
    .map((heading, index) => {
      const next = headings[index + 1];
      const body = html.slice(heading.end, next ? next.start : html.length);
      return {
        // Authors often number the questions by hand; the accordion numbers
        // them itself, so drop a leading "12." or "12)".
        question: heading.text.replace(/^\s*\d+\s*[.)]\s*/, ""),
        answer: balanceHtml(body),
      };
    })
    .filter((entry) => entry.question.length > 0);
}

export interface ContentHeading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Some CMS exports mark sections as a paragraph holding nothing but bold text
 * (`<p><strong>Returns</strong></p>`) instead of a real heading. Promote those
 * so they gain heading typography and appear in the table of contents.
 */
export function promoteStrongHeadings(html: string): string {
  return html.replace(
    /<p\b[^>]*>\s*<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>\s*(?:<br\s*\/?>)?\s*<\/p>/gi,
    (full, _tag, inner: string) => {
      const text = stripTags(inner);
      // Long lines are emphasised sentences, not section titles.
      if (!text || text.length > 80) return full;
      return `<h2>${inner}</h2>`;
    }
  );
}

/**
 * Give every heading a stable id and return them for a table of contents.
 * Ids are de-duplicated so repeated headings still anchor to distinct spots.
 */
export function withHeadingIds(html: string): {
  html: string;
  headings: ContentHeading[];
} {
  if (!html) return { html: "", headings: [] };

  const headings: ContentHeading[] = [];
  const used = new Set<string>();

  const out = html.replace(
    /<h([2-3])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (full, level: string, attrs: string, inner: string) => {
      const text = stripTags(inner);
      if (!text) return full;

      let id = slugify(text) || `section-${headings.length + 1}`;
      let suffix = 2;
      while (used.has(id)) id = `${slugify(text)}-${suffix++}`;
      used.add(id);

      headings.push({ id, text, level: Number(level) });
      // Keep the author's own id if they set one.
      const withId = /\bid=/.test(attrs) ? attrs : `${attrs} id="${id}"`;
      return `<h${level}${withId}>${inner}</h${level}>`;
    }
  );

  return { html: out, headings };
}
