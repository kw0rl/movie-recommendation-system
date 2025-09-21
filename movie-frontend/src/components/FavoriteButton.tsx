'use client';

import { useState, useEffect } from 'react';

interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  genre_ids?: number[];
  vote_average?: number;
  release_date?: string;
  overview?: string;
}

interface FavoriteButtonProps {
  movie: Movie;
  className?: string;
}

export default function FavoriteButton({ movie, className = '' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      checkFavoriteStatus();
    }
  }, [movie.id]);

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/favorites/check/${movie.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    // Prevent event from bubbling up to parent Link
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add favorites');
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`http://localhost:5000/api/favorites/${movie.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites
        const response = await fetch('http://localhost:5000/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            movieId: movie.id,
            movieTitle: movie.title,
            moviePoster: movie.poster_path,
            movieGenres: movie.genre_ids || [],
            movieRating: movie.vote_average,
            movieYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
            movieOverview: movie.overview
          })
        });

        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`
        transition-all duration-200 transform hover:scale-110 
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <div className="relative">
        {isFavorite ? (
          <span className="text-red-500 text-2xl">❤️</span>
        ) : (
          <span className="text-gray-400 hover:text-red-500 text-2xl">🤍</span>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </button>
  );
}