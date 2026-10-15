export type ClimateCategory =
  | 'All News'
  | 'Extreme Weather'
  | 'Floods'
  | 'Heatwaves'
  | 'Droughts'
  | 'Climate Science'
  | 'Research'
  | 'Climate Policy'
  | 'Sustainability'
  | 'Renewable Energy'
  | 'Geospatial Technology'
  | 'General Climate News';

export interface Article {
  id: string;
  canonicalUrl: string;
  providerId?: string;
  doi?: string;
  title: string;
  originalHeadline: string;
  description: string;
  editorialTeaser?: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  articleUrl: string;
  imageUrl?: string;
  publishedAt: string; // ISO 8601
  fetchedAt: string;   // ISO 8601
  category: ClimateCategory;
  country?: string;
  geographicScope?: string;
  language?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  readTimeMinutes?: number;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  siteUrl: string;
  type: 'rss' | 'atom' | 'api';
  defaultCategory: ClimateCategory;
  defaultScope: string;
  enabled: boolean;
  pollingIntervalMinutes?: number;
  attribution: string;
  description: string;
}

export interface CollectionStatus {
  lastAttemptedAt: string | null;
  lastSuccessfulAt: string | null;
  sourcesEnabled: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  totalStoredArticles: number;
  lastError: string | null;
  isCollecting: boolean;
}
