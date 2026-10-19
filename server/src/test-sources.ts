/**
 * Test script to verify all RSS sources
 * Run with: npx tsx server/src/test-sources.ts
 */
import Parser from 'rss-parser';
import { VERIFIED_SOURCES } from './sources';
import { normalizeFeedItem } from './normalizer';
import { ENV } from './config/env';

const parser = new Parser({
  timeout: ENV.REQUEST_TIMEOUT_MS,
  headers: {
    'User-Agent': ENV.USER_AGENT,
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
});

async function testSource(source: typeof VERIFIED_SOURCES[0]) {
  console.log(`\n[${'='.repeat(70)}]`);
  console.log(`Testing: ${source.name}`);
  console.log(`URL: ${source.url}`);
  console.log(`Category: ${source.defaultCategory}`);
  console.log(`[${'='.repeat(70)}]`);

  try {
    const startTime = Date.now();
    const feed = await parser.parseURL(source.url);
    const elapsed = Date.now() - startTime;

    console.log(`✓ Feed fetched successfully in ${elapsed}ms`);
    console.log(`  Feed title: ${feed.title || 'N/A'}`);
    console.log(`  Total items: ${feed.items?.length || 0}`);

    if (feed.items && feed.items.length > 0) {
      console.log(`\n  Sample articles:`);
      const samples = feed.items.slice(0, 3);
      
      samples.forEach((item, index) => {
        try {
          const normalized = normalizeFeedItem(item, source, index);
          console.log(`\n  [${index + 1}] ${normalized.title}`);
          console.log(`      Published: ${normalized.publishedAt}`);
          console.log(`      Category: ${normalized.category}`);
          console.log(`      Image: ${normalized.imageUrl ? '✓ Yes' : '✗ No'}`);
          console.log(`      URL: ${normalized.articleUrl}`);
        } catch (err: any) {
          console.log(`\n  [${index + 1}] ✗ Failed to normalize: ${err.message}`);
        }
      });
    } else {
      console.log(`  ⚠ No items found in feed`);
    }

    return { success: true, itemCount: feed.items?.length || 0, elapsed };
  } catch (err: any) {
    console.log(`✗ Failed: ${err.message}`);
    return { success: false, error: err.message, itemCount: 0, elapsed: 0 };
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║         KLIMAVANI RSS SOURCE VERIFICATION TEST                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');
  console.log(`Testing ${VERIFIED_SOURCES.length} verified sources...\n`);

  const results = [];

  for (const source of VERIFIED_SOURCES) {
    const result = await testSource(source);
    results.push({ source: source.name, ...result });
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                          TEST SUMMARY                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  const totalArticles = results.reduce((sum, r) => sum + r.itemCount, 0);

  console.log(`Total Sources Tested: ${results.length}`);
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`Total Articles Available: ${totalArticles}`);
  console.log(`\nSuccess Rate: ${((successCount / results.length) * 100).toFixed(1)}%\n`);

  if (failCount > 0) {
    console.log('Failed Sources:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  ✗ ${r.source}: ${r.error}`);
      });
    console.log('');
  }

  console.log('Successful Sources:');
  results
    .filter(r => r.success)
    .forEach(r => {
      console.log(`  ✓ ${r.source}: ${r.itemCount} articles (${r.elapsed}ms)`);
    });

  console.log('\n');
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
