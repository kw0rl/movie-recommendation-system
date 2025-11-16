// API Configuration
// Update this URL when deploying to production
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://movie-recommendation-system-075d.onrender.com';

// Helper function to make authenticated requests
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};
