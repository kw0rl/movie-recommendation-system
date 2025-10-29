'use client';

// app/page.tsx
interface Movie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FavoriteButton from '../components/FavoriteButton';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
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
        // Clear invalid data
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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch('https://wishlistbackend-s9uso.ondigitalocean.app/api/movies/popular');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        // Ensure we're setting an array
        const moviesData = data.results || data;
        if (Array.isArray(moviesData)) {
          setMovies(moviesData);
        } else {
          setMovies([]);
        }
      } catch (error) {
        // Production: Silent error handling
        setMovies([]);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: "'Patrick Hand', cursive" }}>
      <Head>
        <title>Movies Recommendation</title>
      </Head>
      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-7xl">
        {/* Hand-drawn Navigation */}
        <nav className="mb-8 sm:mb-12 p-3 sm:p-6 sketch-border sketch-shadow bg-white relative">
          <div className="flex items-center justify-between">
            {/* Left side - Homepage and Search */}
            <div className="flex items-center space-x-2 sm:space-x-8 text-sm sm:text-lg">
              <Link 
                href="/" 
                className="text-black hover:text-gray-600 font-bold border-b-2 border-black border-dashed pb-1 transition-all duration-200 hover:border-gray-600 cursor-pointer inline-block"
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
            ★ Popular Movies ★
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 h-1 bg-black opacity-30"></div>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 italic px-4">Discover the most popular movies right now!</p>
          <div className="mt-4 flex justify-center">
            <div className="sketch-border px-3 sm:px-4 py-2 bg-white">
              <span className="text-xs sm:text-sm">✧ Hand-picked for you ✧</span>
            </div>
          </div>
        </div>

        {/* Sketch-style Movie Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {Array.isArray(movies) && movies.length > 0 ? (
            movies.map((movie, index) => (
              <Link 
                key={`movie-${movie.id}-${index}`} 
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
                
                {/* Movie Info with hand-drawn styling */}
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
                  
                  <div className="text-right">
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-16">
              <div className="sketch-border sketch-shadow bg-white p-8 sm:p-12 inline-block">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">📖</div>
                <p className="text-xl sm:text-2xl text-black font-bold px-4" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                 loading...
                </p>
                <div className="mt-4 w-24 sm:w-32 h-1 bg-black mx-auto opacity-50"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Hand-drawn footer doodle */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <span>✧</span>
            <span className="text-xs sm:text-sm italic">Made with ♡ and lots of ☕</span>
            <span>✧</span>
          </div>
        </div>
      </main>
    </div>
  );
}