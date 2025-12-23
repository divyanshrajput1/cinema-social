import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WikipediaSearchResult {
  query?: {
    search?: Array<{
      title: string;
      pageid: number;
      snippet: string;
    }>;
  };
}

interface WikipediaPageResult {
  query?: {
    pages?: {
      [key: string]: {
        pageid: number;
        title: string;
        extract?: string;
        fullurl?: string;
      };
    };
  };
}

interface WikipediaParsedResult {
  parse?: {
    title: string;
    pageid: number;
    text?: {
      "*": string;
    };
    sections?: Array<{
      toclevel: number;
      level: string;
      line: string;
      number: string;
      index: string;
      fromtitle: string;
      anchor: string;
    }>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, year, mediaType } = await req.json();
    
    if (!title) {
      throw new Error('Title is required');
    }

    console.log(`Searching Wikipedia for: ${title} (${year}) - ${mediaType}`);

    // Build search queries - try multiple variations for better matches
    const searchQueries = [
      `${title} ${year} ${mediaType === 'tv' ? 'TV series' : 'film'}`,
      `${title} (${year} ${mediaType === 'tv' ? 'TV series' : 'film'})`,
      `${title} ${mediaType === 'tv' ? 'TV series' : 'film'}`,
      title,
    ];

    let foundPage = null;

    // Try each search query until we find a match
    for (const searchQuery of searchQueries) {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&srlimit=5`;
      
      console.log(`Trying search query: ${searchQuery}`);
      
      const searchResponse = await fetch(searchUrl);
      const searchData: WikipediaSearchResult = await searchResponse.json();
      
      if (searchData.query?.search && searchData.query.search.length > 0) {
        // Look for the best match - prefer exact title matches
        const exactMatch = searchData.query.search.find(
          (result) => result.title.toLowerCase().includes(title.toLowerCase())
        );
        foundPage = exactMatch || searchData.query.search[0];
        console.log(`Found page: ${foundPage.title}`);
        break;
      }
    }

    if (!foundPage) {
      return new Response(JSON.stringify({ 
        error: 'not_found',
        message: 'No Wikipedia article found for this title' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the full page content with sections
    const parseUrl = `https://en.wikipedia.org/w/api.php?action=parse&pageid=${foundPage.pageid}&format=json&prop=text|sections`;
    const parseResponse = await fetch(parseUrl);
    const parseData: WikipediaParsedResult = await parseResponse.json();

    // Get page info for the URL
    const pageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${foundPage.pageid}&format=json&prop=info&inprop=url`;
    const pageInfoResponse = await fetch(pageInfoUrl);
    const pageInfoData: WikipediaPageResult = await pageInfoResponse.json();
    
    const pageInfo = pageInfoData.query?.pages?.[foundPage.pageid.toString()];
    const fullUrl = pageInfo?.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(foundPage.title)}`;

    // Parse the HTML content to extract sections
    const htmlContent = parseData.parse?.text?.["*"] || "";
    const sections = parseData.parse?.sections || [];

    // Define which sections we want to extract
    const targetSections = [
      'plot', 'synopsis', 'premise', 'summary',
      'production', 'development', 'filming', 'writing',
      'cast', 'cast and characters', 'main cast', 'starring',
      'release', 'broadcast', 'distribution',
      'reception', 'critical response', 'critical reception', 'reviews',
      'awards', 'awards and nominations', 'accolades',
      'episodes', 'episode list', 'series overview'
    ];

    // Extract relevant sections from HTML
    const extractedSections: { [key: string]: string } = {};
    
    for (const section of sections) {
      const sectionName = section.line.toLowerCase().replace(/<[^>]*>/g, '').trim();
      
      for (const target of targetSections) {
        if (sectionName.includes(target) || target.includes(sectionName)) {
          // Extract content between this section heading and the next
          const sectionAnchor = section.anchor;
          const sectionIndex = parseInt(section.index);
          
          // Find next section index
          const nextSection = sections.find(s => parseInt(s.index) === sectionIndex + 1);
          
          // Build regex to extract section content
          const startPattern = new RegExp(`<span[^>]*id="${sectionAnchor}"[^>]*>`, 'i');
          const startMatch = htmlContent.search(startPattern);
          
          if (startMatch !== -1) {
            let endMatch = htmlContent.length;
            if (nextSection) {
              const endPattern = new RegExp(`<span[^>]*id="${nextSection.anchor}"[^>]*>`, 'i');
              const endSearch = htmlContent.slice(startMatch + 100).search(endPattern);
              if (endSearch !== -1) {
                endMatch = startMatch + 100 + endSearch;
              }
            }
            
            let sectionHtml = htmlContent.slice(startMatch, endMatch);
            
            // Clean up the HTML to plain text
            let cleanText = sectionHtml
              // Remove script and style tags
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              // Remove citations [1], [2], etc.
              .replace(/\[\d+\]/g, '')
              .replace(/<sup[^>]*class="reference"[^>]*>[\s\S]*?<\/sup>/gi, '')
              // Remove edit links
              .replace(/<span[^>]*class="mw-editsection"[^>]*>[\s\S]*?<\/span>/gi, '')
              // Convert line breaks
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<\/p>/gi, '\n\n')
              .replace(/<\/li>/gi, '\n')
              .replace(/<\/tr>/gi, '\n')
              // Remove remaining HTML tags
              .replace(/<[^>]+>/g, '')
              // Clean up whitespace
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/\n{3,}/g, '\n\n')
              .trim();
            
            // Normalize section name for the key
            const normalizedKey = target.charAt(0).toUpperCase() + target.slice(1);
            
            if (cleanText.length > 50) { // Only include if there's substantial content
              // Avoid duplicates - use the most specific section name
              const existingKey = Object.keys(extractedSections).find(k => 
                k.toLowerCase().includes(target) || target.includes(k.toLowerCase())
              );
              
              if (!existingKey || cleanText.length > extractedSections[existingKey].length) {
                if (existingKey) {
                  delete extractedSections[existingKey];
                }
                extractedSections[section.line.replace(/<[^>]*>/g, '').trim()] = cleanText.slice(0, 5000); // Limit size
              }
            }
          }
          break;
        }
      }
    }

    const result = {
      title: foundPage.title,
      pageId: foundPage.pageid,
      url: fullUrl,
      sections: extractedSections,
      hasSections: Object.keys(extractedSections).length > 0,
    };

    console.log(`Successfully extracted ${Object.keys(extractedSections).length} sections for: ${foundPage.title}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in wikipedia function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
