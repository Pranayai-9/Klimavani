import { ClimateCategory } from '../../src/types/news';

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  siteUrl: string;
  defaultCategory: ClimateCategory;
  defaultScope: string;
  description: string;
}

export const VERIFIED_SOURCES: FeedSource[] = [
  {
    id: 'nasa-earth',
    name: 'NASA Earth Observatory',
    url: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss',
    siteUrl: 'https://earthobservatory.nasa.gov',
    defaultCategory: 'Geospatial Technology',
    defaultScope: 'Global',
    description: 'Satellite imagery and remote sensing analysis from NASA Earth science missions.',
  },
  {
    id: 'noaa-climate',
    name: 'NOAA Climate.gov',
    url: 'https://www.climate.gov/news-features/feed',
    siteUrl: 'https://www.climate.gov',
    defaultCategory: 'Climate Science',
    defaultScope: 'Global',
    description: 'Authoritative scientific data and public analysis from the National Oceanic and Atmospheric Administration.',
  },
  {
    id: 'phys-earth',
    name: 'Phys.org Earth Sciences',
    url: 'https://phys.org/rss-feed/earth-sciences/',
    siteUrl: 'https://phys.org',
    defaultCategory: 'Research',
    defaultScope: 'Global',
    description: 'Peer-reviewed research and discoveries across geophysics, climatology, and oceanography.',
  },
  {
    id: 'un-climate',
    name: 'UN Climate Change News',
    url: 'https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml',
    siteUrl: 'https://news.un.org',
    defaultCategory: 'Climate Policy',
    defaultScope: 'Global',
    description: 'Multilateral environmental negotiations, COP updates, and United Nations climate initiatives.',
  },
  {
    id: 'sciencedaily-climate',
    name: 'ScienceDaily Earth & Climate',
    url: 'https://www.sciencedaily.com/rss/earth_climate.xml',
    siteUrl: 'https://www.sciencedaily.com',
    defaultCategory: 'Research',
    defaultScope: 'Global',
    description: 'Latest research breakthroughs in climate science, atmospheric physics, and ecology.',
  },
  {
    id: 'carbon-brief',
    name: 'Carbon Brief',
    url: 'https://www.carbonbrief.org/feed/',
    siteUrl: 'https://www.carbonbrief.org',
    defaultCategory: 'Renewable Energy',
    defaultScope: 'Global',
    description: 'Clear, data-driven analysis of climate science, energy policy, and emissions trajectories.',
  },
  {
    id: 'mongabay',
    name: 'Mongabay Environmental News',
    url: 'https://news.mongabay.com/feed/',
    siteUrl: 'https://news.mongabay.com',
    defaultCategory: 'Sustainability',
    defaultScope: 'Global',
    description: 'Conservation, rainforest preservation, and ecological sustainability reporting.',
  }
];
