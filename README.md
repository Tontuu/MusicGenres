# 🎵 MusicGenres (Spicetify Extension)

MusicGenres is a Spicetify extension that displays music genres (tags) for the currently playing track using the Last.fm API.

It enhances your Spotify experience by dynamically fetching and showing genre information in real time.

---

## ⚙️ Features

- Fetches genre tags for the currently playing track
- Uses Last.fm API for reliable music metadata
- Built with TypeScript
- Custom backend server for API handling

---

## 🔑 Environment Variables

Create a `.env` file inside `/server`:
```.env
LASTFM_API_KEY=your_api_key_here
```

You can get your API key from Last.fm.

---

## 🚀 Installation

### 1. Install dependencies

```bash
npm install
node server/server.js

# (Optional) Use PM2 (recommended)

# To keep the server running in the background:

npm install -g pm2
pm2 start server/server.js --name musicgenres-api
```

### 2. Add to Spicetify

Copy the built extension to your Spicetify extensions folder and enable it:

```bash
cd dist
spicetify config extensions musicgenres.js
spicetify apply
```

---

# 🔄 How It Works
- The extension detects the currently playing track in Spotify
- It sends a request to your local server
- The server queries the Last.fm API
- The top tags (genres) are returned and displayed in the client

---

# 🧠 Notes
- Make sure the server is running before using the extension
- Ensure your .env file is properly configured
- PM2 is recommended for a persistent background server

---

# 📌 Future Improvements
- Caching results to reduce API calls
- UI customization options
