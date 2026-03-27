const LOG_PREFIX = "[MG]:";

async function main() {
    while (!Spicetify?.Player) {
        console.error(`${LOG_PREFIX} Player not available, retrying...`);
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log(LOG_PREFIX, "Spicetify loaded")

    document.head.appendChild(await trackGenresCSS());

    if (!(await isServerUp())) {
        console.error(`${LOG_PREFIX} Server is not available`);
        return;
    }
    console.log(LOG_PREFIX, "Server loaded")

    retryUpdateGenres();

    Spicetify.Player.addEventListener("songchange", () => {
        updateGenres();
    });
}

async function retryUpdateGenres(maxRetries = 10, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const success = updateGenres();
            if (success) return;
        } catch (err) {
            console.error(LOG_PREFIX, "Error on updateGenres:", err);
        }

        await new Promise(r => setTimeout(r, delay));
    }
    console.warn(LOG_PREFIX, "Failed to inject genres after retries:");
}

async function isServerUp() {
    try {
        await fetch("http://localhost:3000/health");
        return true;
    } catch(e) {
        return false;
    }
}

function waitForElement(selector) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

async function updateGenres() {
    console.log(LOG_PREFIX, "Function: updateGenres()");

    removeExistingGenreElement();

    while (!Spicetify.Player.data?.item) {
        console.log(LOG_PREFIX, "Track not loaded, retrying...")
        await new Promise(r =>  setTimeout(r, 1000));
    }
    console.log(LOG_PREFIX, "Track loaded");

    const genreContainer = await createGenreElements();

    if (genreContainer) {
        console.log(LOG_PREFIX, "Created genres and added them!");
    }
}

function removeExistingGenreElement() {
    const genreElement = document.querySelector(".main-trackInfo-lastfm-genres")
    if (genreElement) {
        console.log(LOG_PREFIX, "Already exists!");
        genreElement.remove();
    }
}

async function createGenreElements() {
    const infoContainer = await waitForElement(".main-trackInfo-container");
    console.log(LOG_PREFIX, "Found Track Info Container");

    genreContainer = document.createElement("div");
    genreContainer.className = "main-trackInfo-lastfm-genres"
    genreWrapper = document.createElement("div");
    genreWrapper.className = "genre-wrapper"

    let trackGenres = await fetchTrackGenres();

    console.log(LOG_PREFIX, "Received genres: ", trackGenres);

    if (!trackGenres) {
        console.warn(LOG_PREFIX, "Could not find genres for current song");
        trackGenres = ["Found no genres..."];
    }
    
    const content =  trackGenres.map((g, i) => 
                                     `<span class="genre">${g}</span>${i < trackGenres.length - 1 
                                         ?  '<span id="separator">&nbsp;-&nbsp</span>' 
                                         : ''}`).join('');



    genreWrapper.innerHTML = content;

    genreContainer.appendChild(genreWrapper);
    infoContainer.appendChild(genreContainer);

    requestGenresAnimation(genreContainer, genreWrapper, content);

    return genreContainer;
}

async function fetchTrackGenres() {
    console.log(LOG_PREFIX, "Fetching genres");
    const trackName = Spicetify.Player.data?.item.name;
    const artist = Spicetify.Player.data.item.artists[0].name;
    
    if (!trackName || !artist) {
        console.error(LOG_PREFIX, "Track or artist data not found.");
    }

    const uriTrack = encodeURIComponent(trackName);
    const uriArtist = encodeURIComponent(artist);

    // Calls last fm web server running on server directory
    const response = await fetch(
        `http://localhost:3000/genre?artist=${uriArtist}&track=${uriTrack}`
    );

    const data = await response.json();

    return data.genres;
}

function requestGenresAnimation(container, wrapper, content) {
    const overflow = wrapper.scrollWidth - container.clientWidth;
    const needScroll = wrapper.scrollWidth > container.clientWidth;

    if (overflow > 0) {
        wrapper.style.setProperty("--scroll-distance", `-${overflow}px`);
    } else {
        wrapper.style.animation = "none";
    }
}

async function trackGenresCSS() {
    while (!Spicetify?.Player?.data?.item) {
        console.error(`${LOG_PREFIX} Item not available, retrying...`);
        await new Promise(r => setTimeout(r, 1000));
    }

    const trackGenresStyle = document.createElement("style");

    trackGenresStyle.innerHTML = `
    .main-trackInfo-container {
        display: flex;
        flex-direction: column;
        gap: 0.05rem;
    }

    .main-trackInfo-lastfm-genres span {
        color: var(--text-subdued);
        font-size: 0.8rem;
    }

    .main-trackInfo-lastfm-genres .genre-wrapper {
        animation: scrollGenres 7s ease-in-out infinite alternate;
        aniamtion-delay: 5s;
    }

    .main-trackInfo-lastfm-genres {
        white-space: nowrap;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        min-height: 20px;
        width: 100%;
        background-color: transparent;
    }

    @keyframes scrollGenres {
        from {
            transform: translateX(1%);
        }
        to {
            transform: translateX(calc(var(--scroll-distance) - 3%));
        }
    }`;


    return trackGenresStyle;
}


export default main;
