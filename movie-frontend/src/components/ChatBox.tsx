'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
}

interface ChatResponse {
  response: string;
  movies: Movie[];
  conversationHistory: Message[];
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMovies, setSuggestedMovies] = useState<Movie[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: 'Please log in to use the AI movie assistant.' 
        }]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://movie-recommendation-system-075d.onrender.com'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
        })
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: 'Your session has expired. Please log in again to continue.' 
        }]);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: ChatResponse = await response.json();
      
      // Add AI response to chat
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
      
      // Update suggested movies if any
      if (data.movies && data.movies.length > 0) {
        setSuggestedMovies(data.movies);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isLoggedIn) {
    return null; // Don't show chat if not logged in
  }

  return (
    <>
      {/* Chat Toggle Button - Simple Design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: '#800020' }}
        title="AI Movie Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" style={{ color: '#E8E8E8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" style={{ color: '#E8E8E8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window - Clean Design */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] h-[650px] flex flex-col rounded-lg shadow-2xl overflow-hidden" style={{ backgroundColor: '#E8E8E8', fontFamily: 'Arial, sans-serif' }}>
          {/* Header */}
          <div className="p-4 border-b" style={{ backgroundColor: '#800020', borderColor: '#0C0F0A' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0C0F0A' }}>
                  <svg className="w-6 h-6" style={{ color: '#E8E8E8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: '#E8E8E8' }}>
                    AI Movie Assistant
                  </h3>
                  <p className="text-xs" style={{ color: '#E8E8E8', opacity: 0.8 }}>Powered by Groq AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:opacity-80 transition-opacity"
                style={{ color: '#E8E8E8' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center mt-12 space-y-4" style={{ color: '#0C0F0A' }}>
                <div className="inline-block p-4 rounded-lg" style={{ backgroundColor: '#0C0F0A' }}>
                  <svg className="w-12 h-12 mx-auto" style={{ color: '#E8E8E8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold mb-2">Welcome to AI Assistant</p>
                  <p className="text-sm opacity-70">Ask me for movie recommendations</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  <button
                    onClick={() => setInputMessage("Suggest action movies like John Wick")}
                    className="p-3 rounded-lg text-xs text-left transition-all hover:opacity-80"
                    style={{ backgroundColor: '#0C0F0A', color: '#E8E8E8' }}
                  >
                    💥 Action thrillers
                  </button>
                  <button
                    onClick={() => setInputMessage("I want a romantic comedy")}
                    className="p-3 rounded-lg text-xs text-left transition-all hover:opacity-80"
                    style={{ backgroundColor: '#0C0F0A', color: '#E8E8E8' }}
                  >
                    💕 Rom-coms
                  </button>
                  <button
                    onClick={() => setInputMessage("Movies similar to Inception")}
                    className="p-3 rounded-lg text-xs text-left transition-all hover:opacity-80"
                    style={{ backgroundColor: '#0C0F0A', color: '#E8E8E8' }}
                  >
                    🧠 Mind-bending
                  </button>
                  <button
                    onClick={() => setInputMessage("What should I watch tonight?")}
                    className="p-3 rounded-lg text-xs text-left transition-all hover:opacity-80"
                    style={{ backgroundColor: '#0C0F0A', color: '#E8E8E8' }}
                  >
                    🎬 Surprise me
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[75%] p-3 rounded-lg"
                  style={{
                    backgroundColor: message.role === 'user' ? '#800020' : '#0C0F0A',
                    color: '#E8E8E8'
                  }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#0C0F0A' }}>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#800020' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#800020', animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#800020', animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Movies */}
          {suggestedMovies.length > 0 && (
            <div className="border-t p-3 max-h-40 overflow-y-auto" style={{ borderColor: '#0C0F0A', backgroundColor: '#E8E8E8' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#0C0F0A' }}>Suggested Movies:</p>
              <div className="space-y-2">
                {suggestedMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    className="flex items-center space-x-2 p-2 rounded hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#0C0F0A' }}
                    onClick={() => setIsOpen(false)}
                  >
                    {movie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#E8E8E8' }}>{movie.title}</p>
                      <p className="text-xs" style={{ color: '#E8E8E8', opacity: 0.7 }}>
                        {movie.release_date?.split('-')[0]} • ⭐ {movie.vote_average?.toFixed(1)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4" style={{ borderColor: '#0C0F0A', backgroundColor: '#E8E8E8' }}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask for movie suggestions..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{ 
                  borderColor: '#0C0F0A',
                  backgroundColor: 'white',
                  color: '#0C0F0A'
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#800020', color: '#E8E8E8' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
