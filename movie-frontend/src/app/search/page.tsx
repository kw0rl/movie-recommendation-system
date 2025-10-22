'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FavoriteButton from '../../components/FavoriteButton';

interface Movie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const searchMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log('Search Response:', data);
      
      const moviesData = data.results || data;
      if (Array.isArray(moviesData)) {
        setMovies(moviesData);
      } else {
        console.error('Expected array but got:', typeof moviesData, moviesData);
        setMovies([]);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: "'Patrick Hand', cursive" }}>
      <Head>
        <title>Search Movies - Movie Recommendation</title>
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
                className="text-black hover:text-gray-600 font-bold border-b-2 border-black border-dashed pb-1 transition-all duration-200 cursor-pointer inline-block"
              >
                <span className="hidden sm:inline">⌕ Search Movies</span>
                <span className="sm:hidden">⌕ Search</span>
              </Link>
              {user && (
                <>
                  <span className="text-black text-lg sm:text-2xl pointer-events-none">•</span>
                  <Link 
                    href="/favorites" 
                    className="text-black hover:text-gray-600 font-bold border-b-2 border-transparent hover:border-gray-600 border-dashed pb-1 transition-all duration-200 cursor-pointer inline-block"
                  >
                    <span className="hidden sm:inline">My Favorites</span>
                    <span className="sm:hidden">Favorites</span>
                  </Link>
                </>
              )}
            </div>
            
            {/* Right side - Authentication */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
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
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-800 px-3 sm:px-3 py-2 rounded-md font-bold transition-colors text-sm sm:text-base whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md font-bold transition-colors sketch-border text-sm sm:text-base whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Register</span>
                    <span className="sm:hidden">Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
        
        {/* Hand-drawn Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 text-black relative" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
            ⌕ Search Movies ⌕
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 h-1 bg-black opacity-30"></div>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 italic px-4">Find your favorite movies!</p>
        </div>
        
        {/* Sketch-style Search Form */}
        <form onSubmit={searchMovies} className="mb-8 sm:mb-12 max-w-3xl mx-auto">
          <div className="sketch-border sketch-shadow bg-white p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
              <div className="flex-1">
                <label className="block text-sm sm:text-lg font-bold mb-2 text-black">
                  Movie Title:
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter movie title..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 sketch-border bg-yellow-50 text-black placeholder-gray-500 text-sm sm:text-lg focus:outline-none focus:bg-white transition-colors"
                  style={{ fontFamily: "'Patrick Hand', cursive" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 sm:px-8 py-2 sm:py-3 sketch-border sketch-shadow sketch-hover bg-white text-black font-bold text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed crosshatch relative whitespace-nowrap mt-6 sm:mt-0"
              >
                {loading ? '⏳ Searching...' : '🔍 Search!'}
              </button>
            </div>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="sketch-border sketch-shadow bg-white p-12 inline-block">
              <div className="text-8xl mb-6 animate-bounce">⏳</div>
              <p className="text-2xl text-black font-bold" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                Searching for movies...
              </p>
              <div className="mt-4 w-32 h-1 bg-black mx-auto opacity-50"></div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <div>
            {movies.length > 0 ? (
              <>
                <div className="text-center mb-8">
                  <div className="sketch-border bg-green-50 p-4 inline-block">
                    <h2 className="text-2xl font-bold text-black" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                      ✓ Found {movies.length} result{movies.length !== 1 ? 's' : ''} for "{query}"
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                  {movies.map(movie => (
                    <Link 
                      key={movie.id} 
                      href={`/movie/${movie.id}`}
                      className="sketch-border sketch-shadow sketch-hover bg-white p-4 sm:p-6 relative crosshatch transition-all duration-300 block cursor-pointer"
                    >
                      {/* Movie Poster with sketch frame */}
                      <div className="mb-3 sm:mb-4 sketch-border bg-gray-50 p-2">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-64 sm:h-80 object-contain sketch-border bg-white transition-all duration-500 filter grayscale hover:grayscale-0 hover:brightness-100 contrast-125"
                            style={{ 
                              border: '2px solid black',
                              aspectRatio: '2/3'
                            }}
                          />
                        ) : (
                          <div className="w-full h-64 sm:h-80 sketch-border bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
                            <span className="text-4xl sm:text-6xl">✎</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Movie Info */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3 leading-tight flex-1 pr-2" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
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
                          {movie.vote_average && (
                            <span className="text-xs sm:text-sm text-black font-bold flex items-center">
                              ★ {movie.vote_average.toFixed(1)}/10
                            </span>
                          )}
                        </div>
                        
                        {movie.overview && (
                          <div className="sketch-border bg-yellow-50 p-2 sm:p-3 relative">
                            <p className="text-black text-xs sm:text-sm leading-relaxed italic">
                              "{movie.overview.substring(0, 150)}..."
                            </p>
                            <div className="absolute top-1 right-2 text-yellow-600 text-xs sm:text-sm">📝</div>
                          </div>
                        )}
                        
                        <div className="text-right">
                          <span className="text-xs text-gray-600 border border-black px-2 py-1 bg-white">
                            ID: {movie.id}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="sketch-border sketch-shadow bg-red-50 p-12 inline-block">
                  <div className="text-8xl mb-6">(╥‸╥)</div>
                  <p className="text-2xl text-black font-bold mb-4" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                    No movies found for "{query}"
                  </p>
                  <p className="text-lg text-gray-700 italic">Try searching for a different movie title</p>
                  <div className="mt-4 w-32 h-1 bg-black mx-auto opacity-50"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <div className="sketch-border sketch-shadow bg-blue-50 p-12 inline-block">
              <div className="text-8xl mb-6">🎬</div>
              <p className="text-2xl text-black font-bold" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                Enter a movie title to start searching
              </p>
              <div className="mt-4 flex justify-center space-x-2">
                <span className="px-3 py-1 sketch-border bg-white text-sm">Batman</span>
                <span className="px-3 py-1 sketch-border bg-white text-sm">Avengers</span>
                <span className="px-3 py-1 sketch-border bg-white text-sm">Inception</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Hand-drawn footer doodle */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <span>✧</span>
            <span className="text-xs sm:text-sm italic">Happy searching! ⌕</span>
            <span>✧</span>
          </div>
        </div>
      </main>
    </div>
  );
}