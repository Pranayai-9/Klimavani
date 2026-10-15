/**
 * Data cleaning and normalization utilities
 */

export function cleanXmlString(rawXml: string): string {
  if (!rawXml) return '';
  return rawXml
    // Strip Byte Order Mark (BOM) and leading whitespace before XML declaration
    .replace(/^[\uFEFF\xA0\s]+/, '')
    .trim();
}

export function cleanHtmlText(text: string = ''): string {
  if (!text) return '';
  return text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function canonicalizeUrl(urlStr: string): string {
  if (!urlStr) return '';
  try {
    const url = new URL(urlStr.trim());
    // Strip standard marketing and tracking parameters
    const paramsToDelete: string[] = [];
    url.searchParams.forEach((_, key) => {
      if (key.startsWith('utm_') || key === 'ref' || key === 'source' || key === 'fbclid') {
        paramsToDelete.push(key);
      }
    });
    paramsToDelete.forEach((key) => url.searchParams.delete(key));
    url.hash = ''; // Remove fragments
    return url.origin + url.pathname.replace(/\/$/, '') + (url.search ? url.search : '');
  } catch {
    return urlStr.trim().toLowerCase().replace(/\/$/, '');
  }
}

export function normalizeTitleForHash(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function parseValidIsoDate(dateString?: string): string {
  if (!dateString) return new Date().toISOString();
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // fallback
  }
  return new Date().toISOString();
}
