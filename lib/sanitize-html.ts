import sanitizeHtml from "sanitize-html";

/**
 * Allow-list sanitiser for CMS / product / blog HTML that is rendered with
 * dangerouslySetInnerHTML. Staff write this content in the dashboard, but it
 * is also imported from Shopify and can be edited by lower-privileged roles,
 * so it is never trusted: scripts, event handlers and javascript: URLs are
 * stripped before the HTML reaches the page.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "div", "span", "section", "article",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "sub", "sup", "small", "mark",
    "ul", "ol", "li", "blockquote", "pre", "code",
    "a", "img", "figure", "figcaption", "picture", "source",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
    "details", "summary", "iframe",
  ],
  allowedAttributes: {
    "*": ["class", "id", "title", "style", "align"],
    a: ["href", "target", "rel", "name"],
    img: ["src", "srcset", "alt", "width", "height", "loading"],
    source: ["src", "srcset", "type", "media"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    col: ["span", "width"],
    iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "frameborder"],
  },
  allowedStyles: {
    "*": {
      color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^[a-z]+$/i],
      "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^[a-z]+$/i],
      "text-align": [/^(left|right|center|justify)$/],
      "font-weight": [/^\d{3}$|^(normal|bold)$/],
      "font-style": [/^(normal|italic)$/],
      "text-decoration": [/^(none|underline|line-through)$/],
      "font-size": [/^[\d.]+(px|em|rem|%)$/],
      "line-height": [/^[\d.]+(px|em|rem|%)?$/],
      "margin": [/^[\d.\s-]+(px|em|rem|%)?(\s[\d.-]+(px|em|rem|%)?)*$/],
      "padding": [/^[\d.\s-]+(px|em|rem|%)?(\s[\d.-]+(px|em|rem|%)?)*$/],
      width: [/^[\d.]+(px|em|rem|%)$/],
      height: [/^[\d.]+(px|em|rem|%)$/],
      "max-width": [/^[\d.]+(px|em|rem|%)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src", "srcset"],
  allowProtocolRelative: false,
  // Embedded video only from the usual hosts.
  allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
  transformTags: {
    a: (tagName, attribs) => {
      // Links that open a new tab must not hand the opener to the target.
      if (attribs.target === "_blank") {
        return { tagName, attribs: { ...attribs, rel: "noopener noreferrer" } };
      }
      return { tagName, attribs };
    },
  },
};

export function cleanHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
