'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from '../../../components/FavoriteButton';

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  budget: number;
  revenue: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string }[];
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string }[];
    crew: { id: number; name: string; job: string; profile_path: string }[];
  };
  videos: {
    results: { id: string; key: string; name: string; type: string; site: string }[];
  };
  similar: {
    results: { id: number; title: string; poster_path: string; vote_average: number }[];
  };
  reviews: {
    results: { id: string; author: string; content: string; created_at: string; author_details: { rating: number } }[];
  };
}

// User Review Component
function UserReviewComponent({ movieId }: { movieId: number }) {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [userName, setUserName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = () => {
    if (userName.trim() && userReview.trim() && userRating > 0) {
      // Here you could send the review to your backend
      console.log('Review submitted:', { movieId, userName, userRating, userReview });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* User Name */}
      <div>
        <label className="block text-lg font-bold mb-2">Your Name:</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name..."
          className="w-full p-3 sketch-border bg-yellow-50 text-black"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        />
      </div>

      {/* Rating */}
      <div>
        <label className="block text-lg font-bold mb-2">Your Rating:</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setUserRating(star)}
              className={`text-4xl transition-colors ${
                star <= userRating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              ⭐
            </button>
          ))}
        </div>
        {userRating > 0 && (
          <p className="text-sm text-gray-600 mt-1">You rated: {userRating}/5 stars</p>
        )}
      </div>

      {/* Review */}
      <div>
        <label className="block text-lg font-bold mb-2">Your Review:</label>
        <textarea
          value={userReview}
          onChange={(e) => setUserReview(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          className="w-full h-32 p-4 sketch-border bg-yellow-50 resize-none text-black"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        />
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmitReview}
          disabled={!userName.trim() || !userReview.trim() || userRating === 0}
          className={`px-8 py-3 sketch-border sketch-shadow font-bold transition-colors ${
            userName.trim() && userReview.trim() && userRating > 0
              ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
              : 'bg-gray-200 cursor-not-allowed'
          }`}
        >
          {submitted ? '✅ Review Submitted!' : '📝 Submit Review'}
        </button>
      </div>

      {submitted && (
        <div className="sketch-border bg-green-50 p-4 text-center">
          <p className="text-green-800 font-bold">Thank you for your review! 🎬</p>
        </div>
      )}
    </div>
  );
}

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!params.id) return;
      
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch movie details');
        }
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Patrick Hand', cursive" }}>
        <div className="sketch-border sketch-shadow bg-white p-12">
          <div className="text-8xl mb-6 animate-bounce">🎬</div>
          <p className="text-2xl text-black font-bold">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Patrick Hand', cursive" }}>
        <div className="sketch-border sketch-shadow bg-red-50 p-12">
          <div className="text-8xl mb-6">😔</div>
          <p className="text-2xl text-black font-bold mb-4">Movie not found!</p>
          <Link href="/" className="sketch-border bg-white px-4 py-2 text-black font-bold hover:bg-gray-100">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const trailers = movie.videos.results.filter(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: "'Patrick Hand', cursive" }}>
      <Head>
        <title>{movie.title} - Movie Details</title>
      </Head>

      {/* Navigation */}
      <nav className="p-6 sketch-border sketch-shadow bg-white relative mx-6 mt-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="sketch-border bg-white px-4 py-2 text-black font-bold hover:bg-gray-100 cursor-pointer">
            ← Back to Movies
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-black hover:text-gray-600 font-bold">Homepage</Link>
            <Link href="/search" className="text-black hover:text-gray-600 font-bold">⌕ Search</Link>
            {user && (
              <Link href="/favorites" className="text-black hover:text-gray-600 font-bold">💖 My Favorites</Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-black text-lg font-bold">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-bold transition-colors sketch-border"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md font-bold transition-colors">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold transition-colors sketch-border">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Movie Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div className="sketch-border sketch-shadow bg-gray-50 p-4">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full sketch-border bg-white transition-all duration-500 filter grayscale hover:grayscale-0"
                style={{ border: '2px solid black', aspectRatio: '2/3' }}
              />
            </div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="sketch-border sketch-shadow bg-white p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-5xl font-bold flex-1" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                  "{movie.title}"
                </h1>
                <div className="ml-4 mt-2">
                  <FavoriteButton 
                    movie={{
                      id: movie.id,
                      title: movie.title,
                      poster_path: movie.poster_path,
                      vote_average: movie.vote_average,
                      release_date: movie.release_date,
                      overview: movie.overview,
                      genre_ids: movie.genres?.map(g => g.id)
                    }} 
                    className="text-3xl"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-lg">
                <span className="sketch-border bg-blue-50 px-3 py-1"> {new Date(movie.release_date).getFullYear()}</span>
                <span className="sketch-border bg-green-50 px-3 py-1">⏱ {formatRuntime(movie.runtime)}</span>
                <span className="sketch-border bg-yellow-50 px-3 py-1"> {movie.vote_average.toFixed(1)}/10</span>
                <span className="sketch-border bg-purple-50 px-3 py-1"> {movie.vote_count.toLocaleString()} votes</span>
              </div>
            </div>

            {/* Genres */}
            <div className="sketch-border sketch-shadow bg-white p-4">
              <h3 className="text-xl font-bold mb-3">🎭 Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => (
                  <span key={genre.id} className="sketch-border bg-gray-50 px-3 py-1 text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Budget & Revenue */}
            {(movie.budget > 0 || movie.revenue > 0) && (
              <div className="sketch-border sketch-shadow bg-white p-4">
                <h3 className="text-xl font-bold mb-3">💰 Box Office</h3>
                <div className="grid grid-cols-2 gap-4">
                  {movie.budget > 0 && (
                    <div className="sketch-border bg-red-50 p-3">
                      <p className="text-sm font-bold">Budget</p>
                      <p className="text-lg">{formatCurrency(movie.budget)}</p>
                    </div>
                  )}
                  {movie.revenue > 0 && (
                    <div className="sketch-border bg-green-50 p-3">
                      <p className="text-sm font-bold">Revenue</p>
                      <p className="text-lg">{formatCurrency(movie.revenue)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overview */}
        <div className="sketch-border sketch-shadow bg-yellow-50 p-6 mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
             Story Synopsis
          </h2>
          <p className="text-lg leading-relaxed italic">"{movie.overview}"</p>
        </div>

        {/* Cast */}
        {movie.credits.cast.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
               Main Cast
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.credits.cast.slice(0, 12).map(actor => (
                <div key={actor.id} className="sketch-border sketch-shadow bg-white p-3 text-center">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                      alt={actor.name}
                      className="w-full h-32 object-cover sketch-border mb-2 filter grayscale"
                      style={{ border: '1px solid black' }}
                    />
                  ) : (
                    <div className="w-full h-32 sketch-border bg-gray-100 flex items-center justify-center mb-2">
                      <span className="text-2xl">👤</span>
                    </div>
                  )}
                  <p className="font-bold text-sm">{actor.name}</p>
                  <p className="text-xs text-gray-600 italic">"{actor.character}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trailers */}
        {trailers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
               Movie Trailers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trailers.slice(0, 2).map(trailer => (
                <div key={trailer.id} className="sketch-border sketch-shadow bg-white p-4">
                  <h3 className="font-bold mb-3">{trailer.name}</h3>
                  <div className="aspect-video sketch-border">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      title={trailer.name}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Review Section */}
        <div className="mb-8">
          <div className="sketch-border sketch-shadow bg-white p-6">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
              Write Your Review
            </h2>
            
            <UserReviewComponent movieId={movie.id} />
          </div>
        </div>

        {/* User Reviews */}
        {movie.reviews.results.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
              📝 User Reviews
            </h2>
            <div className="space-y-4">
              {movie.reviews.results.slice(0, 3).map(review => (
                <div key={review.id} className="sketch-border sketch-shadow bg-blue-50 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-lg">✍️ {review.author}</p>
                    {review.author_details.rating && (
                      <span className="sketch-border bg-white px-3 py-1">
                        ⭐ {review.author_details.rating}/10
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed italic">
                    "{review.content.substring(0, 300)}..."
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    📅 {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {movie.similar.results.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
              🔍 Similar Movies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.similar.results.slice(0, 12).map(similarMovie => (
                <Link 
                  key={similarMovie.id} 
                  href={`/movie/${similarMovie.id}`}
                  className="sketch-border sketch-shadow sketch-hover bg-white p-3 block"
                >
                  {similarMovie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${similarMovie.poster_path}`}
                      alt={similarMovie.title}
                      className="w-full h-32 object-cover sketch-border mb-2 filter grayscale hover:grayscale-0 transition-all duration-300"
                      style={{ border: '1px solid black' }}
                    />
                  ) : (
                    <div className="w-full h-32 sketch-border bg-gray-100 flex items-center justify-center mb-2">
                      <span className="text-2xl">🎬</span>
                    </div>
                  )}
                  <p className="font-bold text-xs text-center">{similarMovie.title}</p>
                  <p className="text-xs text-center">⭐ {similarMovie.vote_average.toFixed(1)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <span>✧</span>
            <span className="text-sm italic">Enjoy the movies! 🍿</span>
            <span>✧</span>
          </div>
        </div>
      </main>
    </div>
  );
}