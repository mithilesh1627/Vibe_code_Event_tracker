# 🎫 GatherPulse — Intelligent Event Discovery & RSVP Platform

GatherPulse is a modern full-stack web application designed for discovering local live events, managing RSVPs, and coordinating group attendance through a viral friend invite referral system with deduplicated click tracking.

---

## 🌟 Key Highlights & Features

### 1. 📅 Event Discovery & Feed
- **Interactive Monthly Calendar Grid**: Dynamic calendar displaying event density per day with dot badges, month navigation, and click-to-filter capability.
- **Curated Event Feed**: Integrated with the **Ticketmaster Discovery API** with an automatic, resilient offline fallback to a rich realistic dataset when API keys or network are unavailable (viva/demo proof).
- **Search & Multi-Filter**: Search by keyword, filter by city (New York, San Francisco, Chicago, Austin, London, etc.), category (Music, Sports, Arts & Theatre, Film, Miscellaneous), and selected calendar date.
- **Rich Cards**: Displays high-resolution photography, venue, date, time, pricing, category, and real-time **Friends Attending** badges.

### 2. 🎟️ Event Details & RSVP Engine
- **Dedicated Event Page** (`/events/:id`): Full overview with map location, address, ticketing details, and recent RSVP member avatars.
- **Atomic RSVP**: Users can RSVP directly from the feed, details page, or invite landing page.
- **Duplicate RSVP Prevention**: Guaranteed at both the application level and MongoDB schema level using compound unique indexes (`userId + eventId`).
- **Cancellation**: Easily cancel RSVPs from the event page or the dedicated dashboard.

### 3. 👥 Friend Invite Referral System (Core Differentiator)
- **Unique Shareable Referral Links**: When a user RSVPs, a unique invite code is generated (`/invite/:inviteCode`).
- **1-Click Share & Copy**: Includes WhatsApp, Twitter/X, Email, and native mobile share options with toast notifications.
- **Deduplicated Click Analytics**: Protects against rapid page reloads or bot spam by using visitor identifiers (`visitorId` / SHA-256 client fingerprinting). Clicks within a 24-hour window are tracked only once.
- **"🎉 X Friends Attending"**: Dynamically computed on the backend by combining verified RSVPs with referral conversions.
- **Public Invite Landing Page** (`/invite/:inviteCode`): Shows personalized context (`Alex Rivera invited you to attend [Event]`), live attendance social proof, and a single-click RSVP CTA with seamless login redirect.

### 4. 📊 "My Events" Dashboard & User Profile
- **RSVP Dashboard** (`/my-events`): Categorized into **Upcoming Events** and **Past Events** with quick access to invite links and cancellation actions.
- **Profile & Notification Settings** (`/profile`): Name and avatar management, lifetime activity statistics (upcoming, past, invites created, referred friend clicks), and configurable event reminder preferences stored directly in MongoDB.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, TanStack Query (React Query v5), React Router DOM v6, Lucide React, Zod |
| **Backend** | Node.js (v22+), Express, TypeScript, Mongoose (MongoDB ODM), Helmet, CORS, Express Rate Limit, Zod |
| **Database** | MongoDB (Production URI supported + automatic built-in zero-config In-Memory MongoDB fallback for viva/demo) |
| **Integrations** | Ticketmaster Discovery API v2, Dicebear Avatar API |
| **Security** | JWT (JSON Web Tokens), Bcrypt.js password hashing, Rate limiting, input sanitization, error shielding (no stack trace leaks) |

---

## 🏗️ Architecture

GatherPulse adheres strictly to separation of concerns:

```
[ Browser / Client ]
       ↓
  React Pages (Presentation Only)
       ↓
  TanStack Query Hooks (State Management & Caching)
       ↓
  Service Layer (Fetch / API Client)
       ↓  (HTTP REST)
[ Express Server ]
       ↓
  Routes & Zod Validation Middleware
       ↓
  Controllers (HTTP status & response formatting)
       ↓
  Services (Business Logic, calculations, API normalization)
       ↓
  Mongoose Models (Data persistence, indexing & constraints)
       ↓
[ MongoDB Database ]
```

---

## 📂 Project Structure

```text
Event_Tracker/
├── client/                      # Frontend Application (Vite + React + TS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── calendar/        # Monthly interactive calendar grid
│   │   │   ├── common/          # Button, Input, Modal, Badge, Toast, EmptyState
│   │   │   ├── events/          # EventCard, EventGrid, EventFilters, HeroSection, EventSkeleton
│   │   │   ├── invite/          # InviteModal (share, copy, social links)
│   │   │   └── layout/          # Navbar, Footer, Layout wrapper
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── hooks/               # useAuth, useEvents, useRSVP, useInvite, useProfile
│   │   ├── pages/               # HomePage, EventDetailPage, MyEventsPage, InviteLandingPage, ProfilePage, Auth
│   │   ├── services/            # api.ts, auth.service, event.service, rsvp.service, invite.service, user.service
│   │   ├── types/               # TypeScript interfaces
│   │   ├── utils/               # date.utils, visitor.utils
│   │   ├── App.tsx              # Router and QueryClient setup
│   │   └── main.tsx             # React DOM root
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                      # Backend REST API (Node.js + Express + TS)
│   ├── src/
│   │   ├── config/              # Environment config & database connector
│   │   ├── controllers/         # Auth, Event, RSVP, Invite, User controllers
│   │   ├── middleware/          # JWT auth, Zod validation, Rate limiter, Error handler
│   │   ├── models/              # User, RSVP, Invite, InviteClick (Mongoose)
│   │   ├── routes/              # Express API route modules
│   │   ├── services/            # ticketmaster.service, auth, rsvp, invite, user services
│   │   ├── utils/               # mockEvents, generateCode
│   │   └── server.ts            # Server entrypoint & express bootstrap
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── test-api.mjs                 # Comprehensive automated verification suite
├── package.json                 # Root orchestration package
└── README.md
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/event_tracker
JWT_SECRET=gatherpulse_secure_jwt_secret_key_8923487239487293847
TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
CLIENT_URL=http://localhost:5173
USE_IN_MEMORY_DB=auto
```

> **Note on `USE_IN_MEMORY_DB=auto`**: If a local or remote MongoDB instance is reachable at `MONGODB_URI`, the server will use it. If no MongoDB server is detected (e.g., in quick evaluation or viva demo environments), it **automatically spins up an embedded in-memory MongoDB instance** so the entire platform works out of the box with zero external configuration!

### Client (`client/.env`)

```env
VITE_API_BASE_URL=/api
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v22 LTS recommended)
- npm (v9+)

### Installation

From the project root:

```bash
# Install root, server, and client dependencies in one command
npm run install:all
```

Or install individually:

```bash
cd server && npm install
cd ../client && npm install
```

### Running the Application

You can run both backend and frontend concurrently from the root directory:

```bash
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1 - Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2 - Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

GatherPulse includes an automated end-to-end verification script testing all routes, duplicate protection, and referral analytics:

```bash
node test-api.mjs
```

---

## 📋 REST API Endpoints Summary

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes (Bearer) |

### Events (Ticketmaster Discovery)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | List events with keyword, city, category, date filters | Optional (enriches RSVP status) |
| `GET` | `/api/events/:id` | Get event details and recent attendee avatars | Optional |
| `GET` | `/api/events/calendar` | Get event density for month calendar grid | No |

### RSVP System
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/events/:eventId/rsvp` | RSVP to event (prevents duplicates, returns invite code) | Yes |
| `DELETE` | `/api/events/:eventId/rsvp` | Cancel active RSVP | Yes |
| `GET` | `/api/users/me/rsvps` | Retrieve user's upcoming and past RSVPs | Yes |

### Friend Invite System
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/events/:eventId/invite` | Generate/retrieve unique invite code for event | Yes |
| `GET` | `/api/invites/:inviteCode` | Fetch invite landing page context and stats | No |
| `POST` | `/api/invites/:inviteCode/click`| Track referral click with 24h deduplication | No (Rate-limited) |
| `GET` | `/api/events/:eventId/friends-attending` | Get friends attending count and list | No |

### User Profile
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | User profile and activity statistics | Yes |
| `PATCH` | `/api/users/me` | Update name and avatar | Yes |
| `PATCH` | `/api/users/me/reminders` | Update email/push reminder preferences | Yes |

---

## 💡 How the Friend Invite System Works

1. **Unique Code Generation**: When a user registers an RSVP for an event, an 8-character unique alphanumeric referral code is assigned to that `(userId, eventId)` pair.
2. **Shareable URL**: A direct landing URL is formed: `https://gatherpulse.app/invite/:inviteCode`.
3. **Deduplicated Click Analytics**:
   - When a visitor visits the link, a `visitorIdentifier` (derived from client persistent storage or a SHA-256 hash of IP + User-Agent) is transmitted.
   - The backend checks `InviteClick` records within the last 24 hours.
   - If the visitor already viewed the link in the past 24 hours, the hit is flagged as duplicate and does **not** artificially inflate click metrics.
   - If it is a new interaction, an `InviteClick` record is persisted, and the `Invite.clicks` field is atomically incremented via `$inc`.
4. **Friends Attending Calculation**:
   - The backend `InviteService.getFriendsAttendingCount(eventId)` aggregates verified user RSVPs and referral visitor reach to calculate live social proof ("🎉 7 friends attending").
5. **Seamless Conversion**:
   - If the recipient opens the link and is logged in, they can RSVP with a single click.
   - If they are a guest, they are prompted to sign in or register, and the URL redirect parameter ensures they return immediately to the invite page with their RSVP ready.

---

## 🔮 Future Enhancements
- Integration with Google Calendar and Apple Calendar `.ics` exports.
- Push notifications via Web Push API and service workers.
- Real-time WebSocket notifications when a friend accepts an invite.
- QR Code generation for in-person ticket gate scanning.
