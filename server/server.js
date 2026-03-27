require("dotenv").config();
const cors = require("cors");
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const LASTFM_KEY = process.env.LASTFM_KEY;

app.get("/health", (req, res) => {
    res.json({message: "Server is healthy!"});
    console.log("[INFO] Server is healthy!");
})

app.get("/genre", async (req, res) => {
    const { artist, track } = req.query;

    if (!artist || !track) {
        return res.status(400).json({
            error: "artist and track are required!!!"
        });
    }

    try {
        const trackResponse = await axios.get("http://ws.audioscrobbler.com/2.0/", {
            params: {
                method: "track.getInfo",
                api_key: LASTFM_KEY,
                artist,
                track,
                format: "json"
            }
        });

        let tags = trackResponse.data?.track?.toptags?.tag;

        if (!tags || tags.length === 0) {
            const artistResponse = await axios.get("http://ws.audioscrobbler.com/2.0/", {
                params: {
                    method: "artist.getTopTags",
                    api_key: LASTFM_KEY,
                    artist,
                    format: "json"
                }
            });

            tags = artistResponse.data?.toptags?.tag;
        }
        if (!tags || tags.length === 0) {
            return res.status(404).json({ genres: []});
        }

        const genres = filterTags(tags, artist)

        if (!artist || !track || genres.length === 0 || genres === null) {
            return res.status(404).json({ artist, track, genres});
        }

        console.log(`[INFO]: Found genres for ${track} from ${artist}`);

        return res.json({
            artist,
            track,
            genres
        });
    } catch(error) {
        return res.status(500).json({
            error: "failed to fetch data from LAST.FM",
            details: error.message
        });
    }
});

function filterTags(tags, artistName) {
    // Removes songs with the same artist name genre
    let normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const artistNormalized = normalize(artistName);


    let genres = tags
        .map(tag => capitalizeWords(tag.name))
        .filter(genre => !normalize(genre).includes(artistNormalized));


    // Filters generic genres
    normalize = (str) => (str ?? '').toLowerCase().trim()
    genres = genres.filter((genre) => {
        const current = normalize(genre);

        return !genres.some((other) => {
            const compare = normalize(other)

            return (
                compare !== current && // Do not compare with itself
                compare.includes(current) // other is specific
            );
        });
    });

    return genres;
}

function capitalizeWords(text) {
    return text.split(/[\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

app.listen(process.env.PORT || 3000, () => {
    console.log(`[INFO] Server running on http://localhost:${PORT}`);
})
