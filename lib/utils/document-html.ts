const ALLOWED_TAGS = new Set([
  'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em',
  'i', 'u', 'br', 'hr', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot',
  'tr', 'th', 'td', 'img', 'svg', 'path', 'g', 'line', 'polyline', 'rect', 'circle',
])
const GLOBAL_ATTRIBUTES = new Set([
  'class', 'title', 'style', 'id', 'colspan', 'rowspan', 'align', 'valign',
  'width', 'height', 'border', 'cellpadding', 'cellspacing', 'viewbox', 'fill',
  'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'x', 'y',
  'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2', 'points'
])

export function escapeDocumentHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isSafeImageSource(value: string) {
  return /^(https:\/\/|data:image\/(png|jpeg|jpg|webp|gif);base64,)/i.test(value)
}

/** User-managed templates may only contain presentational markup. */
export function sanitizeDocumentHtml(html: string): string {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html
      .replace(/<\/?(script|style|iframe|object|embed|link|meta|base)[^>]*>/gi, '')
      .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/\s(?:href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|\s*javascript:[^\s>]+)/gi, '')
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html')
  for (const element of Array.from(parsed.body.querySelectorAll('*'))) {
    const tag = element.tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) {
      element.replaceWith(parsed.createTextNode(element.textContent || ''))
      continue
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim()
      const allowedImageSource = tag === 'img' && name === 'src' && isSafeImageSource(value)
      const allowedImageAlt = tag === 'img' && name === 'alt'
      if (!GLOBAL_ATTRIBUTES.has(name) && !allowedImageSource && !allowedImageAlt) {
        element.removeAttribute(attribute.name)
      }
    }
  }
  return parsed.body.innerHTML
}
