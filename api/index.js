const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// In-memory initial data for the database
const initialMovies = [
    {
        id: 1,
        name: 'Avatar: The Way of Water',
        genre: 'Sci-Fi',
        year: 2022,
        rating: 'PG-13',
        duration: '3h 12m',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
        logo: 'https://images.alphacoders.com/128/1288827.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        status: 'available',
        match: 99,
    },
    {
        id: 21,
        name: 'Spider-Man: Across the Spider-Verse',
        genre: 'Animation',
        year: 2023,
        rating: 'PG',
        duration: '2h 20m',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        logo: 'https://images.alphacoders.com/131/1316089.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'available',
        match: 98,
    },
    {
        id: 2,
        name: 'Stranger Things',
        genre: 'Sci-Fi',
        year: 2016,
        rating: 'TV-14',
        duration: '4 Seasons',
        description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/595/1489169.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        status: 'available',
        match: 95,
    },
    {
        id: 3,
        name: 'Breaking Bad',
        genre: 'Drama',
        year: 2008,
        rating: 'TV-MA',
        duration: '5 Seasons',
        description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: 'available',
        match: 99,
    },
    {
        id: 4,
        name: 'Chernobyl',
        genre: 'Drama',
        year: 2019,
        rating: 'TV-MA',
        duration: '1 Season',
        description: 'In April 1986, an explosion at the Chernobyl nuclear power plant in the Union of Soviet Socialist Republics becomes one of the world\'s worst man-made catastrophes.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/193/482599.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        status: 'available',
        match: 92,
    },
    {
        id: 5,
        name: 'Game of Thrones',
        genre: 'Fantasy',
        year: 2011,
        rating: 'TV-MA',
        duration: '8 Seasons',
        description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/498/1245274.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        status: 'available',
        match: 97,
    },
    {
        id: 6,
        name: 'The Mandalorian',
        genre: 'Sci-Fi',
        year: 2019,
        rating: 'TV-14',
        duration: '3 Seasons',
        description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/501/1253498.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        status: 'available',
        match: 94,
    },
    {
        id: 7,
        name: 'Peaky Blinders',
        genre: 'Drama',
        year: 2013,
        rating: 'TV-MA',
        duration: '6 Seasons',
        description: 'A gangster family epic set in 1900s England, centering on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/48/122213.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        status: 'available',
        match: 91,
    },
    {
        id: 8,
        name: 'Narcos',
        genre: 'Crime',
        year: 2015,
        rating: 'TV-MA',
        duration: '3 Seasons',
        description: 'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar, as well as the many other drug kingpins who plagued the country through the years.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/498/1246087.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        status: 'available',
        match: 96,
    },
    {
        id: 9,
        name: 'Sherlock',
        genre: 'Mystery',
        year: 2010,
        rating: 'TV-14',
        duration: '4 Seasons',
        description: 'A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/171/428042.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        status: 'available',
        match: 98,
    },
    {
        id: 10,
        name: 'The Witcher',
        genre: 'Fantasy',
        year: 2019,
        rating: 'TV-MA',
        duration: '3 Seasons',
        description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/594/1486674.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'available',
        match: 93,
    },
    {
        id: 11,
        name: 'Wednesday',
        genre: 'Comedy',
        year: 2022,
        rating: 'TV-14',
        duration: '1 Season',
        description: 'Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree while navigating new relationships at Nevermore Academy.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/586/1466410.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        status: 'available',
        match: 96,
    },
    {
        id: 12,
        name: 'Squid Game',
        genre: 'Thriller',
        year: 2021,
        rating: 'TV-MA',
        duration: '2 Seasons',
        description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games for a tempting prize, but the stakes are deadly.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: 'available',
        match: 97,
    },
    {
        id: 13,
        name: 'The Last of Us',
        genre: 'Drama',
        year: 2023,
        rating: 'TV-MA',
        duration: '2 Seasons',
        description: 'Joel and Ellie, a pair connected through the harshness of the world they live in, must survive ruthless killers and monsters across a post-pandemic America.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/563/1409008.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        status: 'available',
        match: 98,
    },
    {
        id: 14,
        name: 'House of the Dragon',
        genre: 'Fantasy',
        year: 2022,
        rating: 'TV-MA',
        duration: '2 Seasons',
        description: 'The story of the Targaryen civil war that took place about 200 years before the events portrayed in Game of Thrones.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/530/1325279.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        status: 'available',
        match: 94,
    },
    {
        id: 15,
        name: 'Dark',
        genre: 'Sci-Fi',
        year: 2017,
        rating: 'TV-MA',
        duration: '3 Seasons',
        description: 'A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes relationships among four families.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/504/1262352.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        status: 'available',
        match: 95,
    },
    {
        id: 16,
        name: 'Money Heist',
        genre: 'Crime',
        year: 2017,
        rating: 'TV-MA',
        duration: '5 Seasons',
        description: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history — stealing 2.4 billion euros from the Royal Mint of Spain.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/430/1076004.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        status: 'available',
        match: 93,
    },
    {
        id: 17,
        name: 'The Crown',
        genre: 'Drama',
        year: 2016,
        rating: 'TV-MA',
        duration: '6 Seasons',
        description: 'This drama follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the twentieth century.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/480/1201097.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        status: 'available',
        match: 91,
    },
    {
        id: 18,
        name: 'Arcane',
        genre: 'Animation',
        year: 2021,
        rating: 'TV-14',
        duration: '2 Seasons',
        description: 'Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League of Legends champions.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/536/1340287.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        status: 'available',
        match: 96,
    },
    {
        id: 19,
        name: 'The Matrix',
        genre: 'Sci-Fi',
        year: 1999,
        rating: 'R',
        duration: '2h 16m',
        description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/220/550275.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        status: 'available',
        match: 98,
    },
    {
        id: 20,
        name: 'Inception',
        genre: 'Sci-Fi',
        year: 2010,
        rating: 'PG-13',
        duration: '2h 28m',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/1/3603.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        status: 'available',
        match: 96,
    },

    {
        id: 22,
        name: 'The Dark Knight',
        genre: 'Action',
        year: 2008,
        rating: 'PG-13',
        duration: '2h 32m',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/198/495287.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'available',
        match: 97,
    },
    {
        id: 23,
        name: 'Pulp Fiction',
        genre: 'Crime',
        year: 1994,
        rating: 'R',
        duration: '2h 34m',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/10/25672.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        status: 'available',
        match: 94,
    },
    {
        id: 24,
        name: 'Fight Club',
        genre: 'Drama',
        year: 1999,
        rating: 'R',
        duration: '2h 19m',
        description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/189/474775.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        status: 'available',
        match: 93,
    },
    {
        id: 25,
        name: 'Forrest Gump',
        genre: 'Drama',
        year: 1994,
        rating: 'PG-13',
        duration: '2h 22m',
        description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/54/136002.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        status: 'available',
        match: 92,
    },
    {
        id: 26,
        name: 'Goodfellas',
        genre: 'Crime',
        year: 1990,
        rating: 'R',
        duration: '2h 26m',
        description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/72/181604.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'available',
        match: 91,
    },
    {
        id: 27,
        name: 'The Shawshank Redemption',
        genre: 'Drama',
        year: 1994,
        rating: 'R',
        duration: '2h 22m',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/151/378415.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        status: 'available',
        match: 99,
    },
    {
        id: 28,
        name: 'The Godfather',
        genre: 'Crime',
        year: 1972,
        rating: 'R',
        duration: '2h 55m',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/162/405527.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: 'available',
        match: 99,
    },
    {
        id: 29,
        name: 'Gladiator',
        genre: 'Action',
        year: 2000,
        rating: 'R',
        duration: '2h 35m',
        description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/477/1194723.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        status: 'available',
        match: 96,
    },
    {
        id: 30,
        name: 'The Prestige',
        genre: 'Drama',
        year: 2006,
        rating: 'PG-13',
        duration: '2h 10m',
        description: 'Two stage magicians engage in competitive one-upmanship in an attempt to create the ultimate stage illusion.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/220/550275.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        status: 'available',
        match: 94,
    },
    {
        id: 31,
        name: 'Braveheart',
        genre: 'Action',
        year: 1995,
        rating: 'R',
        duration: '2h 58m',
        description: 'William Wallace begins a revolt against King Edward I of England after he suffers a personal tragedy.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/171/429457.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        status: 'available',
        match: 93,
    },
    {
        id: 32,
        name: 'Titanic',
        genre: 'Romance',
        year: 1997,
        rating: 'PG-13',
        duration: '3h 14m',
        description: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/171/428042.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        status: 'available',
        match: 95,
    },
    {
        id: 33,
        name: 'Jurassic Park',
        genre: 'Adventure',
        year: 1993,
        rating: 'PG-13',
        duration: '2h 7m',
        description: 'A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting a couple of kids after a power failure causes the park\'s cloned dinosaurs to run loose.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/189/474775.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        status: 'available',
        match: 97,
    },
    {
        id: 34,
        name: 'The Lion King',
        genre: 'Animation',
        year: 1994,
        rating: 'G',
        duration: '1h 28m',
        description: 'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/54/136002.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        status: 'available',
        match: 98,
    },
    {
        id: 35,
        name: 'Avatar',
        genre: 'Sci-Fi',
        year: 2009,
        rating: 'PG-13',
        duration: '2h 42m',
        description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/72/181604.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'available',
        match: 94,
    },
    {
        id: 36,
        name: 'Alien',
        genre: 'Horror',
        year: 1979,
        rating: 'R',
        duration: '1h 57m',
        description: 'After a space merchant vessel receives an unknown transmission as a distress call, one of the crew is attacked by a mysterious life form and its life cycle to as full development.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/151/378415.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        status: 'available',
        match: 96,
    },
    {
        id: 37,
        name: 'The Silence of the Lambs',
        genre: 'Thriller',
        year: 1991,
        rating: 'R',
        duration: '1h 58m',
        description: 'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/1/3603.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: 'available',
        match: 97,
    }
];

// Async Validation middleware
const validateMovieId = async (req, res, next) => {
    const { movieId } = req.params;
    const id = Number.parseInt(movieId, 10);

    if (Number.isNaN(id) || id < 1) {
        return res.status(400).json({
            success: false,
            error: 'Invalid movie ID. Must be a positive integer.',
        });
    }

    try {
        const movie = await db.get('SELECT * FROM movies WHERE id = ?', [id]);
        if (!movie) {
            return res.status(404).json({
                success: false,
                error: `Movie with ID ${id} not found.`,
            });
        }
        req.movie = movie;
        next();
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// GET /movies and /api/movies - Returns list of all movies
app.get(['/movies', '/api/movies'], async (req, res) => {
    try {
        // As per requirements: "returns list of movies with name, logo, id, status, and stream URL"
        // Also retaining other fields for backward compatibility with frontend
        const movies = await db.all('SELECT * FROM movies');
        res.json({
            success: true,
            count: movies.length,
            data: movies,
        });
    } catch (err) {
        console.error('Error fetching movies:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching movies.',
        });
    }
});

// GET /movies/search and /api/movies/search - Search movies by name, genre, or description
app.get(['/movies/search', '/api/movies/search'], async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }
        const searchTerm = `%${q.trim()}%`;
        const movies = await db.all(
            'SELECT * FROM movies WHERE name LIKE ? OR genre LIKE ? OR description LIKE ?',
            [searchTerm, searchTerm, searchTerm]
        );
        res.json({
            success: true,
            count: movies.length,
            data: movies,
        });
    } catch (err) {
        console.error('Error searching movies:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error while searching movies.',
        });
    }
});

// GET /movies/:movieId and /api/movies/:movieId - Returns a single movie by ID
app.get(['/movies/:movieId', '/api/movies/:movieId'], validateMovieId, (req, res) => {
    res.json({
        success: true,
        data: req.movie,
    });
});

// POST /play/:movieId and /api/play/:movieId - Simulates starting playback
app.post(['/play/:movieId', '/api/play/:movieId'], validateMovieId, async (req, res) => {
    const movie = req.movie;
    const timestamp = new Date().toISOString();

    try {
        // Log the playback
        await db.run(
            'INSERT INTO playback_log (movie_id, movie_name, action, timestamp, status) VALUES (?, ?, ?, ?, ?)',
            [movie.id, movie.name, 'play', timestamp, 'streaming']
        );

        // Update movie status
        await db.run('UPDATE movies SET status = ? WHERE id = ?', ['streaming', movie.id]);

        console.log(`▶ Playback started: "${movie.name}" (ID: ${movie.id}) at ${timestamp}`);

        // Return updated movie
        const updatedMovie = await db.get('SELECT * FROM movies WHERE id = ?', [movie.id]);

        res.json({
            success: true,
            message: `Now streaming "${updatedMovie.name}"`,
            data: {
                ...updatedMovie,
                streamStatus: 'active',
                playbackStarted: timestamp,
            },
        });
    } catch (error) {
        console.error('Playback error:', error);
        res.status(500).json({ success: false, error: 'Failed to start playback' });
    }
});

// POST /stop/:movieId and /api/stop/:movieId - Simulates stopping playback
app.post(['/stop/:movieId', '/api/stop/:movieId'], validateMovieId, async (req, res) => {
    const movie = req.movie;
    const timestamp = new Date().toISOString();

    try {
        await db.run(
            'INSERT INTO playback_log (movie_id, movie_name, action, timestamp, status) VALUES (?, ?, ?, ?, ?)',
            [movie.id, movie.name, 'stop', timestamp, 'stopped']
        );

        await db.run('UPDATE movies SET status = ? WHERE id = ?', ['available', movie.id]);

        console.log(`⏹ Playback stopped: "${movie.name}" (ID: ${movie.id}) at ${timestamp}`);

        const updatedMovie = await db.get('SELECT * FROM movies WHERE id = ?', [movie.id]);

        res.json({
            success: true,
            message: `Playback stopped for "${movie.name}"`,
            data: {
                ...updatedMovie,
                streamStatus: 'inactive',
                playbackStopped: timestamp,
            },
        });
    } catch (error) {
        console.error('Stop error:', error);
        res.status(500).json({ success: false, error: 'Failed to stop playback' });
    }
});

// GET /api/playback-log - Returns playback history
app.get('/api/playback-log', async (req, res) => {
    try {
        const logs = await db.all('SELECT * FROM playback_log ORDER BY id DESC LIMIT 50');
        res.json({
            success: true,
            count: logs.length,
            data: logs,
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
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

// Initialize database and start server
const initDbAndStartServer = async () => {
    try {
        const dbPath = process.env.NODE_ENV === 'production'
            ? ':memory:'
            : path.join(__dirname, 'database.sqlite');

        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS movies (
                id INTEGER PRIMARY KEY,
                name TEXT,
                genre TEXT,
                year INTEGER,
                rating TEXT,
                duration TEXT,
                description TEXT,
                logo TEXT,
                streamUrl TEXT,
                status TEXT DEFAULT 'available',
                match INTEGER
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS playback_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                movie_id INTEGER,
                movie_name TEXT,
                action TEXT,
                timestamp TEXT,
                status TEXT
            )
        `);

        // Check if movies are empty, if so, populate initial data
        const row = await db.get('SELECT COUNT(*) as count FROM movies');
        if (row.count === 0) {
            const stmt = await db.prepare(`
                INSERT INTO movies (id, name, genre, year, rating, duration, description, logo, streamUrl, status, match)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            for (const movie of initialMovies) {
                await stmt.run(
                    movie.id, movie.name, movie.genre, movie.year, movie.rating,
                    movie.duration, movie.description, movie.logo, movie.streamUrl,
                    movie.status, movie.match
                );
            }
            await stmt.finalize();
            console.log('Database initialized with initial movie data.');
        }

        // Only start the listening server if not running on Vercel/Serverless
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`
                Netflix Clone API Server           
                Running on http://localhost:${PORT}       
                Endpoints:                             
                GET  /movies                       
                GET  /movies/:id                   
                POST /play/:id                     
                POST /stop/:id                     
                GET  /api/playback-log                 
                GET  /api/health                       
                `);
            });
        }
    } catch (error) {
        console.error('Failed to initialize database:', error);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

// Start DB initialization
initDbAndStartServer();

// Export for Vercel
module.exports = app;
