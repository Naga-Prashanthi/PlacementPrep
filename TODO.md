# TODO - Smart Placement Preparation Portal (MongoDB + JWT)

## Step 1: Backend scaffold
- Create `server/` folder
- Add Express app with CORS + JSON parsing
- Add health endpoint

## Step 2: MongoDB connection (Mongoose)
- Add `server/config/db.js` to connect via `MONGODB_URI`

## Step 3: Models
- `User` model (email unique, passwordHash, role)
- `QuestionProgress` model (userId, questionKey, moduleType, company, status)
- `DailyChallenge` model (userId, challengeDate, items/streak)
- `InterviewExperience` model (userId, company, notes, rating)

## Step 4: Auth (JWT)
- Signup + login endpoints
- JWT middleware `requireAuth`
- Admin middleware `requireAdmin`

## Step 5: Progress + daily challenges APIs
- Route to mark question status
- Route to fetch my progress
- Route to fetch today’s daily challenges (server-determined/personalized)
- Route to mark daily challenge items

## Step 6: Admin dashboard readiness
- Admin endpoint that aggregates progress into readiness metrics

## Step 7: Integrate frontend with API
- Replace `localStorage` auth in `src/utils/auth.js`, `Login.jsx`, `Signup.jsx`
- Add `src/utils/api.js` for API calls
- Update `Dashboard.jsx`, `Challenges.jsx`, `DSAQuestions.jsx`, etc. to persist progress via backend

## Step 8: Wiring Vite proxy
- Update `vite.config.js` (or add fetch baseUrl) so `/api` hits backend

## Step 9: Install dependencies + run
- Install server dependencies
- Add `.env.example`
- Start backend + frontend and validate flows

