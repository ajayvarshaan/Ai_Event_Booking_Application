# Event Booking System - Project Overview

## Architecture

### Backend (Node.js + Express + TypeScript + MongoDB)
- **Port**: 5000
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **API**: RESTful endpoints

### Frontend (React + TypeScript + GSAP)
- **Port**: 3000
- **State Management**: React Context API
- **Animations**: GSAP 3.12
- **Routing**: React Router v6

## Key Features

### 1. Authentication System
- User registration with password hashing (bcrypt)
- JWT-based authentication
- Role-based access control (User/Admin)
- Protected routes

### 2. Event Management
- Browse all events
- View event details
- Create events (Admin only)
- Update/Delete events (Admin/Organizer)
- Real-time seat availability

### 3. Booking System
- Book multiple seats
- View booking history
- Cancel bookings
- Automatic seat management

### 4. AI-Powered Features (Google Gemini)
- **EventAI Chatbot** - Conversational assistant that answers event, booking, and platform questions
- **AI Event Recommendations** - Suggest events by vibe, budget, category, or date
- **Personalized Recommendations** - Tailored suggestions based on user booking history & wishlist
- **Natural-Language Search** - Search like "jazz concerts under $50 this weekend"
- **Smart Itinerary (Plan Evening)** - Generates 2-4 event evening plans
- **AI Description Generator** - Auto-generates event descriptions + price/capacity (admin)
- **AI Review Summarizer** - Sentiment analysis + key positive/negative points
- **AI Pricing Advisor** - Optimal pricing based on demand & similar events (admin)
- **AI Booking Assistant** - Confirmation messages + preparation tips
- **AI Demand Forecast** - Sell-out risk predictions & platform health (admin)

### 5. Advanced GSAP Animations
- **Page Load**: fadeInUp, scaleIn, slideIn
- **Scroll Triggered**: scrollReveal for elements
- **Stagger Effects**: Multiple elements animate in sequence
- **Hover Effects**: Interactive scale animations
- **Page Transitions**: Smooth navigation transitions
- **Custom Hooks**: useGsapAnimation for reusable animations

## Database Schema

### User
- name: String
- email: String (unique)
- password: String (hashed)
- role: Enum ['user', 'admin']

### Event
- title: String
- description: String
- date: Date
- time: String
- location: String
- category: String
- price: Number
- capacity: Number
- availableSeats: Number
- image: String
- organizer: ObjectId (ref: User)

### Booking
- event: ObjectId (ref: Event)
- user: ObjectId (ref: User)
- seats: Number
- totalPrice: Number
- status: Enum ['pending', 'confirmed', 'cancelled']

## API Endpoints Summary

### Auth Routes (/api/auth)
- POST /register - Create new user
- POST /login - Authenticate user
- GET /profile - Get current user (Protected)

### Event Routes (/api/events)
- GET / - List all events
- GET /:id - Get single event
- POST / - Create event (Protected)
- PUT /:id - Update event (Protected)
- DELETE /:id - Delete event (Protected)

### Booking Routes (/api/bookings)
- POST / - Create booking (Protected)
- GET /my-bookings - User bookings (Protected)
- PUT /:id/cancel - Cancel booking (Protected)

### AI Routes (/api/ai) — Google Gemini
- POST /chat - AI chatbot assistant (Protected)
- POST /recommend - Event recommendations (Protected)
- POST /personalized - Personalized recommendations (Protected)
- POST /search - Natural-language search (Protected)
- POST /itinerary - Smart evening itinerary (Protected)
- POST /generate-description - AI description generator (Protected)
- POST /summarize-reviews - AI review summarizer (Protected)
- POST /pricing-advice - AI pricing advisor (Protected)
- POST /booking-assistant - AI booking assistant (Protected)
- POST /demand-forecast - AI demand forecast (Protected)

## Frontend Pages

1. **Home** - Event listing with grid layout + AI search & recommendations
2. **Login** - User authentication (email/password + Google OAuth)
3. **Register** - New user registration
4. **Booking** - Event booking with seat selection + AI booking assistant
5. **MyBookings** - User's booking history
6. **CreateEvent** - Admin event creation form with AI description generator
7. **Wishlist** - Saved events
8. **Compare** - Compare events side-by-side
9. **PlanEvening** - AI-powered smart itinerary generator
10. **Dashboard** - Admin dashboard with AI tools (pricing, forecast, review analysis)
11. **ActivityLog** - User activity monitoring (admin)
12. **Chatbot (floating)** - EventAI assistant widget

## Google Gemini AI Architecture

- **Service**: `backend/src/services/aiService.ts` — wraps the Gemini SDK (`@google/generative-ai`)
- **Controllers**: `backend/src/controllers/aiController.ts` — validates requests & calls service functions
- **Routes**: `backend/src/routes/aiRoutes.ts` — all protected by JWT
- **Frontend**: `frontend/src/services/api.ts` exposes `aiAPI` with methods for each endpoint
- **Env**: `GEMINI_API_KEY` in `backend/.env` (get from Google AI Studio)

## GSAP Animation Utilities

Located in: `frontend/src/animations/gsapAnimations.ts`

- fadeInUp(element, delay)
- staggerFadeIn(elements, stagger)
- scaleIn(element, delay)
- slideInLeft(element, delay)
- slideInRight(element, delay)
- scrollReveal(elements)
- hoverScale(element)
- pulseAnimation(element)
- rotateIn(element, delay)
- flipCard(element)
- pageTransition()
- textReveal(element)
- morphShape(element)

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Role-based authorization
- Input validation
- CORS enabled

## Responsive Design

- Mobile-first approach
- Breakpoints: 768px, 480px
- Flexible grid layouts
- Touch-friendly interactions

## Getting Started

1. Install MongoDB
2. Run `setup.bat` (Windows) to install dependencies
3. Configure `.env` in backend folder
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm start`
6. Access app at http://localhost:3000

## Default Admin Account

To create an admin user, register normally and manually update the role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Technologies Stack

**Backend:**
- Node.js v18+
- Express.js v4
- MongoDB + Mongoose v8
- TypeScript v5
- JWT v9
- bcryptjs v2
- Google Gemini AI (@google/generative-ai)

**Frontend:**
- React v18
- TypeScript v5
- GSAP v3.12
- React Router v6
- Axios v1
- CSS3

## Performance Optimizations

- Lazy loading for routes
- Optimized GSAP animations
- Efficient MongoDB queries
- JWT token caching
- CSS animations for simple effects

## Future Enhancements

- Payment integration
- Email notifications
- QR code tickets
- Real-time notifications
- Image upload for events
- Social media sharing
- Calendar integration
- Multi-language support
