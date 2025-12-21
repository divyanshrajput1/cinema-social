import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, movieId, tvId, seasonNumber, page = 1, genreId, year, minRating, sortBy } = await req.json();
    
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY is not configured');
      throw new Error('TMDB API key is not configured');
    }

    let url = '';
    
    switch (action) {
      // Movie endpoints
      case 'trending':
        url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'popular':
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'top_rated':
        url = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'now_playing':
        url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'upcoming':
        url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'search':
        if (!query) throw new Error('Search query is required');
        url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
        break;
      case 'movie_details':
        if (!movieId) throw new Error('Movie ID is required');
        url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar,recommendations`;
        break;
      case 'movie_credits':
        if (!movieId) throw new Error('Movie ID is required');
        url = `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`;
        break;
      case 'movie_videos':
        if (!movieId) throw new Error('Movie ID is required');
        url = `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`;
        break;
      case 'similar':
        if (!movieId) throw new Error('Movie ID is required');
        url = `${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'genres':
        url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`;
        break;
      case 'discover':
        const params = new URLSearchParams({
          api_key: TMDB_API_KEY,
          page: page.toString(),
          sort_by: sortBy || 'popularity.desc',
        });
        if (genreId) params.append('with_genres', genreId.toString());
        if (year) params.append('primary_release_year', year.toString());
        if (minRating) params.append('vote_average.gte', minRating.toString());
        url = `${TMDB_BASE_URL}/discover/movie?${params}`;
        break;
      
      // TV endpoints
      case 'tv_trending':
        url = `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'tv_popular':
        url = `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'tv_top_rated':
        url = `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'tv_on_the_air':
        url = `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'tv_airing_today':
        url = `${TMDB_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'search_tv':
        if (!query) throw new Error('Search query is required');
        url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
        break;
      case 'tv_details':
        if (!tvId) throw new Error('TV ID is required');
        url = `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar,recommendations`;
        break;
      case 'tv_season':
        if (!tvId || seasonNumber === undefined) throw new Error('TV ID and season number are required');
        url = `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
        break;
      case 'tv_similar':
        if (!tvId) throw new Error('TV ID is required');
        url = `${TMDB_BASE_URL}/tv/${tvId}/similar?api_key=${TMDB_API_KEY}&page=${page}`;
        break;
      case 'tv_genres':
        url = `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`;
        break;
      case 'discover_tv':
        const tvParams = new URLSearchParams({
          api_key: TMDB_API_KEY,
          page: page.toString(),
          sort_by: sortBy || 'popularity.desc',
        });
        if (genreId) tvParams.append('with_genres', genreId.toString());
        if (year) tvParams.append('first_air_date_year', year.toString());
        if (minRating) tvParams.append('vote_average.gte', minRating.toString());
        url = `${TMDB_BASE_URL}/discover/tv?${tvParams}`;
        break;
      
      // Multi-search (searches both movies and TV)
      case 'multi_search':
        if (!query) throw new Error('Search query is required');
        url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Fetching TMDB: ${action}`, { movieId, tvId, query, page, seasonNumber });
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API Error:', response.status, errorText);
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in tmdb function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
