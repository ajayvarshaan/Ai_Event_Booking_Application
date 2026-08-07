# TODO

## Fix 1: Navbar nav-links overflow
- [x] Change `justify-content: center` to `justify-content: flex-start` on `.nav-links`
- [x] Add `.nav-links::before/::after` auto-margin pseudo-elements so links stay centered when they fit, but scroll from the left (reachable) when they overflow — "Events" link no longer clipped

## Fix 2: Chatbot active dot clipped
- [x] Override global `button { overflow: hidden }` by setting `.chatbot-toggle { overflow: visible }`
- [x] Hide global button shine (`::after`) on the toggle so it doesn't spill outside the circle
- [x] Reposition `.chatbot-toggle-badge` inward (`top: 6px; right: 6px`) + add shadow & z-index so the active dot is fully visible

## Fix 3: Wishlist "Browse Events" button styling
- [x] Add explicit `.btn-primary` styles (padding, border-radius, gradient, shadow, hover) to `.wishlist-empty .btn-primary` in Wishlist.css so the `<Link>` matches the project's standard buttons

## Fix 4: Google OAuth (replace Facebook login)
- [x] Backend: install `google-auth-library`, add `googleId` + `avatar` fields to User model (password optional)
- [x] Backend: add `googleLogin` controller (verify ID token, find-or-create user, `ADMIN_EMAILS` allowlist → admin role, log activity)
- [x] Backend: add `POST /api/auth/google` route; `.select('+password')` for email login
- [x] Frontend: add Google Identity Services script in index.html
- [x] Frontend: add `authAPI.googleLogin(idToken)` + `avatar` in AuthResponse (api.ts)
- [x] Frontend: add `avatar` to User type in AuthContext.tsx
- [x] Frontend: add Google types to vite-env.d.ts
- [x] Frontend: remove Facebook button, add GIS sign-in button + handler in Login.tsx
- [x] Frontend: style `.login-google-btn` in Login.css
- [x] Frontend: show Google avatar in Navbar (desktop + mobile)
- [x] Create `backend/.env.example` and `frontend/.env.example`
- [x] Verify builds: backend `tsc` + frontend `tsc --noEmit` pass cleanly

## Note: Backend baseURL
- The frontend connects to the backend via `baseURL: 'http://localhost:5000/api'` in `frontend/src/services/api.ts`
- To point to a deployed (Render) backend, replace that single value with the Render URL, e.g. `https://your-app.onrender.com/api`

## Fix 5: User login flow — unregistered email prompt
- [x] Backend: `login` now returns `404` with "Account not found. Please create a new account." when the email isn't registered (distinct from "Incorrect password" 401)
- [x] Frontend: `handleSubmit` detects the 404 and opens a popup modal ("Account Not Found") prompting the user to create a new account
- [x] Modal "Create Account" button navigates to `/register`
- [x] Shared `Modal` component reused for the popup

## Admin login approach
- Admin emails are authorized for Google Sign-In via the `ADMIN_EMAILS` allowlist in `backend/.env`
- Admins can also log in with email/password if they have a registered account
- Only the specific Google emails in `ADMIN_EMAILS` become `admin` role; all other Google emails become `user`

## Fix 6: Register ("Create Account") UI redesign
- [x] Created `frontend/src/pages/Register.css` matching the Login page's premium glassmorphism design (particle canvas, floating orbs, gradient card, shine, accent line, gradient inputs, styled submit button)
- [x] Rewrote `frontend/src/pages/Register.tsx` to mirror Login's structure: particle system, GSAP entrance/tilt/magnetic animations, icon inputs, password visibility toggle, error shake, loading spinner
- [x] Uses the same color palette (purple/cyan/pink gradients) as the rest of the project
- [x] Frontend `tsc --noEmit` passes cleanly

## Fix 7: Add AI features documentation to guide/readme files
- [x] `COMPLETE_GUIDE.md` — added AI features to intro, technologies, file structure, new "🤖 AI Features" section, `/api/ai` endpoints, AI features list, testing checklist, troubleshooting, next steps
- [x] `README.md` — added AI features to feature list, project structure, env vars (`GEMINI_API_KEY`), `/api/ai` endpoints, technologies
- [x] `PROJECT_OVERVIEW.md` — added "AI-Powered Features" section, `/api/ai` routes, frontend pages (Wishlist, Compare, PlanEvening, Dashboard, ActivityLog, Chatbot), Gemini architecture, technologies, updated future enhancements

