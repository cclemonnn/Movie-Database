import API_KEY from "./secrets.js";

// API URLs
const POPULAR_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&include_adult=false`;
const LATEST_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&include_adult=false`;
const TOP_RATED_URL = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&include_adult=false`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&include_adult=false&query=`;

// Main Elements
const form = document.getElementById("form");
const search = document.getElementById("search");
const main = document.getElementById("main");
const searchText = document.querySelector(".search-text");
const homeBtn = document.querySelector(".home");

// Showing Option Elements
const popularBtn = document.querySelector(".popular");
const latestBtn = document.querySelector(".latest");
const topRatedBtn = document.querySelector(".top-rated");
const showingTypeBtns = document.querySelector(".showing-type-btns");

// Page Elements
const prevBtns = document.querySelectorAll(".prev");
const nextBtns = document.querySelectorAll(".next");
const currentPageText = document.querySelectorAll(".current-page");
const totalPageText = document.querySelectorAll(".total-page");

// Trailer Elements
const TRAILIER_API = "https://api.themoviedb.org/3/movie/";
const closeTrailerBtn = document.querySelector(".closebtn");
const overlayContent = document.getElementById("overlay-content");
const prevTrailerBtn = document.querySelector(".prev-trailer");
const nextTrailerBtn = document.querySelector(".next-trailer");
const currentTrailerText = document.querySelector(".current-trailer");
const totalTrailerText = document.querySelector(".total-trailer");

// Watchlist Elements
const listContainer = document.querySelector(".watchlist-container");

// Alert Elements
const greenAlert = document.querySelector(".green-alert");
const redAlert = document.querySelector(".red-alert");

// Page Variables
let currentURL = POPULAR_URL;
let currentPage = 1;
let totalPage = 15;

// Trailer Variables
let trailers = [];
let currentTrailerPage = 1;
let totalTrailerPage = 1;

// Selected Showing Type (popular, latest, top rated)
let selectedShowing = [true, false, false];

// Watchlist Variable
let watchlist;
let start = true;

// Get Movies
getWatchlist();
getMovies(POPULAR_URL, 1);

async function getMovies(url, page) {
  let fullURL = url;
  try {
    if (page) {
      fullURL = fullURL + "&page=" + page;
    }

    const res = await fetch(fullURL);
    if (!res.ok) {
      console.log("status: " + res.status);
      throw Error;
    }

    const data = await res.json();
    if (data.total_pages > 0) {
      console.log(data);
      if (data.total_pages > 15) {
        totalPage = 15;
      } else {
        totalPage = data.total_pages;
      }
      setTotalPage();
      checkBtns();
      showMovies(data.results);
    } else {
      // need style
      totalPage = 1;
      setTotalPage();
      checkBtns();
      main.innerText = "No Results";
    }
  } catch (error) {
    console.error(error);
  }
}

// Show Movies
function showMovies(movies) {
  main.innerHTML = "";

  movies.forEach((movie) => {
    const { title, poster_path, vote_average, overview, id } = movie;

    if (poster_path !== null) {
      const movieEl = document.createElement("div");
      movieEl.classList.add("movie");

      movieEl.innerHTML = `
        <img src="${IMG_PATH + poster_path}" alt="${title}" />
        <div class="movie-info">
          <h3>${title}</h3>
          <div class="rating-container">
            <span class="${getClassByRate(
              vote_average
            )}">${vote_average.toFixed(1)}</span>
              <i id="t${id}" class="fa-brands fa-youtube">
              </i>
              <div class="youtube-text">Watch Trailer</div>
              <i id="s${id}" class="fa-regular fa-star"></i>
          </div>
        </div>
        <div class="overview">
          <h3>Overview</h3>
          ${overview}
        </div>
    `;
      main.appendChild(movieEl);
      // youtube icon opens trailer onclick
      document.getElementById("t" + id).addEventListener("click", () => {
        openTrailer(movie);
      });
      // star icon
      const star = document.getElementById("s" + id);
      checkStar(id, star);

      star.addEventListener("click", () => {
        // check if star is selected
        let selected = star.classList.contains("fa-solid");
        if (watchlist.length < 5 || selected) {
          toggleList(title, id);
          toggleStar(id, star, title);
          deleteItemXmark(id, title);
        } else {
          showRedAlert();
        }
      });
    }
  });

  // start up function
  if (start) {
    watchlist.forEach((item) => {
      createList(item.id, item.title);
      deleteItemXmark(item.id, item.title);
    });
    // make start up function to call once only
    start = false;
  }
}

// Rating Color
function getClassByRate(rate) {
  if (rate < 5) {
    return "red";
  } else if (rate < 7) {
    return "orange";
  } else {
    return "green";
  }
}

// Search Function
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = search.value;

  if (searchTerm && searchTerm !== "") {
    currentURL = SEARCH_API + searchTerm;
    resetCurrentPage();
    hideShowingTypes();
    showHomeBtn();
    getMovies(currentURL);
    window.scrollTo({ top: 0, behavior: "instant" });

    searchText.innerHTML = `Search Results: <span class="search-value">${searchTerm}</span>`;
    search.value = "";
  } else {
    getMovies(currentURL, currentPage);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
});

// Next Page Btns
nextBtns.forEach((btn) => {
  btn.addEventListener("click", showNextPage);
});

function showNextPage() {
  if (currentPage < totalPage) {
    incrementPage();
    getMovies(currentURL, currentPage);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

// Prev Page Btns
prevBtns.forEach((btn) => {
  btn.addEventListener("click", showPrevPage);
});

function showPrevPage() {
  if (currentPage > 1) {
    decrementPage();
    getMovies(currentURL, currentPage);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

// Page inc + dec + reset + set total
function incrementPage() {
  currentPage++;
  currentPageText.forEach((page) => {
    page.innerText = currentPage;
  });
}
function decrementPage() {
  currentPage--;
  currentPageText.forEach((page) => {
    page.innerText = currentPage;
  });
}
function resetCurrentPage() {
  currentPage = 1;
  currentPageText.forEach((page) => {
    page.innerText = 1;
  });
}
function setTotalPage() {
  totalPageText.forEach((page) => {
    page.innerText = totalPage;
  });
}

// Disable and Enable Page Btns
function checkBtns() {
  // next btns
  if (currentPage === totalPage) {
    nextBtns.forEach((btn) => {
      btn.disabled = true;
    });
  } else {
    nextBtns.forEach((btn) => {
      btn.disabled = false;
    });
  }
  // prev btns
  if (currentPage === 1) {
    prevBtns.forEach((btn) => {
      btn.disabled = true;
    });
  } else {
    prevBtns.forEach((btn) => {
      btn.disabled = false;
    });
  }
}

// Open and Close Trailer Overlay
closeTrailerBtn.addEventListener("click", closeTrailer);

function openTrailer(movie) {
  document.getElementById("trailer-overlay").style.width = "100%";
  console.log(movie);
  getTrailer(movie);
}
function closeTrailer() {
  document.getElementById("trailer-overlay").style.width = "0%";
  removeTrailer();
}

// Get Trailer
async function getTrailer(movie) {
  trailers = []; // reset trailers
  resetTrailerPage();
  const { id } = movie;
  const url =
    TRAILIER_API + id + "/videos?api_key=" + API_KEY + "&language=en-US";

  // fetch trailers
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log("status: " + res.status);
      throw Error;
    }
    const data = await res.json();
    const results = data.results;
    console.log(results);

    results.forEach((result) => {
      const { key, name, official, site, type } = result;
      if (official && site === "YouTube" && type === "Trailer") {
        // save trailers
        trailers.push(
          `<iframe width="640" height="385" src="https://www.youtube.com/embed/${key}" title="${name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
        );
      }
    });
    if (trailers.length > 0) {
      totalTrailerPage = trailers.length;
      setTotalTrailerPage();
      showTrailer(1);
    } else {
      // if no trailer
      totalTrailerPage = 1;
      setTotalTrailerPage();
      checkTrailerBtns();
      overlayContent.innerText = "No Trailer Provided";
    }
  } catch (error) {
    console.error(error);
  }
}

// Show and Remove Trailer
function showTrailer(page) {
  overlayContent.innerHTML = trailers[page - 1];
  checkTrailerBtns();
}
function removeTrailer() {
  overlayContent.innerHTML = "";
}

// Next and Prev Trailer Page Btn
nextTrailerBtn.addEventListener("click", () => {
  incrementTrailerPage();
  showTrailer(currentTrailerPage);
});
prevTrailerBtn.addEventListener("click", () => {
  decrementTrailerPage();
  showTrailer(currentTrailerPage);
});

// Trailer Page inc + dec + reset + set total
function incrementTrailerPage() {
  currentTrailerPage++;
  currentTrailerText.innerText = currentTrailerPage;
}
function decrementTrailerPage() {
  currentTrailerPage--;
  currentTrailerText.innerText = currentTrailerPage;
}
function resetTrailerPage() {
  currentTrailerPage = 1;
  currentTrailerText.innerText = 1;
}
function setTotalTrailerPage() {
  totalTrailerText.innerText = totalTrailerPage;
}

// Disable and Enable Trailer Page Btns
function checkTrailerBtns() {
  // next btn
  if (currentTrailerPage === totalTrailerPage) {
    nextTrailerBtn.disabled = true;
  } else {
    nextTrailerBtn.disabled = false;
  }
  // prev btn
  if (currentTrailerPage === 1) {
    prevTrailerBtn.disabled = true;
  } else {
    prevTrailerBtn.disabled = false;
  }
}

// Showing Options
popularBtn.addEventListener("click", () => {
  if (!selectedShowing[0]) {
    selectedShowing = [true, false, false];
    markSelectedType();
    resetCurrentPage();
    getMovies(POPULAR_URL, currentPage);
  }
});
latestBtn.addEventListener("click", () => {
  if (!selectedShowing[1]) {
    selectedShowing = [false, true, false];
    markSelectedType();
    resetCurrentPage();
    getMovies(LATEST_URL, currentPage);
  }
});
topRatedBtn.addEventListener("click", () => {
  if (!selectedShowing[2]) {
    selectedShowing = [false, false, true];
    markSelectedType();
    resetCurrentPage();
    getMovies(TOP_RATED_URL, currentPage);
  }
});

// Mark Selected Showing Type
function markSelectedType() {
  if (selectedShowing[0]) {
    popularBtn.classList.add("selected");
    latestBtn.classList.remove("selected");
    topRatedBtn.classList.remove("selected");
  } else if (selectedShowing[1]) {
    popularBtn.classList.remove("selected");
    latestBtn.classList.add("selected");
    topRatedBtn.classList.remove("selected");
  } else if (selectedShowing[2]) {
    popularBtn.classList.remove("selected");
    latestBtn.classList.remove("selected");
    topRatedBtn.classList.add("selected");
  }
}

// Hide Showing Types
function hideShowingTypes() {
  showingTypeBtns.style.display = "none";
}

// Home Btn
homeBtn.addEventListener("click", () => {
  location.reload();
  window.scrollTo({ top: 0, behavior: "instant" });
});

// Show Home Btn
function showHomeBtn() {
  homeBtn.style.display = "block";
}

// Check Star
function checkStar(id, star) {
  // check if in watchlist
  const inList = checkItemInList(id);

  if (inList) {
    star.classList.replace("fa-regular", "fa-solid");
  }
}

// Toggle Star
function toggleStar(id, star, title) {
  // check if in watchlist
  const inList = checkItemInList(id);

  // add to list if not in list
  if (!inList) {
    star.classList.replace("fa-regular", "fa-solid");
    addToList(id, title);
    showGreenAlert(title, "add");
  } else {
    star.classList.replace("fa-solid", "fa-regular");
    removeFromList(id);
    showGreenAlert(title, "remove");
  }
}

// Add and Remove item
function addToList(id, title) {
  watchlist.push({ id, title });
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}
function removeFromList(id) {
  watchlist = watchlist.filter((item) => item.id !== id);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

// Toggle Movie in Watchlist
function toggleList(title, id) {
  // check if in watchlist
  const inList = checkItemInList(id);

  // show list if not in list
  if (!inList) {
    const newItem = document.createElement("div");
    newItem.classList.add("watchlist-item");
    newItem.innerHTML = `${title}
        <i id="${id}" class="fa-solid fa-rectangle-xmark"></i>`;

    listContainer.appendChild(newItem);
  } else {
    // remove movie from list
    const movie = document.getElementById(id);
    movie.parentElement.remove();
  }
}

// Start Up Create Watchlist
function createList(id, title) {
  const newItem = document.createElement("div");
  newItem.classList.add("watchlist-item");
  newItem.innerHTML = `${title}
        <i id="${id}" class="fa-solid fa-rectangle-xmark"></i>`;
  listContainer.appendChild(newItem);
}

// Update List Xmarks
function deleteItemXmark(id, title) {
  const item = document.getElementById(id);

  if (item) {
    item.addEventListener("click", () => {
      item.parentElement.remove();
      removeFromList(id);
      removeStarOnPage(id);
      showGreenAlert(title, "remove");
    });
  }
}

// Remove Star
function removeStarOnPage(id) {
  const star = document.getElementById("s" + id);
  if (star) {
    star.classList.replace("fa-solid", "fa-regular");
  }
}

// Show Green Alert
function showGreenAlert(title, type) {
  if (type === "add") {
    greenAlert.innerHTML = `<span class="movie-title">${title}</span><span class="added"> Added</span> to Watchlist`;
    greenAlert.classList.add("show");
  } else if (type === "remove") {
    greenAlert.innerHTML = `<span class="movie-title">${title}</span><span class="removed"> Removed</span> from Watchlist`;
    greenAlert.classList.add("show");
  }

  setTimeout(() => {
    greenAlert.classList.remove("show");
  }, 2000);
}

// Show Red Alert
function showRedAlert() {
  redAlert.classList.add("show");

  setTimeout(() => {
    redAlert.classList.remove("show");
  }, 2000);
}

// Get Watchlist from Local Storage
function getWatchlist() {
  if (localStorage.getItem("watchlist") === null) {
    watchlist = [];
  } else {
    watchlist = JSON.parse(localStorage.getItem("watchlist"));
  }
}

// Check if Item in Watchlist
function checkItemInList(id) {
  let inList = false;
  watchlist.forEach((item) => {
    if (item.id === id) {
      inList = true;
    }
  });
  return inList;
}
