import { Article, ClimateCategory } from '../../src/types/news';
import { FeedSource } from './sources';

/**
 * Strips HTML tags and decodes common HTML entities
 */
export function cleanHtmlText(text: string = ''): string {
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
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts the first image URL found in standard RSS enclosures or HTML tags
 */
export function extractImageUrl(rawItem: any): string | undefined {
  // 1. Enclosure check
  if (rawItem.enclosure?.url && typeof rawItem.enclosure.url === 'string') {
    return rawItem.enclosure.url;
  }

  // 2. Media content or thumbnail check
  const mediaContent = rawItem['media:content'] || rawItem['media:thumbnail'];
  if (mediaContent) {
    if (typeof mediaContent === 'object' && mediaContent.$?.url) {
      return mediaContent.$.url;
    }
    if (typeof mediaContent === 'string' && mediaContent.startsWith('http')) {
      return mediaContent;
    }
    if (Array.isArray(mediaContent) && mediaContent[0]?.$?.url) {
      return mediaContent[0].$.url;
    }
  }

  // 3. Search for <img> in description or content
  const htmlContent = rawItem['content:encoded'] || rawItem.content || rawItem.description || '';
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Infers category based on keywords, preserving scientific boundaries
 */
export function detectCategory(title: string, description: string, defaultCategory: ClimateCategory): ClimateCategory {
  const combined = `${title} ${description}`.toLowerCase();

  if (combined.includes('flood') || combined.includes('inundation') || combined.includes('torrential') || combined.includes('river basin crest')) {
    return 'Floods';
  }
  if (combined.includes('heatwave') || combined.includes('extreme heat') || combined.includes('thermal anomaly') || combined.includes('record high temperature')) {
    return 'Heatwaves';
  }
  if (combined.includes('drought') || combined.includes('arid') || combined.includes('groundwater depletion') || combined.includes('water scarcity') || combined.includes('reservoir dry')) {
    return 'Droughts';
  }
  if (combined.includes('cyclone') || combined.includes('hurricane') || combined.includes('typhoon') || combined.includes('severe storm') || combined.includes('blizzard') || combined.includes('tornado')) {
    return 'Extreme Weather';
  }
  if (combined.includes('satellite') || combined.includes('sentinel') || combined.includes('landsat') || combined.includes('radar') || combined.includes('gis') || combined.includes('remote sensing') || combined.includes('geospatial')) {
    return 'Geospatial Technology';
  }
  if (combined.includes('wind farm') || combined.includes('solar') || combined.includes('photovoltaic') || combined.includes('renewable') || combined.includes('grid battery') || combined.includes('clean energy')) {
    return 'Renewable Energy';
  }
  if (combined.includes('treaty') || combined.includes('cop3') || combined.includes('regulation') || combined.includes('carbon tax') || combined.includes('emissions trading') || combined.includes('legislation') || combined.includes('policy')) {
    return 'Climate Policy';
  }
  if (combined.includes('biodiversity') || combined.includes('conservation') || combined.includes('reforestation') || combined.includes('circular economy') || combined.includes('sustainable')) {
    return 'Sustainability';
  }
  if (combined.includes('study') || combined.includes('researchers') || combined.includes('laboratory') || combined.includes('journal') || combined.includes('peer-reviewed') || combined.includes('simulation') || combined.includes('model')) {
    return 'Research';
  }
  if (combined.includes('ocean heat') || combined.includes('atmosphere') || combined.includes('greenhouse gas') || combined.includes('cryosphere') || combined.includes('ice sheet') || combined.includes('climate science')) {
    return 'Climate Science';
  }

  return defaultCategory;
}

/**
 * Infers geographic scope from text keywords
 */
export function detectGeographicScope(title: string, description: string, defaultScope: string): string {
  const text = `${title} ${description}`;

  if (/arctic|greenland/i.test(text)) return 'Arctic';
  if (/antarctica|antarctic/i.test(text)) return 'Antarctica';
  if (/amazon|brazil/i.test(text)) return 'Amazon Basin';
  if (/europe|eu |mediterranean|alps|rhine/i.test(text)) return 'Europe';
  if (/india|bay of bengal|south asia|himalaya/i.test(text)) return 'South Asia';
  if (/pacific|australia/i.test(text)) return 'Oceania';
  if (/africa|sahel|sahara/i.test(text)) return 'Africa';
  if (/north america|united states|canada/i.test(text)) return 'North America';

  return defaultScope;
}

/**
 * Normalizes a raw RSS feed item into a structured Article
 */
export function normalizeFeedItem(item: any, source: FeedSource, index: number): Article {
  const rawTitle = item.title || 'Untitled Climate Report';
  const cleanTitle = cleanHtmlText(rawTitle);
  const rawDesc = item.contentSnippet || item.summary || item.description || item.content || '';
  const cleanDesc = cleanHtmlText(rawDesc);
  const articleUrl = item.link || item.guid || source.siteUrl;

  const publishedAt = item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate).toISOString() : new Date().toISOString();
  const category = detectCategory(cleanTitle, cleanDesc, source.defaultCategory);
  const geographicScope = detectGeographicScope(cleanTitle, cleanDesc, source.defaultScope);
  const imageUrl = extractImageUrl(item);

  // Generate an ID based on URL or title
  const id = `art-${source.id}-${Date.now().toString(36)}-${index}`;

  // Read time estimate: ~200 words per minute
  const wordCount = (cleanTitle + ' ' + cleanDesc).split(/\s+/).length;
  const readTimeMinutes = Math.max(3, Math.ceil(wordCount / 50));

  // Editorial teaser: first complete sentence of description
  const firstSentenceMatch = cleanDesc.match(/^(.*?[.!?])(?:\s|$)/);
  const editorialTeaser = firstSentenceMatch ? firstSentenceMatch[1] : cleanDesc.slice(0, 160) + '...';

  const isBreaking = /record|surge|alert|warning|unprecedented|crisis|declared/i.test(cleanTitle);

  return {
    id,
    title: cleanTitle,
    originalHeadline: cleanTitle,
    description: cleanDesc.length > 280 ? cleanDesc.slice(0, 280) + '...' : cleanDesc,
    editorialTeaser,
    sourceName: source.name,
    sourceUrl: source.siteUrl,
    articleUrl,
    imageUrl,
    publishedAt,
    category,
    geographicScope,
    isFeatured: false,
    isBreaking,
    readTimeMinutes,
  };
}
