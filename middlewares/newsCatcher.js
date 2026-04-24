import Cache from '../models/Cache.schema.js';
import Parser from 'rss-parser';

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes in milliseconds


const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent', {keepArray: false}], 
            ['enclosure', 'enclosure'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['image', 'image']
        ],
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
            content: article[map.content || 'content'] || article[map.description || 'description'] || "", // Fallback
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

    const webSiteLogo = feed.image.url;
    
    return feed.items.map(item => {
        // Find thumbnail in common RSS spots, handling the nested $ object
        // 1. Check mediaContent (handling the $ object)
        // 2. Check enclosure (handling the $ object)
        let thumb = 
            item.mediaContent?.$?.url || 
            item.enclosure?.$?.url || 
            item.enclosure?.url ||
            item.mediaThumbnail?.$?.url ||
            item.image?.$?.url ||
            webSiteLogo || 
            null;
        
        // Fallback: Scrape img from HTML content if necessary
        if (!thumb && item.content) {
            const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
            thumb = imgMatch ? imgMatch[1] : null;
        }

        // RSS often has 'content' or 'contentEncoded'
        const fullContent = item['content:encoded'] || item.content || item.contentSnippet || "";

        return {
            title: item.title,
            link: item.link || item.guid,
            content: fullContent,
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

        // 1. Look for existing cache
        const cachedData = await Cache.findOne({ sourceId: source._id }).populate('sourceId').lean();
        const now = Date.now();

        // 2. Is the cache "Fresh"?
        const isFresh = cachedData && (now - new Date(cachedData.updatedAt).getTime() < CACHE_DURATION_MS);

        if (isFresh) {
            console.log(`[Cache Hit] Serving fresh data for ${source.name}`);
            return cachedData.articles.map(article => ({
                ...article,
                source: cachedData.sourceId.name,
                categories: cachedData.sourceId.category
            }));
        }

        // 3. Cache is stale OR missing -> Try to fetch from internet
        try {
            console.log(`[Fetching Live] ${source.name}...`);
            let news = [];
            if (source.urlType === 'api') news = await fetchFromApi(source);
            if (source.urlType === 'rss') news = await fetchFromRss(source);

            // 4. Update the Cache with new data
            await Cache.findOneAndUpdate(
                { sourceId: source._id },
                { articles: news, updatedAt: new Date() },
                { upsert: true }
            );

            return news;

        } catch (fetchError) {
            // 5. CONNECTION LOST / FETCH ERROR FALLBACK
            if (cachedData) {
                console.warn(`[Network Error] Fetch failed for ${source.name}. Using stale cache.`);
                return cachedData.articles; // Return old data instead of crashing
            }
            throw fetchError; // No cache and no internet? Throw error.
        }

    } catch (error) {
        console.error(`[newsCatcher Error] ${source.name}:`, error.message);
        return [];
    }
};