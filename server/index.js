const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory movie data store
const movies = [
    {
        id: 1,
        name: 'Big Buck Bunny',
        genre: 'Animation',
        year: 2008,
        rating: 'PG',
        duration: '9 min',
        description: 'A large and lovable rabbit deals with three tiny bullies, led by a flying squirrel, who are determined to squelch his happiness.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'available',
        match: 98,
    },
    {
        id: 2,
        name: 'Elephants Dream',
        genre: 'Sci-Fi',
        year: 2006,
        rating: 'PG',
        duration: '10 min',
        description: 'Two people explore a strange mechanical world, each with a different vision of what they see.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/800px-Elephants_Dream_s5_both.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        status: 'available',
        match: 95,
    },
    {
        id: 3,
        name: 'For Bigger Blazes',
        genre: 'Action',
        year: 2015,
        rating: 'PG-13',
        duration: '15 sec',
        description: 'An intense action-packed short demonstrating chromecast streaming capabilities with blazing visuals.',
        logo: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: 'available',
        match: 92,
    },
    {
        id: 4,
        name: 'For Bigger Escapes',
        genre: 'Thriller',
        year: 2015,
        rating: 'PG-13',
        duration: '15 sec',
        description: 'A thrilling escape sequence that pushes the boundaries of streaming technology and visual storytelling.',
        logo: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        status: 'available',
        match: 89,
    },
    {
        id: 5,
        name: 'For Bigger Fun',
        genre: 'Comedy',
        year: 2015,
        rating: 'G',
        duration: '1 min',
        description: 'A fun and playful short film designed to showcase the joy of high-quality streaming entertainment.',
        logo: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        status: 'available',
        match: 87,
    },
    {
        id: 6,
        name: 'For Bigger Joyrides',
        genre: 'Adventure',
        year: 2015,
        rating: 'PG',
        duration: '15 sec',
        description: 'An adventurous joyride through stunning landscapes with cutting-edge visual effects.',
        logo: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        status: 'available',
        match: 85,
    },
    {
        id: 7,
        name: 'For Bigger Meltdowns',
        genre: 'Drama',
        year: 2015,
        rating: 'PG',
        duration: '15 sec',
        description: 'A dramatic short that captures the intensity and emotion of a critical meltdown scenario.',
        logo: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        status: 'available',
        match: 83,
    },
    {
        id: 8,
        name: 'Sintel',
        genre: 'Fantasy',
        year: 2010,
        rating: 'PG-13',
        duration: '14 min',
        description: 'A lonely young woman searches for her pet dragon and encounters dangerous adversaries in a vast, fantastical world.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Sintel_poster.jpg/800px-Sintel_poster.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        status: 'available',
        match: 96,
    },
    {
        id: 9,
        name: 'Tears of Steel',
        genre: 'Sci-Fi',
        year: 2012,
        rating: 'PG-13',
        duration: '12 min',
        description: 'In an apocalyptic future, a group of warriors and scientists must take on a horde of robots to save humanity.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Tears_of_Steel_frame_no._3182.png/800px-Tears_of_Steel_frame_no._3182.png',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        status: 'available',
        match: 94,
    },
];

// Playback log
const playbackLog = [];

// Validation middleware
const validateMovieId = (req, res, next) => {
    const { movieId } = req.params;
    const id = parseInt(movieId, 10);

    if (isNaN(id) || id < 1) {
        return res.status(400).json({
            success: false,
            error: 'Invalid movie ID. Must be a positive integer.',
        });
    }

    const movie = movies.find((m) => m.id === id);
    if (!movie) {
        return res.status(404).json({
            success: false,
            error: `Movie with ID ${id} not found.`,
        });
    }

    req.movie = movie;
    next();
};

// GET /api/movies - Returns list of all movies
app.get('/api/movies', (req, res) => {
    try {
        res.json({
            success: true,
            count: movies.length,
            data: movies,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching movies.',
        });
    }
});

// GET /api/movies/:movieId - Returns a single movie by ID
app.get('/api/movies/:movieId', validateMovieId, (req, res) => {
    res.json({
        success: true,
        data: req.movie,
    });
});

// POST /api/play/:movieId - Simulates starting playback
app.post('/api/play/:movieId', validateMovieId, (req, res) => {
    const movie = req.movie;
    const logEntry = {
        movieId: movie.id,
        movieName: movie.name,
        action: 'play',
        timestamp: new Date().toISOString(),
        status: 'streaming',
    };

    playbackLog.push(logEntry);

    // Update movie status
    movie.status = 'streaming';

    console.log(`▶ Playback started: "${movie.name}" (ID: ${movie.id}) at ${logEntry.timestamp}`);

    res.json({
        success: true,
        message: `Now streaming "${movie.name}"`,
        data: {
            ...movie,
            streamStatus: 'active',
            playbackStarted: logEntry.timestamp,
        },
    });
});

// POST /api/stop/:movieId - Simulates stopping playback
app.post('/api/stop/:movieId', validateMovieId, (req, res) => {
    const movie = req.movie;
    const logEntry = {
        movieId: movie.id,
        movieName: movie.name,
        action: 'stop',
        timestamp: new Date().toISOString(),
        status: 'stopped',
    };

    playbackLog.push(logEntry);
    movie.status = 'available';

    console.log(`⏹ Playback stopped: "${movie.name}" (ID: ${movie.id}) at ${logEntry.timestamp}`);

    res.json({
        success: true,
        message: `Playback stopped for "${movie.name}"`,
        data: {
            ...movie,
            streamStatus: 'inactive',
            playbackStopped: logEntry.timestamp,
        },
    });
});

// GET /api/playback-log - Returns playback history
app.get('/api/playback-log', (req, res) => {
    res.json({
        success: true,
        count: playbackLog.length,
        data: playbackLog.slice(-50),
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found.`,
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error.',
    });
});

app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║   🎬 Netflix Clone API Server           ║
  ║   Running on http://localhost:${PORT}       ║
  ║   Endpoints:                             ║
  ║   GET  /api/movies                       ║
  ║   GET  /api/movies/:id                   ║
  ║   POST /api/play/:id                     ║
  ║   POST /api/stop/:id                     ║
  ║   GET  /api/playback-log                 ║
  ║   GET  /api/health                       ║
  ╚══════════════════════════════════════════╝
  `);
});
