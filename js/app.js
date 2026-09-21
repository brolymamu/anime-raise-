const defaultAnime = [
    {
        id: 1,
        title: "Dragon Ball",
        image: "https://uploads.onecompiler.io/44p8gabek/1783937038267/Dragon%20Ball%20Z.jpg",
        year: 2026,
        rating: 9.2,
        episodes: 0,
        genres: ["Action", "Fantasy"],
        description: "A young warrior discovers an ancient power hidden inside him and begins a journey across a mysterious world."
    }
];

const ANIME_DATA_VERSION = "dragon-ball-fresh-episodes";
const EPISODE_DATA_VERSION = "fresh-episodes";

function getUsers() {
    return JSON.parse(localStorage.getItem("aniverseUsers") || "[]");
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("aniverseUser") || "null");
}

function requireUser() {
    if (!getCurrentUser()) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function userStorageKey(name) {
    const user = getCurrentUser();
    return user ? "aniverse_" + name + "_" + user.email : null;
}

function getUserList(name) {
    const key = userStorageKey(name);
    return key ? JSON.parse(localStorage.getItem(key) || "[]") : [];
}

function saveUserList(name, list) {
    const key = userStorageKey(name);
    if (key) {
        localStorage.setItem(key, JSON.stringify(list));
    }
}

function getProgress() {
    const key = userStorageKey("progress");
    return key ? JSON.parse(localStorage.getItem(key) || "{}") : {};
}

function saveProgress(animeId, episode) {
    const key = userStorageKey("progress");
    if (!key) return;
    const progress = getProgress();
    progress[animeId] = { episode: episode, updated: Date.now() };
    localStorage.setItem(key, JSON.stringify(progress));
}

function getProfile() {
    const user = getCurrentUser();
    if (!user) return null;
    return JSON.parse(localStorage.getItem("aniverse_profile_" + user.email) || "{}");
}

function saveProfile(profile) {
    const user = getCurrentUser();
    if (user) {
        localStorage.setItem("aniverse_profile_" + user.email, JSON.stringify(profile));
    }
}

function loadAccountLink() {
    const accountLink = document.getElementById("accountLink");
    const currentUser = getCurrentUser();
    if (!accountLink) return;

    if (currentUser) {
        accountLink.textContent = "Profile";
        accountLink.href = "profile.html";
        accountLink.onclick = null;
    } else {
        accountLink.textContent = "Login";
        accountLink.href = "login.html";
        accountLink.onclick = null;
    }
}

function getAnime() {
    const saved = localStorage.getItem("aniverseAnime");
    const savedVersion = localStorage.getItem("aniverseAnimeVersion");

    if (saved && savedVersion === ANIME_DATA_VERSION) {
        return JSON.parse(saved);
    }

    localStorage.setItem("aniverseAnime", JSON.stringify(defaultAnime));
    localStorage.setItem("aniverseAnimeVersion", ANIME_DATA_VERSION);

    return defaultAnime;
}

function saveAnime(data) {
    localStorage.setItem(
        "aniverseAnime",
        JSON.stringify(data)
    );
}


/* ==============================
   ANIME CARD
============================== */

function animeCard(anime) {
    return `
        <div class="anime-card"
             onclick="location.href='anime.html?id=${anime.id}'">

            <div class="poster">

                <img
                    src="${anime.image}"
                    alt="${anime.title}"
                >

                <div class="play">▶</div>

            </div>

            <div class="card-title">
                ${anime.title}
            </div>

            <div class="card-meta">
                HD • ${anime.episodes} EP • ⭐ ${anime.rating}
            </div>

        </div>
    `;
}


/* ==============================
   HOME
============================== */

function loadHome() {

    const trending = document.getElementById("trendingGrid");
    const latest = document.getElementById("latestGrid");
    const popular = document.getElementById("popularGrid");

    if (!trending) {
        return;
    }

        const data = getAnime();
    const continueGrid = document.getElementById("continueGrid");
    const continueSection = document.getElementById("continueSection");

    if (continueGrid) {
        const progress = getProgress();
        const continueAnime = data.filter(function(anime) {
            return progress[anime.id];
        }).sort(function(a, b) {
            return progress[b.id].updated - progress[a.id].updated;
        });
        if (continueAnime.length && continueSection) {
            continueSection.style.display = "block";
        }
        continueGrid.innerHTML = continueAnime.length
            ? continueAnime.map(animeCard).join("")
            : "";
    }

    loadAccountLink();

    const params = new URLSearchParams(
        window.location.search
    );

    const genre = params.get("genre");
    const search = params.get("search");

    let display = data;

    if (genre) {
        display = data.filter(function(anime) {
            return anime.genres.includes(genre);
        });
    }

    if (search) {
        const searchText = search.toLowerCase();

        display = data.filter(function(anime) {

            return (
                anime.title.toLowerCase().includes(searchText) ||
                anime.genres.some(function(g) {
                    return g.toLowerCase().includes(searchText);
                })
            );

        });
    }

    trending.innerHTML = display
        .slice(0, 6)
        .map(animeCard)
        .join("");

    latest.innerHTML = display
        .slice(2, 8)
        .map(animeCard)
        .join("");

    popular.innerHTML = [...display]
        .sort(function(a, b) {
            return b.rating - a.rating;
        })
        .slice(0, 6)
        .map(animeCard)
        .join("");
}


/* ==============================
   ANIME DETAILS
============================== */

function loadAnimeDetails() {

    const container =
        document.getElementById("animeDetail");

    if (!container) {
        return;
    }

    const params =
        new URLSearchParams(window.location.search);

    const id =
        Number(params.get("id"));

    const anime =
        getAnime().find(function(a) {
            return a.id === id;
        });

    if (!anime) {

        container.innerHTML = `
            <div class="section">
                <h1>Anime not found</h1>
                <br>
                <a class="btn primary" href="index.html">
                    ← Back Home
                </a>
            </div>
        `;

        return;
    }

        const episodes = getEpisodesForAnime(anime.id);
    const episodeHTML = episodes.length
        ? episodes.map(function(episode) {
            return `
                <div class="episode-row">
                    <span>Episode ${episode.number}${episode.title ? `: ${episode.title}` : ""}</span>
                    <a href="watch.html?id=${anime.id}&ep=${episode.number}">
                        Watch
                    </a>
                </div>
            `;
        }).join("")
        : `<p style="color:#777">No episodes uploaded yet.</p>`;

    container.innerHTML = `

        <div class="detail-box">

            <img
                class="detail-poster"
                src="${anime.image}"
                alt="${anime.title}"
            >

            <div class="detail-info">

                <h1>${anime.title}</h1>

                <div class="meta">

                    <span>HD</span>
                    <span>${anime.year}</span>
                    <span>⭐ ${anime.rating}</span>
                    <span>${anime.episodes} Episodes</span>

                </div>

                <p>
                    ${anime.description}
                </p>

                <div>
                    ${anime.genres.map(function(genre) {
                        return `
                            <span class="genre-tag">
                                ${genre}
                            </span>
                        `;
                    }).join("")}
                </div>

                <br>

                <button
                    class="btn primary"
                    onclick="addToWatchlist(${anime.id})"
                >
                    ♡ Add to Watchlist
                </button>

                <a
                    class="btn secondary"
                    href="watch.html?id=${anime.id}&ep=1"
                >
                    ▶ Watch Now
                </a>

            </div>

        </div>

        <div class="episode-list">

            <h2>Episodes</h2>

            ${episodeHTML}

        </div>

    `;
}


/* ==============================
   WATCHLIST
============================== */

function addToWatchlist(id) {

    if (!requireUser()) return;

    let list = getUserList("watchlist");

    if (!list.includes(id)) {

        list.push(id);

                saveUserList("watchlist", list);

        alert("Added to watchlist!");

    } else {

        alert("Already in your watchlist.");

    }
}


function loadWatchlist() {

    const grid =
        document.getElementById("watchlistGrid");

    if (!grid) {
        return;
    }

        if (!requireUser()) return;

    const list = getUserList("watchlist");

    const data = getAnime();

    const result = data.filter(function(anime) {
        return list.includes(anime.id);
    });

    if (result.length === 0) {

        grid.innerHTML = `
            <p style="color:#777">
                Your watchlist is empty.
            </p>
        `;

        return;
    }

    grid.innerHTML =
        result.map(animeCard).join("");
}


/* ==============================
   WATCH PAGE
============================== */

let currentEpisode = 1;
let currentAnime = null;

function getEpisodesForAnime(animeId) {
    const savedVersion = localStorage.getItem("aniverseEpisodeDataVersion");

    if (savedVersion !== EPISODE_DATA_VERSION) {
        localStorage.setItem("aniverseEpisodes", "[]");
        localStorage.setItem("aniverseEpisodeDataVersion", EPISODE_DATA_VERSION);
    }

    const episodes = JSON.parse(
        localStorage.getItem("aniverseEpisodes") || "[]"
    );

    return episodes
        .filter(function(episode) {
            return episode.animeId === animeId;
        })
        .sort(function(a, b) {
            return a.number - b.number;
        });
}

function loadWatchPage() {

    const player =
        document.getElementById("videoPlayer");

    if (!player) {
        return;
    }

    const params =
        new URLSearchParams(window.location.search);

    const id =
        Number(params.get("id"));

    currentEpisode =
        Number(params.get("ep")) || 1;

    currentAnime =
        getAnime().find(function(anime) {
            return anime.id === id;
        });

    if (!currentAnime) {
        return;
    }

        document.getElementById(
        "watchTitle"
    ).textContent =
        currentAnime.title;

    const uploadedEpisodes = getEpisodesForAnime(currentAnime.id);

    if (uploadedEpisodes.length === 0) {
        document.getElementById("watchEpisode").textContent = "No episodes uploaded yet.";
        document.getElementById("episodeList").innerHTML = "";
        return;
    }

    if (!uploadedEpisodes.some(function(episode) {
        return episode.number === currentEpisode;
    })) {
        currentEpisode = uploadedEpisodes[0].number;
    }

    updateEpisode();
    createEpisodeButtons();
}


function updateEpisode() {

    const player =
        document.getElementById("videoPlayer");

    const episodeText =
        document.getElementById("watchEpisode");

    if (!player || !currentAnime) {
        return;
    }

    episodeText.textContent =
        "Episode " + currentEpisode;

        const episode = getEpisodesForAnime(currentAnime.id).find(function(item) {
        return item.number === currentEpisode;
    });

    if (!episode || !episode.video) {
        player.removeAttribute("src");
        player.load();
        return;
    }

    player.src = episode.video;
    player.load();
    saveProgress(currentAnime.id, currentEpisode);

    const buttons =
        document.querySelectorAll(
            "#episodeList button"
        );

    buttons.forEach(function(button, index) {

        if (index + 1 === currentEpisode) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }

    });
}


function createEpisodeButtons() {

    const list =
        document.getElementById("episodeList");

    if (!list || !currentAnime) {
        return;
    }

        list.innerHTML = "";

    getEpisodesForAnime(currentAnime.id).forEach(function(episode) {
        const button = document.createElement("button");

        button.textContent = "EP " + episode.number;

        if (episode.number === currentEpisode) {
            button.classList.add("active");
        }

        button.onclick = function() {
            currentEpisode = episode.number;
            updateEpisode();
            createEpisodeButtons();
        };

        list.appendChild(button);
    });
}


function nextEpisode() {

    if (!currentAnime) {
        return;
    }

    if (
        currentEpisode <
        currentAnime.episodes
    ) {

        currentEpisode++;

        updateEpisode();

        createEpisodeButtons();

    }

}


function previousEpisode() {

    if (currentEpisode > 1) {

        currentEpisode--;

        updateEpisode();

        createEpisodeButtons();

    }

}


/* ==============================
   SEARCH
============================== */

function searchAnime(event) {

    if (
        event &&
        event.key &&
        event.key !== "Enter"
    ) {
        return;
    }

    const input =
        document.getElementById("searchInput");

    if (!input) {
        return;
    }

    const query =
        input.value.trim();

    if (!query) {
        return;
    }

    window.location.href =
        "index.html?search=" +
        encodeURIComponent(query);
}


/* ==============================
   SIDEBAR
============================== */

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("active");
    }

}


/* ==============================
   LOGIN
============================== */

function loginUser() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");
    const users = getUsers();
    const user = users.find(function(item) {
        return item.email === email && item.password === password;
    });

    if (!user) {
        message.textContent = "Account not found or password is incorrect.";
        return;
    }

    localStorage.setItem("aniverseUser", JSON.stringify({ email: user.email }));
    message.textContent = "Login successful!";
    setTimeout(function() { window.location.href = "index.html"; }, 500);
}

function createAccount() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");
    const users = getUsers();

    if (!email || password.length < 4) {
        message.textContent = "Enter an email and a password of at least 4 characters.";
        return;
    }
    if (users.some(function(user) { return user.email === email; })) {
        message.textContent = "An account with this email already exists.";
        return;
    }

    users.push({ email: email, password: password });
    localStorage.setItem("aniverseUsers", JSON.stringify(users));
    localStorage.setItem("aniverseUser", JSON.stringify({ email: email }));
    message.textContent = "Account created successfully!";
    setTimeout(function() { window.location.href = "index.html"; }, 500);
}

function logoutUser() {
    localStorage.removeItem("aniverseUser");
    window.location.href = "index.html";
}

function loadProfile() {
    const profile = document.getElementById("profilePage");
    if (!profile || !requireUser()) return;

    const user = getCurrentUser();
    const savedProfile = getProfile();
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileName").value = savedProfile.name || "";

    if (savedProfile.avatar) {
        document.getElementById("profileAvatar").src = savedProfile.avatar;
    }
}

function previewProfileImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please choose an image file.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById("profileAvatar").src = reader.result;
        document.getElementById("profileAvatar").dataset.image = reader.result;
    };
    reader.readAsDataURL(file);
}

function saveProfileForm(event) {
    event.preventDefault();
    if (!requireUser()) return;

    const oldProfile = getProfile() || {};
    const avatar = document.getElementById("profileAvatar").dataset.image || oldProfile.avatar || "";
    saveProfile({
        name: document.getElementById("profileName").value.trim(),
        avatar: avatar
    });

    document.getElementById("profileMessage").textContent = "Profile saved successfully!";
}



/* ==============================
   ADMIN AUTHENTICATION
============================== */

// Change this demo password before sharing the site.
const ADMIN_PASSWORD = "broly@123";

function isAdminAuthenticated() {
    return sessionStorage.getItem("aniverseAdminAuthenticated") === "true";
}

function adminLogin(event) {
    event.preventDefault();

    const password = document.getElementById("adminPassword").value;
    const message = document.getElementById("adminLoginMessage");

    if (password !== ADMIN_PASSWORD) {
        message.textContent = "Incorrect admin password.";
        message.style.color = "#ff7d9f";
        return;
    }

    sessionStorage.setItem("aniverseAdminAuthenticated", "true");
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminLayout").classList.remove("admin-locked");
    loadAdmin();
}

function adminLogout() {
    sessionStorage.removeItem("aniverseAdminAuthenticated");
    window.location.reload();
}


/* ==============================
   ADMIN
============================== */

function showAdmin(section) {

    document
        .querySelectorAll(".admin-section")
        .forEach(function(item) {

            item.classList.remove("active");

        });

    const selected =
        document.getElementById(section);

    if (selected) {
        selected.classList.add("active");
    }

}


function loadAdmin() {

    if (!document.getElementById("animeCount")) {
        return;
    }

    const login = document.getElementById("adminLogin");
    const layout = document.getElementById("adminLayout");
    const authenticated = isAdminAuthenticated();

    if (!authenticated) {
        login.style.display = "flex";
        layout.classList.add("admin-locked");
        return;
    }

    login.style.display = "none";
    layout.classList.remove("admin-locked");

    const data = getAnime();

    document.getElementById(
        "animeCount"
    ).textContent = data.length;

    renderAdminAnime();

    populateEpisodeAnime();

    renderAdminEpisodes();

}


function renderAdminAnime() {

    const container =
        document.getElementById(
            "adminAnimeList"
        );

    if (!container) {
        return;
    }

    const data = getAnime();

    container.innerHTML =
        data.map(function(anime) {

            return `

                <div class="admin-item">

                    <img src="${anime.image}" alt="${anime.title}">

                    <div>

                        <strong>
                            ${anime.title}
                        </strong>

                        <p style="color:#777">
                            ${anime.episodes} Episodes
                        </p>

                    </div>

                    <button
                        class="delete-btn"
                        onclick="deleteAnime(${anime.id})"
                    >
                        Delete
                    </button>

                </div>

            `;

        }).join("");

}


function addAnime(event) {

    event.preventDefault();

    const data = getAnime();

    const newAnime = {

        id: Date.now(),

        title:
            document.getElementById(
                "newTitle"
            ).value,

        image:
            document.getElementById(
                "newImage"
            ).value,

        year:
            Number(
                document.getElementById(
                    "newYear"
                ).value
            ),

        episodes:
            Number(
                document.getElementById(
                    "newEpisodes"
                ).value
            ),

        rating:
            Number(
                document.getElementById(
                    "newRating"
                ).value
            ),

        genres:
            document.getElementById(
                "newGenres"
            ).value
            .split(",")
            .map(function(x) {
                return x.trim();
            })
            .filter(Boolean),

        description:
            document.getElementById(
                "newDescription"
            ).value

    };

    data.push(newAnime);

    saveAnime(data);

    alert(
        "Anime added successfully!"
    );

    event.target.reset();

    loadAdmin();

}


function deleteAnime(id) {

    if (!confirm("Delete this anime?")) {
        return;
    }

    const data =
        getAnime().filter(function(anime) {
            return anime.id !== id;
        });

    saveAnime(data);

    loadAdmin();

}


/* ==============================
   EPISODES ADMIN
============================== */

function populateEpisodeAnime() {

    const select =
        document.getElementById(
            "episodeAnime"
        );

    if (!select) {
        return;
    }

    select.innerHTML =
        getAnime()
        .map(function(anime) {

            return `
                <option value="${anime.id}">
                    ${anime.title}
                </option>
            `;

        })
        .join("");

}


function addEpisode(event) {

    event.preventDefault();

    const videoFile = document.getElementById("episodeVideo").files[0];

    if (!videoFile || !videoFile.type.startsWith("video/")) {
        alert("Please choose a valid video file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function() {
        const episodes = JSON.parse(
            localStorage.getItem("aniverseEpisodes") || "[]"
        );

        const episode = {
            id: Date.now(),
            animeId: Number(document.getElementById("episodeAnime").value),
            number: Number(document.getElementById("episodeNumber").value),
            title: document.getElementById("episodeTitle").value,
            video: reader.result
        };

        episodes.push(episode);
        localStorage.setItem("aniverseEpisodes", JSON.stringify(episodes));

        alert("Episode uploaded successfully!");
        event.target.reset();
        loadAdmin();
    };

    reader.onerror = function() {
        alert("The video could not be uploaded.");
    };

    reader.readAsDataURL(videoFile);

}


function renderAdminEpisodes() {

    const container =
        document.getElementById(
            "episodeAdminList"
        );

    const count =
        document.getElementById(
            "episodeCount"
        );

    if (!container) {
        return;
    }

    const episodes = JSON.parse(
        localStorage.getItem(
            "aniverseEpisodes"
        ) || "[]"
    );

    if (count) {
        count.textContent =
            episodes.length;
    }

    const anime =
        getAnime();

    if (episodes.length === 0) {

        container.innerHTML =
            `<p style="color:#777">
                No episodes added yet.
            </p>`;

        return;
    }

    container.innerHTML =
        episodes.map(function(ep) {

            const show =
                anime.find(function(a) {
                    return a.id === ep.animeId;
                });

            return `

                <div class="admin-item">

                    <div>

                        <strong>
                            ${show
                                ? show.title
                                : "Unknown Anime"}
                        </strong>

                        <p style="color:#777">
                            Episode ${ep.number}
                        </p>

                    </div>

                </div>

            `;

        }).join("");

}


/* ==============================
   START
============================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadHome();

    }
);
