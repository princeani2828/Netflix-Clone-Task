# Netflix Clone - Web App Prototype

A premium Netflix web application prototype built with **React 19**, **Vite 7**, **Tailwind CSS 4**, and **Video.js (VLC.js)**. This prototype features a cinema-grade media player with professional controls, interactive movie previews, and a state-of-the-art dark theme.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue?logo=tailwindcss)
![Video.js](https://img.shields.io/badge/Video.js%20(VLC.js)-8-orange?logo=videojs)
![Express](https://img.shields.io/badge/Express-4-green?logo=express)

---

## 🎬 Recent Player UI Refinements
The latest update focused on creating a world-class "Netflix Original" viewing experience:
- **Perfect Centering**: Refactored the playback controls into a balanced 3-column layout that stays perfectly centered on all screen sizes.
- **Premium Aesthetics**: Re-designed the Play/Pause hub with semi-transparent black glassmorphism (`backdrop-blur`) and refined borders.
- **Enhanced Spacing**: Expanded corner gaps and metadata padding to give the UI professional breathing room.
- **Dynamic Corner Alignment**: Synchronized the "Back" button and control cluster for a clean, consistent vertical grid line.
- **Custom Branding**: Replaced the default Vite favicon with a custom-generated Netflix "N" tab logo.

---

## 🛠️ Tech Stack & Architecture

### Frontend
| Technology | Role |
|---|---|
| **React 19** | Core framework for ultra-fast UI rendering |
| **Vite 7** | Modern build tool provided near-instant HMR |
| **Tailwind CSS 4** | Next-gen CSS engine using the new `@theme` variable system |
| **Video.js (VLC.js)** | High-performance media engine supporting HLS and adaptive streaming |
| **Zustand** | Global state for movie data, playback history, and hover states |

### Backend
- **Node.js + Express**: Scalable REST API serving movie data and handling playback simulations.
- **SQLite (In-progress)**: Transitioning from in-memory arrays to persistent storage for playback logs.

---

## 📂 Project Structure

```
netflix-clone/
├── public/
│   └── favicon.png            # Custom Netflix branding
├── src/
│   ├── components/
│   │   ├── FullScreenPlayer.jsx  # Refactored centered player controls
│   │   ├── VideoJSPlayer.jsx     # Pro-grade VLC.js wrapper
│   │   ├── MovieCard.jsx         # Hover-to-preview logic
│   │   └── ...
│   ├── index.css                 # Netflix design system & custom tokens
│   └── store/                    # Zustand central state management
├── server/
│   └── index.js                  # Express API with streaming logic
└── README.md                     # Documentation
```

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install && cd server && npm install && cd ..
   ```

2. **Run Everything**:
   - Start Backend: `cd server && npm start`
   - Start Frontend: `npm run dev`

---

## ⌨️ Player Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `Escape` | Exit Theater Mode |
| `M` | Mute |
| `← / →` | Skip 10s back/forward |
| `↑ / ↓` | Volume adjustment |
| `F` | Toggle Fullscreen |

---

## ✨ Features Implemented
- [x] **Cinema-Grade Controls**: Centered, balanced playback hub with smooth hover transitions.
- [x] **Glassmorphism UI**: Semi-transparent, blurred overlays for a premium feel.
- [x] **Responsive Layout**: Adapts from mobile-first to 1920px+ "Theater Mode".
- [x] **Hover Preview**: Instant Video.js initialization on movie card hover.
- [x] **Custom Branding**: Fully replaced default assets with Netflix-inspired logos.
