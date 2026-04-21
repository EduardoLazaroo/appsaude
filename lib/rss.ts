import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 5000,
});

// A default list of reliable health news feeds (can be customized)
const DEFAULT_FEEDS = [
  'https://www.who.int/rss-feeds/news-english.xml',
  // You can add more generic feeds or Google Alerts RSS URLs here
];

export async function fetchLatestNews(feeds: string[] = DEFAULT_FEEDS) {
  const newsItems = [];

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      // Get top 3 items from each feed to prevent overload
      const recentItems = feed.items.slice(0, 3).map(item => ({
        id: item.guid || item.link,
        title: item.title || 'Sem título',
        link: item.link || '#',
        source: feed.title || 'Fontes de Saúde',
        pubDate: item.pubDate || new Date().toISOString(),
        contentSnippet: item.contentSnippet || item.content || '',
      }));
      
      newsItems.push(...recentItems);
    } catch (error) {
      console.error(`Error fetching RSS feed: ${feedUrl}`, error);
    }
  }

  // Sort by most recent
  return newsItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
