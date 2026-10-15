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
  | 'Geospatial Technology';

export interface Article {
  id: string;
  title: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  articleUrl: string;
  imageUrl?: string;
  publishedAt: string; // ISO 8601 string
  category: ClimateCategory;
  geographicScope?: string; // Country or Region (e.g., 'Global', 'South Asia', 'European Union', 'Amazon Basin', 'North America')
  isFeatured?: boolean;
  isBreaking?: boolean;
  editorialTeaser?: string;
  readTimeMinutes?: number;
  originalHeadline?: string;
}

export type SortOrder = 'newest' | 'oldest' | 'title';

export interface FilterOptions {
  category: ClimateCategory;
  searchQuery: string;
  sortBy: SortOrder;
  geographicScope?: string;
}
