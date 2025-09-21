const axios = require('axios');

const API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Get detailed movie information including genres
const getMovieDetails = async (movieId) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: { api_key: API_KEY }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching movie ${movieId}:`, error.message);
        return null;
    }
};

// Calculate similarity between two movies based on content
const calculateMovieSimilarity = (userMovie, candidateMovie) => {
    let similarity = 0;
    let factors = 0;

    // Genre similarity (weight: 40%)
    if (userMovie.genres && candidateMovie.genres) {
        const userGenres = userMovie.genres.map(g => g.id);
        const candidateGenres = candidateMovie.genres.map(g => g.id);
        
        const commonGenres = userGenres.filter(genre => candidateGenres.includes(genre));
        const genreSimilarity = commonGenres.length / Math.max(userGenres.length, candidateGenres.length);
        
        similarity += genreSimilarity * 0.4;
        factors += 0.4;
    }

    // Rating similarity (weight: 20%)
    if (userMovie.vote_average && candidateMovie.vote_average) {
        const ratingDifference = Math.abs(userMovie.vote_average - candidateMovie.vote_average);
        const ratingSimilarity = Math.max(0, 1 - ratingDifference / 10);
        
        similarity += ratingSimilarity * 0.2;
        factors += 0.2;
    }

    // Year similarity (weight: 15%)
    if (userMovie.release_date && candidateMovie.release_date) {
        const userYear = new Date(userMovie.release_date).getFullYear();
        const candidateYear = new Date(candidateMovie.release_date).getFullYear();
        const yearDifference = Math.abs(userYear - candidateYear);
        
        // Movies within 5 years get high similarity
        const yearSimilarity = Math.max(0, 1 - yearDifference / 20);
        
        similarity += yearSimilarity * 0.15;
        factors += 0.15;
    }

    // Popularity similarity (weight: 10%)
    if (userMovie.popularity && candidateMovie.popularity) {
        const maxPopularity = Math.max(userMovie.popularity, candidateMovie.popularity);
        const minPopularity = Math.min(userMovie.popularity, candidateMovie.popularity);
        const popularitySimilarity = minPopularity / maxPopularity;
        
        similarity += popularitySimilarity * 0.1;
        factors += 0.1;
    }

    // Runtime similarity (weight: 15%)
    if (userMovie.runtime && candidateMovie.runtime) {
        const runtimeDifference = Math.abs(userMovie.runtime - candidateMovie.runtime);
        const runtimeSimilarity = Math.max(0, 1 - runtimeDifference / 120); // 120 minutes difference = 0 similarity
        
        similarity += runtimeSimilarity * 0.15;
        factors += 0.15;
    }

    // Return normalized similarity score
    return factors > 0 ? similarity / factors : 0;
};

// Generate recommendations based on user's favorites
const generateRecommendations = async (userFavorites, excludeMovieIds = []) => {
    try {
        console.log('Generating recommendations for', userFavorites.length, 'favorites');

        if (userFavorites.length === 0) {
            return [];
        }

        // Get detailed information for user's favorite movies
        const detailedFavorites = [];
        for (const favorite of userFavorites) {
            const movieDetails = await getMovieDetails(favorite.movie_id);
            if (movieDetails) {
                detailedFavorites.push(movieDetails);
            }
        }

        if (detailedFavorites.length === 0) {
            return [];
        }

        // Get movies from multiple sources for wider recommendations
        const candidateMovies = [];
        
        // 1. Popular movies (multiple pages for more variety)
        for (let page = 1; page <= 3; page++) {
            try {
                const popularResponse = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
                    params: { api_key: API_KEY, page }
                });
                candidateMovies.push(...popularResponse.data.results);
            } catch (error) {
                console.error(`Error fetching popular movies page ${page}:`, error.message);
            }
        }
        
        // 2. Top rated movies (all time classics)
        for (let page = 1; page <= 2; page++) {
            try {
                const topRatedResponse = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
                    params: { api_key: API_KEY, page }
                });
                candidateMovies.push(...topRatedResponse.data.results);
            } catch (error) {
                console.error(`Error fetching top rated movies page ${page}:`, error.message);
            }
        }
        
        // 3. Now playing movies (recent releases)
        const nowPlayingResponse = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
            params: { api_key: API_KEY, page: 1 }
        });
        candidateMovies.push(...nowPlayingResponse.data.results);
        
        // 4. Upcoming movies (future releases)
        const upcomingResponse = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
            params: { api_key: API_KEY, page: 1 }
        });
        candidateMovies.push(...upcomingResponse.data.results);
        
        // 5. Get similar movies based on user's favorite genres
        const userGenres = new Set();
        detailedFavorites.forEach(movie => {
            if (movie.genres) {
                movie.genres.forEach(genre => userGenres.add(genre.id));
            }
        });
        
        // For each favorite genre, get discover movies
        for (const genreId of Array.from(userGenres).slice(0, 3)) { // Limit to top 3 genres
            try {
                const genreResponse = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
                    params: { 
                        api_key: API_KEY, 
                        with_genres: genreId,
                        sort_by: 'vote_average.desc',
                        'vote_count.gte': 100,
                        page: 1
                    }
                });
                candidateMovies.push(...genreResponse.data.results);
            } catch (error) {
                console.error(`Error fetching genre ${genreId} movies:`, error.message);
            }
        }
        
        // 6. Get similar movies for each favorite movie
        for (const favorite of detailedFavorites.slice(0, 3)) { // Limit to top 3 favorites
            try {
                const similarResponse = await axios.get(`${TMDB_BASE_URL}/movie/${favorite.id}/similar`, {
                    params: { api_key: API_KEY, page: 1 }
                });
                candidateMovies.push(...similarResponse.data.results);
            } catch (error) {
                console.error(`Error fetching similar movies for ${favorite.title}:`, error.message);
            }
        }
        
        // 7. Get recommendations from TMDB for each favorite
        for (const favorite of detailedFavorites.slice(0, 2)) { // Limit to top 2 favorites
            try {
                const recommendationsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${favorite.id}/recommendations`, {
                    params: { api_key: API_KEY, page: 1 }
                });
                candidateMovies.push(...recommendationsResponse.data.results);
            } catch (error) {
                console.error(`Error fetching TMDB recommendations for ${favorite.title}:`, error.message);
            }
        }
        
        // Remove duplicates based on movie ID
        const uniqueCandidates = candidateMovies.filter((movie, index, arr) => 
            arr.findIndex(m => m.id === movie.id) === index
        );
        
        console.log(`Found ${uniqueCandidates.length} unique candidate movies from multiple sources`);
        
        const recommendations = [];

        // Calculate similarity for each candidate movie
        for (const candidate of uniqueCandidates) {
            // Skip if movie is already in user's favorites
            if (excludeMovieIds.includes(candidate.id)) {
                continue;
            }

            // Get detailed info for candidate
            const candidateDetails = await getMovieDetails(candidate.id);
            if (!candidateDetails) continue;

            let totalSimilarity = 0;
            let count = 0;

            // Compare with each favorite movie
            for (const favorite of detailedFavorites) {
                const similarity = calculateMovieSimilarity(favorite, candidateDetails);
                totalSimilarity += similarity;
                count++;
            }

            const averageSimilarity = count > 0 ? totalSimilarity / count : 0;

            if (averageSimilarity > 0.25) { // Lowered threshold for more variety
                recommendations.push({
                    ...candidateDetails,
                    similarity_score: averageSimilarity
                });
            }
        }

        // Sort by similarity score and return top recommendations
        return recommendations
            .sort((a, b) => b.similarity_score - a.similarity_score)
            .slice(0, 18); // Return top 18 recommendations for more variety

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return [];
    }
};

module.exports = {
    generateRecommendations,
    calculateMovieSimilarity,
    getMovieDetails
};