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
        categories?: Array<{ title: string }>;
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

// Generate search query variations for better matching
function generateSearchQueries(title: string, year: string | undefined, mediaType: string): string[] {
  const queries: string[] = [];
  const suffix = mediaType === 'tv' ? 'TV series' : 'film';
  
  // Remove common subtitles and suffixes for cleaner searches
  const cleanTitle = title
    .replace(/:\s+.+$/, '') // Remove subtitles after colon
    .replace(/\s+[-–—]\s+.+$/, '') // Remove parts after dashes
    .trim();
  
  // Primary searches with year (most specific)
  if (year) {
    queries.push(`${title} ${year} ${suffix}`);
    queries.push(`${title} (${year} ${suffix})`);
    if (cleanTitle !== title) {
      queries.push(`${cleanTitle} ${year} ${suffix}`);
    }
  }
  
  // Searches with media type suffix
  queries.push(`${title} ${suffix}`);
  queries.push(`${title} (${suffix})`);
  if (cleanTitle !== title) {
    queries.push(`${cleanTitle} ${suffix}`);
  }
  
  // Fallback to just the title
  queries.push(title);
  if (cleanTitle !== title) {
    queries.push(cleanTitle);
  }
  
  // Remove duplicates while preserving order
  return [...new Set(queries)];
}

// Check if a page is a disambiguation page
async function isDisambiguationPage(pageid: number): Promise<boolean> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageid}&prop=categories&format=json`;
    const response = await fetch(url);
    const data: WikipediaPageResult = await response.json();
    const page = data.query?.pages?.[pageid.toString()];
    
    if (page?.categories) {
      return page.categories.some(cat => 
        cat.title.toLowerCase().includes('disambiguation')
      );
    }
    return false;
  } catch {
    return false;
  }
}

// Get page summary as fallback content
async function getPageSummary(pageid: number): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageid}&prop=extracts&exintro=1&explaintext=1&format=json`;
    const response = await fetch(url);
    const data: WikipediaPageResult = await response.json();
    const page = data.query?.pages?.[pageid.toString()];
    return page?.extract || null;
  } catch {
    return null;
  }
}

// All possible section names we want to extract
const TARGET_SECTIONS = [
  // Plot/Story
  'plot', 'synopsis', 'premise', 'summary', 'story', 'storyline', 'plot summary',
  // Episodes
  'episodes', 'episode list', 'series overview', 'season synopsis', 'episode guide',
  // Production
  'production', 'development', 'conception', 'writing', 'pre-production', 'post-production',
  'filming', 'principal photography', 'cinematography', 'visual effects', 'special effects',
  'music', 'soundtrack', 'score', 'casting', 'cast and crew',
  // Cast
  'cast', 'cast and characters', 'main cast', 'starring', 'recurring cast', 'guest cast',
  'characters', 'main characters',
  // Release
  'release', 'broadcast', 'distribution', 'theatrical release', 'home media', 'streaming',
  'marketing', 'promotion', 'box office',
  // Reception
  'reception', 'critical response', 'critical reception', 'reviews', 'audience response',
  'ratings', 'viewership', 'box office',
  // Themes
  'themes', 'analysis', 'interpretation', 'symbolism', 'style',
  // Awards
  'awards', 'awards and nominations', 'accolades', 'recognition', 'honors',
  // Other useful sections
  'background', 'history', 'legacy', 'impact', 'cultural impact', 'influence',
  'sequel', 'sequels', 'spin-off', 'spin-offs', 'future', 'revival',
];

// Clean and extract text from HTML
function cleanHtmlToText(html: string): string {
  return html
    // Remove script and style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove citations [1], [2], etc.
    .replace(/\[\d+\]/g, '')
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '')
    // Remove edit links
    .replace(/<span[^>]*class="[^"]*mw-editsection[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    // Remove navigation boxes
    .replace(/<div[^>]*class="[^"]*navbox[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<table[^>]*class="[^"]*navbox[^"]*"[^>]*>[\s\S]*?<\/table>/gi, '')
    // Remove infoboxes (usually duplicate data from TMDB)
    .replace(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>[\s\S]*?<\/table>/gi, '')
    // Remove hidden elements
    .replace(/<[^>]*style="[^"]*display:\s*none[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    // Convert headers to bold text
    .replace(/<h[23456][^>]*>([^<]+)<\/h[23456]>/gi, '\n\n**$1**\n')
    // Convert line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    // Handle lists
    .replace(/<li[^>]*>/gi, '• ')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&#\d+;/g, '') // Remove any remaining numeric entities
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/ \n/g, '\n')
    .trim();
}

// Extract sections from parsed HTML
function extractSections(
  htmlContent: string,
  sections: Array<{ line: string; anchor: string; index: string; level: string }>
): { [key: string]: string } {
  const extractedSections: { [key: string]: string } = {};
  
  // Sort sections by index for proper ordering
  const sortedSections = [...sections].sort((a, b) => parseInt(a.index) - parseInt(b.index));
  
  for (let i = 0; i < sortedSections.length; i++) {
    const section = sortedSections[i];
    const sectionName = section.line.replace(/<[^>]*>/g, '').trim().toLowerCase();
    
    // Check if this section matches any target
    const isTargetSection = TARGET_SECTIONS.some(target => 
      sectionName === target || 
      sectionName.includes(target) || 
      target.includes(sectionName)
    );
    
    if (!isTargetSection) continue;
    
    // Find the section start in HTML
    const sectionAnchor = section.anchor;
    
    // Try multiple patterns to find section start
    const patterns = [
      new RegExp(`<span[^>]*id="${sectionAnchor}"[^>]*>`, 'i'),
      new RegExp(`<h\\d[^>]*id="${sectionAnchor}"[^>]*>`, 'i'),
      new RegExp(`id="${sectionAnchor}"`, 'i'),
    ];
    
    let startMatch = -1;
    for (const pattern of patterns) {
      const match = htmlContent.search(pattern);
      if (match !== -1) {
        startMatch = match;
        break;
      }
    }
    
    if (startMatch === -1) continue;
    
    // Find the next section of same or higher level to determine end
    let endMatch = htmlContent.length;
    const currentLevel = parseInt(section.level) || 2;
    
    for (let j = i + 1; j < sortedSections.length; j++) {
      const nextSection = sortedSections[j];
      const nextLevel = parseInt(nextSection.level) || 2;
      
      // Stop at same level or higher (h2 is higher than h3)
      if (nextLevel <= currentLevel) {
        for (const pattern of patterns.map(p => 
          new RegExp(p.source.replace(sectionAnchor, nextSection.anchor), 'i')
        )) {
          const match = htmlContent.slice(startMatch + 50).search(pattern);
          if (match !== -1) {
            endMatch = startMatch + 50 + match;
            break;
          }
        }
        break;
      }
    }
    
    // Extract and clean the section content
    const sectionHtml = htmlContent.slice(startMatch, endMatch);
    const cleanText = cleanHtmlToText(sectionHtml);
    
    // Only include if there's substantial content (more than just the header)
    if (cleanText.length > 100) {
      // Use the original section name (properly cased) as the key
      const displayName = section.line.replace(/<[^>]*>/g, '').trim();
      
      // Avoid duplicate sections - keep the longer version
      const existingKey = Object.keys(extractedSections).find(k => 
        k.toLowerCase() === displayName.toLowerCase()
      );
      
      if (!existingKey) {
        // Limit content size but keep meaningful chunks
        extractedSections[displayName] = cleanText.slice(0, 8000);
      } else if (cleanText.length > extractedSections[existingKey].length) {
        delete extractedSections[existingKey];
        extractedSections[displayName] = cleanText.slice(0, 8000);
      }
    }
  }
  
  return extractedSections;
}

// Also try to extract intro/lead section
function extractLeadSection(htmlContent: string): string | null {
  // Find content before the first section header (h2)
  const firstH2 = htmlContent.search(/<h2/i);
  if (firstH2 === -1) return null;
  
  // Find content after the infobox table
  const leadStart = htmlContent.search(/<\/table>/i);
  if (leadStart === -1 || leadStart > firstH2) {
    // No infobox, start from beginning
    const cleanText = cleanHtmlToText(htmlContent.slice(0, firstH2));
    return cleanText.length > 200 ? cleanText.slice(0, 3000) : null;
  }
  
  const leadHtml = htmlContent.slice(leadStart, firstH2);
  const cleanText = cleanHtmlToText(leadHtml);
  
  return cleanText.length > 200 ? cleanText.slice(0, 3000) : null;
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

    // Generate multiple search query variations
    const searchQueries = generateSearchQueries(title, year, mediaType);
    
    let foundPage = null;
    let searchAttempts = 0;

    // Try each search query until we find a good match
    for (const searchQuery of searchQueries) {
      if (searchAttempts >= 10) break; // Limit total API calls
      
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&srlimit=10`;
      
      console.log(`Trying search query: ${searchQuery}`);
      searchAttempts++;
      
      const searchResponse = await fetch(searchUrl);
      const searchData: WikipediaSearchResult = await searchResponse.json();
      
      if (searchData.query?.search && searchData.query.search.length > 0) {
        // Score each result based on relevance
        for (const result of searchData.query.search) {
          const resultTitle = result.title.toLowerCase();
          const searchTitle = title.toLowerCase();
          
          // Check if it's a disambiguation page - skip those
          if (resultTitle.includes('disambiguation')) continue;
          
          // Prefer exact title matches or titles containing our search term
          const isExactMatch = resultTitle === searchTitle || 
            resultTitle.startsWith(searchTitle + ' (') ||
            resultTitle === `${searchTitle} (${mediaType === 'tv' ? 'tv series' : 'film'})`;
          
          const containsTitle = resultTitle.includes(searchTitle);
          const containsMediaType = resultTitle.includes(mediaType === 'tv' ? 'series' : 'film');
          const containsYear = year ? resultTitle.includes(year) : false;
          
          // Check if it's likely a disambiguation page
          const isDisambig = await isDisambiguationPage(result.pageid);
          if (isDisambig) {
            console.log(`Skipping disambiguation page: ${result.title}`);
            continue;
          }
          
          if (isExactMatch || (containsTitle && (containsMediaType || containsYear))) {
            foundPage = result;
            console.log(`Found matching page: ${result.title}`);
            break;
          }
          
          // Fallback to first result that contains the title
          if (!foundPage && containsTitle) {
            foundPage = result;
          }
        }
        
        if (foundPage) break;
        
        // If no good match yet, try first non-disambiguation result
        if (!foundPage && searchData.query.search.length > 0) {
          for (const result of searchData.query.search) {
            const isDisambig = await isDisambiguationPage(result.pageid);
            if (!isDisambig) {
              foundPage = result;
              break;
            }
          }
        }
        
        if (foundPage) break;
      }
    }

    if (!foundPage) {
      console.log('No Wikipedia article found');
      return new Response(JSON.stringify({ 
        error: 'not_found',
        message: 'No Wikipedia article found for this title' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching full content for page: ${foundPage.title} (ID: ${foundPage.pageid})`);

    // Get the full page content with sections using pageid (more reliable than title)
    const parseUrl = `https://en.wikipedia.org/w/api.php?action=parse&pageid=${foundPage.pageid}&format=json&prop=text|sections`;
    const parseResponse = await fetch(parseUrl);
    const parseData: WikipediaParsedResult = await parseResponse.json();

    // Get page info for the URL
    const pageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${foundPage.pageid}&format=json&prop=info&inprop=url`;
    const pageInfoResponse = await fetch(pageInfoUrl);
    const pageInfoData: WikipediaPageResult = await pageInfoResponse.json();
    
    const pageInfo = pageInfoData.query?.pages?.[foundPage.pageid.toString()];
    const fullUrl = pageInfo?.fullurl || `https://en.wikipedia.org/?curid=${foundPage.pageid}`;

    // Parse the HTML content to extract sections
    const htmlContent = parseData.parse?.text?.["*"] || "";
    const sections = parseData.parse?.sections || [];

    console.log(`Found ${sections.length} sections in article`);

    // Extract relevant sections from HTML
    const extractedSections = extractSections(htmlContent, sections);
    
    // Also try to get the lead/intro section as "Overview"
    const leadSection = extractLeadSection(htmlContent);
    if (leadSection && !extractedSections['Overview']) {
      extractedSections['Overview'] = leadSection;
    }
    
    // If we still have no sections, get the summary as fallback
    let summary = null;
    if (Object.keys(extractedSections).length === 0) {
      summary = await getPageSummary(foundPage.pageid);
      if (summary) {
        extractedSections['Summary'] = summary;
      }
    }

    const result = {
      title: foundPage.title,
      pageId: foundPage.pageid,
      url: fullUrl,
      sections: extractedSections,
      hasSections: Object.keys(extractedSections).length > 0,
      isLimited: Object.keys(extractedSections).length <= 1 && !!summary,
    };

    console.log(`Successfully extracted ${Object.keys(extractedSections).length} sections for: ${foundPage.title}`);
    console.log(`Section names: ${Object.keys(extractedSections).join(', ')}`);

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
