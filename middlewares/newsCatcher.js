// middleware/newsCatcher.js
import Parser from 'rss-parser';

const parser = new Parser();

export const fetchFromSource = async (source) => {
    try {
        // Handle JSON APIs
        if (source.url.includes('api') || source.url.endsWith('.json')) {
            const response = await fetch(source.url); // Native fetch works in modern Node.js
            const data = await response.json();
            
            // Note: You'll need to "map" different API formats to a common shape
            return data.articles || data.results || data; 
        } 

        // Handle RSS Feeds
        const feed = await parser.parseURL(source.url);
        return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            content: item.contentSnippet || item.content,
            pubDate: item.pubDate,
            sourceName: source.name,
            categories: source.category // Using the categories from your Source schema
        }));
        
    } catch (error) {
        console.error(`Failed to fetch from ${source.name}:`, error.message);
        return []; // Return empty array so the app doesn't crash
    }
};