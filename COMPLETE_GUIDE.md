# 🎉 Event Booking System - Complete Guide (MERN + TypeScript + Vite + GSAP)

## ✅ What Has Been Created

A full-stack MERN application with TypeScript, Vite, and advanced GSAP animations.

### Backend (Node.js + Express + TypeScript + MongoDB)
- ✅ User authentication with JWT
- ✅ Event management (CRUD)
- ✅ Booking system with seat management
- ✅ Role-based access (User/Admin)
- ✅ RESTful API
- ✅ **AI-powered features** (Google Gemini) — chat, recommendations, search, itineraries

### Frontend (React + TypeScript + Vite + GSAP)
- ✅ Lightning-fast Vite dev server
- ✅ Hot Module Replacement (HMR)
- ✅ Advanced GSAP animations
- ✅ Responsive design
- ✅ Complete booking flow
- ✅ **AI-powered UI** — chatbot, smart search, AI recommendations, plan-evening

---

## 🚀 Quick Start

### Option 1: Automated (Recommended)
```bash
# 1. Install dependencies
setup.bat

# 2. Start both servers
start-app.bat

# 3. Open browser
http://localhost:3000
```

### Option 2: Manual
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## 📦 Technologies

### Backend
- Node.js v18+
- Express.js v4
- MongoDB + Mongoose v8
- TypeScript v5
- JWT v9
- bcryptjs v2
- **Google Gemini AI (`@google/generative-ai`)**

### Frontend
- React v18
- TypeScript v5
- **Vite v5** ⚡ (Lightning Fast!)
- GSAP v3.12
- React Router v6
- Axios v1

---

## ⚡ Why Vite?

| Feature | Vite | Create React App |
|---------|------|------------------|
| Start Time | ~200ms | ~30s |
| HMR | Instant | 1-3s |
| Build Speed | Fast | Slow |
| Bundle Size | Optimized | Larger |

---

## 📁 Complete File Structure

```
event-booking/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── eventController.ts
│   │   │   ├── bookingController.ts
│   │   │   └── aiController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Event.ts
│   │   │   └── Booking.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── eventRoutes.ts
│   │   │   ├── bookingRoutes.ts
│   │   │   └── aiRoutes.ts
│   │   ├── services/
│   │   │   └── aiService.ts
│   │   └── server.ts
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── animations/
│   │   │   └── gsapAnimations.ts
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Navbar.css
│   │   │   ├── EventCard.tsx
│   │   │   └── EventCard.css
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Home.css
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Auth.css
│   │   │   ├── Booking.tsx
│   │   │   ├── Booking.css
│   │   │   ├── MyBookings.tsx
│   │   │   ├── MyBookings.css
│   │   │   ├── CreateEvent.tsx
│   │   │   └── CreateEvent.css
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── README.md
├── HOW_TO_RUN.md
├── PROJECT_OVERVIEW.md
├── QUICK_START.md
├── setup.bat
├── start-app.bat
└── stop-app.bat
```

---

## 🎨 GSAP Animations (13 Types)

Located in `frontend/src/animations/gsapAnimations.ts`:

1. **fadeInUp** - Fade in with upward motion
2. **staggerFadeIn** - Staggered fade-in
3. **scaleIn** - Scale with bounce effect
4. **slideInLeft** - Slide from left
5. **slideInRight** - Slide from right
6. **scrollReveal** - Scroll-triggered
7. **hoverScale** - Hover effects
8. **pulseAnimation** - Continuous pulse
9. **rotateIn** - Rotation entrance
10. **flipCard** - Card flip
11. **pageTransition** - Page transitions
12. **textReveal** - Character reveal
13. **morphShape** - Shape morphing

---

## 🤖 AI Features (Google Gemini)

The app includes a full suite of AI-powered features powered by the **Google Gemini API** (`@google/generative-ai`). All AI endpoints live under `/api/ai` and require a valid `GEMINI_API_KEY` on the backend.

### Backend Configuration

Add the following to `backend/.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

> Get a free key at [Google AI Studio](https://aistudio.google.com/). The AI service uses model `gemini-3.5-flash` with safety settings for harassment, hate speech, sexually explicit, and dangerous content.

### Where the AI Lives

| Layer      | Files |
|------------|-------|
| Backend    | `backend/src/services/aiService.ts`, `backend/src/controllers/aiController.ts`, `backend/src/routes/aiRoutes.ts` |
| Frontend   | `frontend/src/components/Chatbot.tsx` + `.css`, `frontend/src/pages/PlanEvening.tsx`, `frontend/src/pages/Home.tsx` (AI search/recommend), `frontend/src/pages/AdminDashboard.tsx` (AI tools), `frontend/src/services/api.ts` (`aiAPI`) |

### AI Capabilities in the UI

- **EventAI Chatbot** — floating widget (bottom-left) that answers questions with live event data
- **Home page** — AI-powered search bar + AI recommendations section
- **Plan Evening** — generates a smart itinerary based on vibe, budget, and start time
- **Admin Dashboard** — AI description generator, review summarizer, pricing advisor, demand forecast
- **Booking page** — AI booking assistant confirmation + prep tips

---

## 🔐 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register user
- `POST /login` - Login user
- `GET /profile` - Get profile (Protected)

### Events (`/api/events`)
- `GET /` - Get all events
- `GET /:id` - Get single event
- `POST /` - Create event (Protected)
- `PUT /:id` - Update event (Protected)
- `DELETE /:id` - Delete event (Protected)

### Bookings (`/api/bookings`)
- `POST /` - Create booking (Protected)
- `GET /my-bookings` - Get user bookings (Protected)
- `PUT /:id/cancel` - Cancel booking (Protected)

### AI (`/api/ai`) — Google Gemini
- `POST /chat` - Conversational AI assistant (Protected)
- `POST /recommend` - AI event recommendations by vibe/budget/date (Protected)
- `POST /personalized` - Personalized recommendations from user's booking & wishlist history (Protected)
- `POST /search` - Natural-language event search (Protected)
- `POST /itinerary` - Smart evening itinerary planner (Protected)
- `POST /generate-description` - AI event description + pricing/capacity suggestions (Protected)
- `POST /summarize-reviews` - AI review summarizer + sentiment analysis (Protected)
- `POST /pricing-advice` - Smart pricing advisor based on demand & similar events (Protected)
- `POST /booking-assistant` - Booking confirmation + preparation tips (Protected)
- `POST /demand-forecast` - AI demand forecasting & sell-out risk dashboard (Protected)

---

## 🎯 Features

### User Features
- ✅ Register and login
- ✅ Browse events with animations
- ✅ Book multiple seats
- ✅ View booking history
- ✅ Cancel bookings

### Admin Features
- ✅ Create events
- ✅ Update events
- ✅ Delete events
- ✅ Manage capacity

### Technical Features
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Real-time seat availability
- ✅ TypeScript type safety
- ✅ Vite HMR
- ✅ GSAP animations
- ✅ Responsive design

### AI Features (Google Gemini)
- ✅ **AI Chatbot (EventAI)** — floating chat widget that answers questions about events, bookings, and platform features
- ✅ **AI Recommendations** — event suggestions by vibe, budget, category, or date
- ✅ **Personalized Recommendations** — tailored to each user's booking history & wishlist
- ✅ **Natural-Language Search** — type like "jazz concerts under $50 this weekend" and get matching events
- ✅ **Smart Itinerary (Plan Evening)** — generates an evening plan with 2-4 events matching your vibe & budget
- ✅ **AI Event Description Generator** — admins auto-generate compelling descriptions + suggested price/capacity
- ✅ **AI Review Summarizer** — sentiment analysis + key positive/negative points from event reviews
- ✅ **AI Pricing Advisor** — recommends optimal pricing based on demand ratio & similar events
- ✅ **AI Booking Assistant** — friendly confirmation message + preparation tips
- ✅ **AI Demand Forecast** — predicts sell-out risks and overall platform health for admins

---

## 🌐 URLs

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:3000    |
| Backend  | http://localhost:5000    |
| MongoDB  | mongodb://localhost:27017|

---

## 📝 Quick Commands

### Start Everything
```bash
start-app.bat
```

### Stop Everything
```bash
stop-app.bat
```

### Backend Only
```bash
cd backend
npm run dev
```

### Frontend Only (Vite)
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## 👤 Create Admin User

1. Register normally via UI
2. Connect to MongoDB:
```bash
mongo
use event-booking
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Not Running
```bash
net start MongoDB
```

### Clear Vite Cache
```bash
cd frontend
rmdir /s /q node_modules\.vite
npm run dev
```

### Reinstall Dependencies
```bash
# Backend
cd backend
rmdir /s /q node_modules
npm install

# Frontend
cd frontend
rmdir /s /q node_modules
npm install
```

### AI Features Not Working
1. Check `backend/.env` has `GEMINI_API_KEY` set
2. Verify the backend restarted after adding the key (env vars load at startup)
3. AI endpoints require login (JWT token) — make sure you're authenticated
4. Check the backend console for Gemini error logs
5. Ensure `@google/generative-ai` is installed: `cd backend && npm install`

---

## 📚 Documentation Files

- **README.md** - Main documentation
- **HOW_TO_RUN.md** - Detailed running guide
- **PROJECT_OVERVIEW.md** - Architecture details
- **QUICK_START.md** - Quick start guide

---

## ✅ Testing Checklist

- [ ] MongoDB running
- [ ] Backend starts (port 5000)
- [ ] Frontend starts (port 3000)
- [ ] Can register user
- [ ] Can login
- [ ] Can view events
- [ ] Can book event
- [ ] Can view bookings
- [ ] Can cancel booking
- [ ] Admin can create event
- [ ] Animations work smoothly
- [ ] Responsive on mobile
- [ ] `GEMINI_API_KEY` set in `backend/.env`
- [ ] AI Chatbot answers event questions
- [ ] AI recommendations return matching events
- [ ] Natural-language search returns results
- [ ] Plan Evening generates an itinerary
- [ ] Admin AI tools (description gen, pricing, forecast) work

---

## 🎓 Learning Points

### Vite Benefits
- Instant server start
- Lightning-fast HMR
- Optimized production builds
- Native ES modules

### GSAP Integration
- Smooth animations
- ScrollTrigger for scroll effects
- Timeline for complex sequences
- Performance optimized

### TypeScript
- Type safety
- Better IDE support
- Fewer runtime errors
- Self-documenting code

---

## 🚀 Next Steps

1. ✅ Run `setup.bat`
2. ✅ Run `start-app.bat`
3. ✅ Open http://localhost:3000
4. ✅ Register a user
5. ✅ Create admin user in MongoDB
6. ✅ Create events as admin
7. ✅ Book events as user
8. ✅ Explore animations
9. ✅ Add `GEMINI_API_KEY` to `backend/.env`
10. ✅ Chat with the EventAI chatbot
11. ✅ Try AI-powered search and recommendations
12. ✅ Generate a Plan Evening itinerary
13. ✅ Use admin AI tools (description gen, pricing advice, demand forecast)

---

## 💡 Pro Tips

1. **Vite Dev Server**: Starts instantly
2. **HMR**: Edit files and see changes immediately
3. **TypeScript**: Hover over variables for type info
4. **GSAP**: Check browser console for animation logs
5. **MongoDB Compass**: Use GUI to view database

---

## 🎉 You're All Set!

Your Event Booking System with **MERN + TypeScript + Vite + GSAP** is ready!

**To start:**
```bash
start-app.bat
```

**To stop:**
```bash
stop-app.bat
```

**Happy Coding! 🚀**
