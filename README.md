# 🎬 Movie Recommendation System

A full-stack movie recommendation application built with Next.js (frontend) and Node.js/Express (backend).

## 🚀 Features

- **Movie Discovery**: Browse popular movies with detailed information
- **User Authentication**: Register and login system
- **Favorites**: Save your favorite movies
- **Movie Search**: Search for specific movies
- **Responsive Design**: Hand-drawn sketch aesthetic with mobile support
- **Movie Details**: Comprehensive movie information with cast, trailers, and reviews

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with Turbopack
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Hand-drawn sketch design** aesthetic

### Backend
- **Node.js** with Express
- **MySQL** database with Prisma ORM
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS** enabled

## 📦 Project Structure

```
movierecommendation/
├── movie-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/            # App router pages
│   │   └── components/     # Reusable components
│   ├── public/             # Static assets
│   └── package.json
└── movie-backend/          # Express.js backend API
    ├── controllers/        # Route controllers
    ├── middleware/         # Authentication middleware
    ├── routes/            # API routes
    ├── config/            # Database configuration
    └── package.json
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- MySQL database
- npm or yarn

### Backend Setup
```bash
cd movie-backend
npm install
# Setup your database connection in config/database.js
# Create your .env file with database credentials
npm run dev
```

### Frontend Setup
```bash
cd movie-frontend
npm install
# Create .env.local with API URL
npm run dev
```

## 🌐 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=movie_recommendation
JWT_SECRET=your_jwt_secret
```

## 📱 Pages

- **Homepage** (`/`) - Popular movies display
- **Search** (`/search`) - Movie search functionality
- **Movie Details** (`/movie/[id]`) - Detailed movie information
- **Favorites** (`/favorites`) - User's favorite movies
- **Login/Register** (`/login`, `/register`) - Authentication

## 🎨 Design Features

- Hand-drawn sketch aesthetic
- Responsive mobile design
- Glassmorphism effects ready
- Custom sketch borders and shadows
- Patrick Hand and Shadows Into Light fonts

## 🚀 Deployment

Ready for deployment to:
- **Frontend**: Netlify, Vercel
- **Backend**: Railway, Render, Heroku

## 📄 License

Private project for learning purposes.