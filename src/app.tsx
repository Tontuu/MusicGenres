const LOG_PREFIX = "[MG]:";
const LASTFM_KEY = "78f3cc50562d6a1523e8cdbc8d0339b3";

console.count("EXTENSION LOADED");

async function waitUntil<T>(
    predicate: () => T | null | undefined,
        sourceName: string,
    interval = 100,
        timeout = 5000
): Promise<T> {
    const start = Date.now();
    let result;
    while ((result = predicate()) == null) {
        if (Date.now() - start > timeout) {
            throw new Error(`${LOG_PREFIX} ${sourceName} timeout`)
        }
        await new Promise(r => setTimeout(r, interval));
    }
    console.log(LOG_PREFIX, sourceName, "loaded");
    return result;
}


async function main() {
    try {
        await waitUntil(() => Spicetify?.showNotification, "Spicetify");
        await waitUntil(() => Spicetify.Player?.data?.item, "Audio Data")

        updateGenres();

        //Spicetify.Player.addEventListener("songchange", debounce(updateGenres, 150));

    } catch(e) {
        console.error(`${LOG_PREFIX} + Error initializing MusicGenres: `, e);
    }
}

/**
 * Ensures a controlled delay between consecutive executions of a function.
 * This prevents rapid re-invocation that could lead to instability,
 * race conditions, or unintended side effects.
 */
function debounce(fn: Function, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: any []) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay)
    }
}

/**
 * Updates all genres associated with a given track based on their ALBUM GENRES.
 * This function ensures that the track's genre data remains
 * consistent and reflects the latest available information.
 */
async function updateGenres() {
    const trackGenres = await fetchTrackGenres();

    console.log(LOG_PREFIX, trackGenres);
}

async function fetchTrackGenres() {
    const trackName = Spicetify.Player.data?.item.name;
    const artist = Spicetify.Player.data.item.artists[0].name;
    
    if (!trackName) {
        console.error(LOG_PREFIX, "Track data not found");
    }

    const path = 
        `/2.0/?method=track.search&track=${trackName}&artist=${artist}&api_key=${LASTFM_KEY}&format=json` 

    const url =  `https://corsproxy.io/?${encodeURIComponent("https://ws.audioscrobbler.com/2.0" + path)}`;
    
    const res = await fetch(url);

    const data = await res.json();

    return data;

}

export default main;
