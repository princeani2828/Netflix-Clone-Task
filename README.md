# Netflix Clone - Premium Web App Prototype

A state-of-the-art Netflix web application prototype engineered with **React 19**, **Vite 7**, **Tailwind CSS 4**, and a robust **Node.js/SQLite** backend. This prototype delivers a cinema-grade viewing experience with a high-performance media engine, interactive previews, and persistent user data.

![React](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-purple?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-5.1-003B57?logo=sqlite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express&logoColor=white)

---

## 🚀 What's New: The "Cinema-Ready" Update
The latest iteration elevates the prototype from a static UI to a functional ecosystem:
- **Persistent Data Layer**: Migrated from volatile in-memory storage to a reliable **SQLite** database with automated seeding.
- **Advanced Search API**: Implemented SQL-powered search functionality across titles, genres, and descriptions.
- **Playback Telemetry**: Real-time logging of "Play" and "Stop" actions in the database for analytics simulations.
- **Refined Player UX**: Centered playback controls with micro-animations, touch support for mobile, and advanced keyboard mapping.
- **Responsive Branding**: Integrated a dynamic, professional footer and custom "Netflix-inspired" iconography across all viewports.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: React 19 (using the latest `use` and Concurrent features)
- **Styling**: Tailwind CSS 4 (leveraging the new `@theme` variable system and zero-runtime footprint)
- **State Management**: Zustand (high-performance global state for movies and user preferences)
- **Media Engine**: Video.js (custom VLC.js wrapper) supporting adaptive bitrate simulations.

### Backend
- **Server**: Express.js with a formalized REST architecture.
- **Database**: SQLite3 (via `sqlite` wrapper) for ACID-compliant persistence.
- **Middleware**: Integrated CORS and schema validation for robust API interactions.

---

## 📡 API Documentation

The backend serves as a high-performance REST API on port `5000`.

| Endpoint | Method | Description |
|---|---|---|
| `/api/movies` | `GET` | Retrieve the full library of 35+ movies and shows. |
| `/api/movies/:id` | `GET` | Get detailed metadata for a specific title. |
| `/api/movies/search?q=`| `GET` | Perform a fuzzy search across the database. |
| `/api/play/:id` | `POST` | Simulate streaming start & log event to DB. |
| `/api/stop/:id` | `POST` | Interupt streaming & update status to 'available'. |
| `/api/playback-log` | `GET` | Retrieve the last 50 system activities/logs. |

---

## 📂 Project Structure

```bash
netflix-clone/
├── src/
│   ├── components/
│   │   ├── VideoPlayer/     # Pro-grade VLC.js wrapper & centered controls
│   │   ├── MovieCard/       # Hover-to-preview logic & metadata overlays
│   │   └── Navbar/Footer/   # Globally synced branding & navigation
│   ├── store/               # Zustand state for persistence & movie data
│   └── index.css            # Tailwind 4 design system & custom tokens
├── server/
│   ├── database.sqlite      # Persistent SQLite storage
│   ├── movies_data.js       # Seed data for initial deployment
│   └── index.js             # Express server with SQLite logic
└── public/                  # Static assets & custom "N" favicon
```

---

## ⌨️ Player Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `M` | Mute Toggle |
| `← / →` | Seek -/+ 10 Seconds |
| `↑ / ↓` | Volume Up / Down |
| `F` | Toggle Fullscreen |
| `Esc` | Exit Video Theater |

---

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install && cd server && npm install
   ```

2. **Initialize & Start Backend**:
   ```bash
   cd server && npm start
   ```

3. **Launch Frontend**:
   ```bash
   npm run dev
   ```

---

## ✅ Core Features Implemented
- [x] **Universal Search**: Fast, database-driven search engine.
- [x] **My List Persistence**: LocalStorage-synced personal watchlists.
- [x] **Adaptive Player**: Centered, responsive controls with glassmorphism UI.
- [x] **SEO Optimized**: 100% lighthouse-ready meta tags and semantic HTML.
- [x] **PWA Support**: Fully installable web application manifest.
- [x] **Streaming Simulation**: Functional play/stop states tracked via SQLite.

