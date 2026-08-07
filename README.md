# Event Booking System - MERN + TypeScript + GSAP

A full-stack event booking application built with MongoDB, Express, React, Node.js, TypeScript, advanced GSAP animations, and **Google Gemini AI**.

## Features

- 🎨 Advanced GSAP animations (fade, slide, scale, stagger, scroll-triggered)
- 🔐 JWT authentication with role-based access
- 📅 Event creation and management
- 🎫 Seat booking system
- 👤 User profile and booking history
- 🤖 **AI-powered EventAI chatbot**
- 🔍 **AI natural-language event search**
- ⭐ **AI personalized event recommendations**
- 🌙 **AI Plan Evening itinerary generator**
- 📝 **AI event description generator (admin)**
- 📊 **AI review summarizer & sentiment analysis**
- 💰 **AI smart pricing advisor (admin)**
- 🎟️ **AI booking assistant & confirmation**
- 📈 **AI demand forecast & sell-out risk dashboard (admin)**
- 📱 Responsive design
- ⚡ TypeScript for type safety

## Project Structure

```
event-booking/
├── backend/          # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/   # Database configuration
│   │   ├── controllers/  # auth, event, booking, AI controllers
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/   # auth, event, booking, AI routes
│   │   ├── services/ # AI service (Google Gemini)
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/         # React + TypeScript + GSAP
    ├── src/
    │   ├── animations/    # GSAP animation utilities
    │   ├── components/    # Reusable components (Navbar, Chatbot, etc.)
    │   ├── context/       # Auth context
    │   ├── pages/         # Page components (Home, PlanEvening, Admin, etc.)
    │   ├── services/      # API services (incl. aiAPI)
    │   ├── styles/        # Global styles
    │   ├── App.tsx
    │   └── index.tsx
    ├── public/
    ├── package.json
    └── tsconfig.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-booking
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the backend server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (protected)

### Events
- GET `/api/events` - Get all events
- GET `/api/events/:id` - Get single event
- POST `/api/events` - Create event (protected)
- PUT `/api/events/:id` - Update event (protected)
- DELETE `/api/events/:id` - Delete event (protected)

### Bookings
- POST `/api/bookings` - Create booking (protected)
- GET `/api/bookings/my-bookings` - Get user bookings (protected)
- PUT `/api/bookings/:id/cancel` - Cancel booking (protected)

### AI (Google Gemini)
- POST `/api/ai/chat` - AI chatbot assistant (protected)
- POST `/api/ai/recommend` - AI event recommendations (protected)
- POST `/api/ai/personalized` - Personalized recommendations (protected)
- POST `/api/ai/search` - Natural-language event search (protected)
- POST `/api/ai/itinerary` - Smart evening itinerary (protected)
- POST `/api/ai/generate-description` - AI description generator (protected)
- POST `/api/ai/summarize-reviews` - AI review summarizer (protected)
- POST `/api/ai/pricing-advice` - AI pricing advisor (protected)
- POST `/api/ai/booking-assistant` - AI booking assistant (protected)
- POST `/api/ai/demand-forecast` - AI demand forecast (protected)

## GSAP Animations

The application includes advanced GSAP animations:

- **fadeInUp**: Fade in with upward motion
- **staggerFadeIn**: Staggered fade-in for multiple elements
- **scaleIn**: Scale animation with bounce effect
- **slideInLeft/Right**: Slide animations from sides
- **scrollReveal**: Scroll-triggered animations
- **hoverScale**: Interactive hover effects
- **pageTransition**: Smooth page transitions
- **pulseAnimation**: Continuous pulse effect
- **rotateIn**: Rotation entrance animation
- **textReveal**: Character-by-character text reveal

## User Roles

- **User**: Can browse events, book tickets, view bookings
- **Admin**: Can create, update, delete events + all user permissions

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- TypeScript
- JWT for authentication
- bcryptjs for password hashing
- Google Gemini AI (@google/generative-ai)

### Frontend
- React 18
- TypeScript
- React Router v6
- Axios
- GSAP 3.12
- CSS3

## Development

### Build Backend
```bash
cd backend
npm run build
```

### Build Frontend
```bash
cd frontend
npm run build
```

## License

MIT
