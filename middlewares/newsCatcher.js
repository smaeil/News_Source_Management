import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: [['media:content', 'mediaContent'], ['enclosure', 'enclosure']],
    },
});

/**
 * 1. Specialized Fetcher for JSON APIs
 * Uses dynamic mapping from the database source object
 */
const fetchFromApi = async (source) => {
    try {
        console.log(source);
        // Determine how to pass the API Key (Query vs Headers)
        const hasHeaders = source.headers && Object.keys(source.headers).length > 0;
    
        const apiUrl = source.apiKey && !hasHeaders
            ? `${source.url}${source.url.includes('?') ? '&' : '?'}apiKey=${source.apiKey}`
            : source.url;

        const response = await fetch(apiUrl, { 
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'NSM-News-App/1.0',
                ...source.headers 
            } 
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();

        // Use the dynamic mapping from the database
        const map = source.mapping;
        const rawArticles = data[map.root] || [];

        
        return rawArticles.map(article => ({
            title: article[map.title] || "Untitled",
            link: article[map.link],
            source: source.name,
            thumbnail: article[map.thumbnail] || null,
            publishDate: article[map.date] || new Date(),
            categories: source.category,
            favorite: false
        }));
        
    } catch (error) {
        console.log('Api Fetch Error! source:', source.name, "\n", error);
    }
    
};

/**
 * 2. Specialized Fetcher for RSS Feeds
 */
const fetchFromRss = async (source) => {
    const feed = await parser.parseURL(source.url);
    
    return feed.items.map(item => {
        // Find thumbnail in common RSS spots
        let thumb = item.mediaContent?.$.url || item.enclosure?.url || null;
        
        // Fallback: Scrape img from HTML content if necessary
        if (!thumb && item.content) {
            const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
            thumb = imgMatch ? imgMatch[1] : null;
        }

        return {
            title: item.title,
            link: item.link || item.guid,
            source: source.name,
            thumbnail: thumb,
            publishDate: item.pubDate || item.isoDate,
            categories: source.category,
            favorite: false
        };
    });
};

/**
 * 3. MAIN ENTRY POINT
 * Dispatches to the correct handler based on urlType
 */
export const fetchFromSource = async (source) => {
    try {
        if (!source.isActive) return [];

        // Check URL Type and call appropriate function
        if (source.urlType === 'api') {
            return await fetchFromApi(source);
        } 
        
        if (source.urlType === 'rss') {
            return await fetchFromRss(source);
        }

        console.warn(`Unknown urlType: ${source.urlType} for source: ${source.name}`);
        return [];

    } catch (error) {
        console.error(`[newsCatcher] Error in ${source.name}:`, error.message);
        return [];
    }
};