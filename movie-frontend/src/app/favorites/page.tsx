'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import FavoriteButton from '../../components/FavoriteButton';

interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  overview?: string;
  genres?: Array<{ id: number; name: string }>;
  similarity_score?: number;
  explanation?: string;
}

interface Favorite {
  movie_id: number;
  movie_title: string;
  movie_poster?: string;
  movie_rating?: number;
  movie_year?: number;
  movie_overview?: string;
  created_at: string;
}

interface UserPreferences {
  favorite_genres: Array<{ genreId: number; count: number }>;
  average_rating_preference: string;
  total_favorites: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Run both API calls in parallel for better performance
      const [favoritesResponse, recommendationsResponse] = await Promise.allSettled([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://movie-recommendation-system-075d.onrender.com'}/api/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://movie-recommendation-system-075d.onrender.com'}/api/recommendations/detailed`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      // Handle favorites response
      if (favoritesResponse.status === 'fulfilled' && favoritesResponse.value.ok) {
        const favoritesData = await favoritesResponse.value.json();
        setFavorites(favoritesData);
      } else {
        console.error('Error fetching favorites:', favoritesResponse.status === 'rejected' ? favoritesResponse.reason : 'Failed to fetch');
      }

      // Handle recommendations response
      if (recommendationsResponse.status === 'fulfilled' && recommendationsResponse.value.ok) {
        const recommendationsData = await recommendationsResponse.value.json();
        setRecommendations(recommendationsData.recommendations || []);
        setUserPreferences(recommendationsData.user_preferences);
      } else {
        console.error('Error fetching recommendations:', recommendationsResponse.status === 'rejected' ? recommendationsResponse.reason : 'Failed to fetch');
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-xl">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: "'Patrick Hand', cursive" }}>
      <Head>
        <title>My Favorites & Recommendations</title>
      </Head>
      
      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-7xl">
        {/* Hand-drawn Navigation */}
        <nav className="mb-8 sm:mb-12 p-3 sm:p-6 sketch-border sketch-shadow bg-white relative">
          <div className="flex items-center justify-between">
            {/* Left side - Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-8 text-sm sm:text-lg">
              <Link 
                href="/" 
                className="text-black hover:text-gray-600 font-bold border-b-2 border-transparent hover:border-gray-600 border-dashed pb-1 transition-all duration-200 cursor-pointer inline-block"
              >
                <span className="hidden sm:inline">Homepage</span>
                <span className="sm:hidden">Home</span>
              </Link>
              <span className="text-black text-lg sm:text-2xl pointer-events-none">•</span>
              <Link 
                href="/search" 
                className="text-black hover:text-gray-600 font-bold border-b-2 border-transparent hover:border-gray-600 border-dashed pb-1 transition-all duration-200 cursor-pointer inline-block"
              >
                <span className="hidden sm:inline">⌕ Search Movies</span>
                <span className="sm:hidden">⌕ Search</span>
              </Link>
              <span className="text-black text-lg sm:text-2xl pointer-events-none">•</span>
              <span className="text-black font-bold border-b-2 border-black border-dashed pb-1">
                <span className="hidden sm:inline">My Favorites</span>
                <span className="sm:hidden">Favorites</span>
              </span>
            </div>
            
            {/* Right side - Authentication */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user && (
                <>
                  <span className="text-black text-sm sm:text-lg font-bold whitespace-nowrap">
                    <span className="hidden sm:inline">Welcome, </span>
                    <span className="inline">{user.name}</span>
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md font-bold transition-colors sketch-border text-sm sm:text-base whitespace-nowrap"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* User Preferences Summary */}
        {userPreferences && (
          <div className="mb-8 sm:mb-12 p-3 sm:p-6 sketch-border sketch-shadow bg-blue-50">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
              📊 Your Movie Preferences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{userPreferences.total_favorites}</div>
                <div className="text-xs sm:text-sm">Total Favorites</div>
              </div>
              {userPreferences.average_rating_preference && (
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">★ {userPreferences.average_rating_preference}</div>
                  <div className="text-xs sm:text-sm">Average Rating</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">{recommendations.length}</div>
                <div className="text-xs sm:text-sm">Recommendations</div>
              </div>
            </div>
          </div>
        )}

        {/* My Favorites Section */}
        <section className="mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold mb-6 sm:mb-8 text-center text-black" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
            💖 My Favorite Movies
          </h1>
          
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {favorites.map(favorite => (
                <Link key={favorite.movie_id} href={`/movie/${favorite.movie_id}`} className="sketch-border sketch-shadow sketch-hover bg-white p-4 sm:p-6 relative transition-all duration-300 block cursor-pointer">
                  <div className="mb-3 sm:mb-4 sketch-border bg-gray-50 p-2">
                    {favorite.movie_poster ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${favorite.movie_poster}`}
                        alt={favorite.movie_title}
                        className="w-full h-64 sm:h-80 object-contain sketch-border bg-white"
                        style={{ border: '2px solid black', aspectRatio: '2/3' }}
                      />
                    ) : (
                      <div className="w-full h-64 sm:h-80 sketch-border bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
                        <span className="text-4xl sm:text-6xl">✎</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-black leading-tight" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                      "{favorite.movie_title}"
                    </h3>
                    
                    <div className="flex items-center justify-between sketch-border bg-gray-50 p-2">
                      {favorite.movie_year && (
                        <span className="text-xs sm:text-sm text-black font-bold">{favorite.movie_year}</span>
                      )}
                      {favorite.movie_rating && !isNaN(Number(favorite.movie_rating)) && (
                        <span className="text-xs sm:text-sm text-black font-bold">★ {Number(favorite.movie_rating).toFixed(1)}/10</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="sketch-border sketch-shadow bg-white p-8 sm:p-12 inline-block">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">💔</div>
                <p className="text-xl sm:text-2xl text-black font-bold mb-3 sm:mb-4" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                  No favorites yet!
                </p>
                <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6">Start adding movies to your favorites to get personalized recommendations.</p>
                <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-bold transition-colors sketch-border text-sm sm:text-base">
                  Browse Movies
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 sm:mb-8 text-center text-black" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
              🎯 Recommended For You
            </h2>
            <p className="text-center text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4">
              Based on your favorite movies, we think you'll love these:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {recommendations.map(movie => (
                <Link key={movie.id} href={`/movie/${movie.id}`} className="sketch-border sketch-shadow sketch-hover bg-white p-4 sm:p-6 relative transition-all duration-300 block cursor-pointer">
                  <div className="mb-3 sm:mb-4 sketch-border bg-gray-50 p-2">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-64 sm:h-80 object-contain sketch-border bg-white"
                        style={{ border: '2px solid black', aspectRatio: '2/3' }}
                      />
                    ) : (
                      <div className="w-full h-64 sm:h-80 sketch-border bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
                        <span className="text-4xl sm:text-6xl">✎</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg sm:text-xl font-bold text-black leading-tight flex-1 pr-2" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                        "{movie.title}"
                      </h3>
                      <FavoriteButton movie={movie} className="ml-1 sm:ml-2 mt-1 flex-shrink-0" />
                    </div>
                    
                    <div className="flex items-center justify-between sketch-border bg-gray-50 p-2">
                      {movie.release_date && (
                        <span className="text-xs sm:text-sm text-black font-bold">
                          {new Date(movie.release_date).getFullYear()}
                        </span>
                      )}
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        {movie.vote_average && !isNaN(Number(movie.vote_average)) && (
                          <span className="text-xs sm:text-sm text-black font-bold">★ {Number(movie.vote_average).toFixed(1)}/10</span>
                        )}
                        {movie.similarity_score && !isNaN(Number(movie.similarity_score)) && (
                          <span className="text-xs bg-green-100 text-green-800 px-1 sm:px-2 py-1 rounded">
                            {Math.round(Number(movie.similarity_score) * 100)}% match
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {movie.explanation && (
                      <div className="text-xs text-gray-600 italic p-2 bg-yellow-50 sketch-border">
                        💡 {movie.explanation}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}