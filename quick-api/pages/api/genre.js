export default async function handler(req, res) {
  const { artist, track } = req.query;

  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LASTFM_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`;

  const response = await fetch(url);
  const data = await response.json();

  const tags = data.track?.toptags?.tag?.map(t => t.name) || [];

  res.status(200).json({ genres: tags });
}
