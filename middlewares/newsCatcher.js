import Parser from 'rss-parser';

const parser = new Parser();

export const fetchFromSource = async (source) => {
    try {
        // 1. Handle JSON APIs
        if (source.urlType === 'api') {
            // Construct URL - handle potential API key injection
            const apiUrl = source.apiKey 
                ? `${source.url}${source.url.includes('?') ? '&' : '?'}apiKey=${source.apiKey}`
                : source.url;

            const response = await fetch(apiUrl);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            // Normalize API data to match your Save schema
            // Most APIs use 'articles' or 'results'
            const rawArticles = data.articles || data.results || data.items || [];
            
            return rawArticles.map(article => ({
                title: article.title,
                link: article.url || article.link,
                source: source.name,
                categories: source.category,
                publishDate: article.publishedAt || article.pubDate || new Date()
            }));
        } 

        // 2. Handle RSS Feeds
        if (source.urlType === 'rss') {
            const feed = await parser.parseURL(source.url);
            
            return feed.items.map(item => ({
                title: item.title,
                link: item.link || item.guid,
                source: source.name,
                categories: source.category,
                publishDate: item.pubDate || item.isoDate
            }));
        }

        return [];

    } catch (error) {
        console.error(`[newsCatcher] Error fetching from ${source.name}:`, error.message);
        return []; 
    }
};