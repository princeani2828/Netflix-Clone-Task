# Netflix Clone - Web App Prototype

A premium Netflix web application prototype built with **React + Vite**, **Tailwind CSS**, and **Express.js** backend. Features interactive movie preview on hover, fullscreen playback, and a responsive design across all devices.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue?logo=tailwindcss)
![Express](https://img.shields.io/badge/Express-4-green?logo=express)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)

---

## Tech Stack & Why

### Frontend
| Technology | Why |
|---|---|
| **React 19** | Industry-standard component-based architecture with hooks for clean state management |
| **Vite 7** | Lightning-fast HMR, optimized builds, and superior developer experience over CRA |
| **Tailwind CSS 4** | Utility-first CSS with the new v4 `@theme` system for custom design tokens |
| **Zustand** | Lightweight, minimal-boilerplate state management (simpler than Redux for this scope) |
| **Axios** | Promise-based HTTP client with interceptors for API communication |

### Backend
| Technology | Why |
|---|---|
| **Node.js + Express** | Lightweight, performant REST API server with minimal setup |
| **In-memory data store** | Simple array-based storage perfect for prototyping (no database dependency) |
| **CORS** | Cross-origin support for frontend-backend communication |

---

## File / Folder Structure

```
netflix-clone/
├── index.html                    # Root HTML with SEO meta tags & Google Fonts
├── vite.config.js                # Vite config with Tailwind plugin & API proxy
├── package.json                  # Frontend dependencies
│
├── src/
│   ├── main.jsx                  # App entry point
│   ├── App.jsx                   # Main app component with layout orchestration
│   ├── index.css                 # Tailwind imports & Netflix design system
│   │
│   ├── components/
│   │   ├── Navbar.jsx            # Sticky navbar with scroll effect
│   │   ├── HeroSection.jsx       # Featured movie banner with video background
│   │   ├── MovieCard.jsx         # Interactive card with hover-to-preview
│   │   ├── MovieRow.jsx          # Responsive grid row of movies
│   │   ├── FullScreenPlayer.jsx  # Full-screen video player with controls
│   │   ├── LoadingScreen.jsx     # Netflix-branded loading spinner
│   │   └── Footer.jsx            # Footer with links & tech stack info
│   │
│   └── store/
│       └── useMovieStore.js      # Zustand store (movies, playback, hover state)
│
├── server/
│   ├── index.js                  # Express API server with validation
│   └── package.json              # Backend dependencies
│
└── public/
    └── vite.svg                  # Favicon
```

---

## Running the Development Server

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Quick Start

```bash
# 1. Clone and install frontend dependencies
cd netflix-clone
npm install

# 2. Install backend dependencies
cd server
npm install
cd ..

# 3. Start the backend API (in one terminal)
cd server
npm run dev
# Server runs on http://localhost:5000

# 4. Start the frontend (in another terminal)
npm run dev
# App runs on http://localhost:5173
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/movies` | Returns list of 9 movies with name, logo, id, status, stream URL |
| `GET` | `/api/movies/:id` | Returns a single movie by ID |
| `POST` | `/api/play/:id` | Simulates starting playback (logs + status change) |
| `POST` | `/api/stop/:id` | Simulates stopping playback |
| `GET` | `/api/playback-log` | Returns playback history |
| `GET` | `/api/health` | Server health check |

---

## Features & Interactions

### Movie Preview on Hover
- Hovering on any movie card **plays the video preview** in the background
- Only the **currently hovered movie** plays at a time
- Preview is **muted** by default
- Smooth fade transition between poster image and video

### Full-Screen Playback
- Clicking a movie **hides the main page** and plays the video fullscreen
- A **transparent Back button** appears in the top-left when you **move the mouse**
- Controls auto-hide after 3 seconds of inactivity
- Full playback controls: play/pause, volume, progress bar, seek

### Back Button
- Returns to the **Netflix main page**
- **Stops** the full-screen playback
- Hovering over movies **continues to work** after returning

### Keyboard Shortcuts (in fullscreen player)
| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `Escape` | Go back to main page |
| `M` | Mute / Unmute |
| `←` | Rewind 10 seconds |
| `→` | Forward 10 seconds |

---

## Design Highlights

- **Netflix-authentic dark theme** with custom color palette
- **Glassmorphism** effects on controls and navigation
- **Smooth micro-animations**: staggered card entry, hover scale, fade transitions
- **Gradient overlays** for cinematic feel
- **Custom scrollbar** matching the dark theme
- **Responsive grid**: 3 columns (desktop) → 2 columns (tablet) → 1 column (mobile)

---

## Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| > 1200px | 3-column grid, full hero section |
| 900px - 1200px | 3-column grid, adjusted spacing |
| 600px - 900px | 2-column grid, reduced hero |
| < 600px | 1-column grid, compact layout |

---

## Video Sources

All videos are sourced from **Google's open-source sample video bucket** and **Blender Foundation** open movies:

| Movie | Source |
|-------|--------|
| Big Buck Bunny | Blender Foundation (2008) |
| Elephants Dream | Blender Foundation (2006) |
| Sintel | Blender Foundation (2010) |
| Tears of Steel | Blender Foundation (2012) |
| For Bigger Blazes/Escapes/Fun/Joyrides/Meltdowns | Google Sample Videos |

All videos are `.mp4` format streamed directly from public CDN URLs. The HTML5 `<video>` player is used for native browser playback simulation.

---

## Bonus Features Implemented

- [x] Clean animations and hover effects
- [x] Full responsiveness (mobile/tablet/desktop)
- [x] Real-time status updates (streaming/available indicators)
- [x] Backend validation and error handling
- [x] Loading and error states
- [x] Keyboard shortcuts for player
- [x] SEO meta tags
- [x] Accessible elements (ARIA labels, keyboard navigation)
