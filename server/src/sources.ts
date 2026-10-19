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
    id: 'noaa-news',
    name: 'NOAA News',
    url: 'https://www.noaa.gov/rss.xml',
    siteUrl: 'https://www.noaa.gov',
    defaultCategory: 'Climate Science',
    defaultScope: 'Global',
    description: 'Official news and announcements from the National Oceanic and Atmospheric Administration.',
  },
  {
    id: 'phys-earth',
    name: 'Phys.org Earth & Environment',
    url: 'https://phys.org/rss-feed/earth-news/',
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
