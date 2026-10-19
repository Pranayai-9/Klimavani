import { Article } from '../../src/types/news';

/**
 * Strips UTM parameters and tracking hashes for robust URL comparison
 */
export function canonicalizeUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    url.searchParams.delete('utm_source');
    url.searchParams.delete('utm_medium');
    url.searchParams.delete('utm_campaign');
    url.searchParams.delete('utm_term');
    url.searchParams.delete('utm_content');
    return url.origin + url.pathname.replace(/\/$/, '');
  } catch {
    return urlStr.trim().toLowerCase();
  }
}

/**
 * Normalizes title string for duplicate detection
 */
export function canonicalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Validates that an article meets minimum editorial requirements
 */
export function isValidArticle(article: Article): boolean {
  if (!article.title || article.title.trim().length < 5) return false;
  try {
    const url = new URL(article.articleUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  } catch { return false; }
  if (!article.sourceName) return false;
  if (!article.publishedAt || isNaN(new Date(article.publishedAt).getTime())) return false;
  return true;
}

/**
 * Deduplicates articles by URL and Title similarity
 */
export function deduplicateArticles(articles: Article[]): Article[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const deduplicated: Article[] = [];

  for (const article of articles) {
    if (!isValidArticle(article)) continue;

    const canonUrl = canonicalizeUrl(article.articleUrl);
    const canonTitle = canonicalizeTitle(article.title);

    if (seenUrls.has(canonUrl) || seenTitles.has(canonTitle)) {
      continue;
    }

    seenUrls.add(canonUrl);
    seenTitles.add(canonTitle);
    deduplicated.push(article);
  }

  return deduplicated;
}
