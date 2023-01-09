import API_KEY from "./secrets.js";

// API URLs
// const API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&page=1`;
const API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&include_adult=false`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&include_adult=false&query=`;

// Elements
const form = document.getElementById("form");
const search = document.getElementById("search");
const main = document.getElementById("main");
const searchText = document.querySelector(".search-text");

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

// Variables
let currentURL = API_URL;
let currentPage = 1;
let totalPage = 15;

// Trailer Variables
let trailers = [];
let currentTrailerPage = 1;
let totalTrailerPage = 1;

// Get Movies
getMovies(API_URL, 1);

async function getMovies(url, page, sort) {
  let fullURL = url;
  try {
    if (page) {
      fullURL = fullURL + "&page=" + page;
    }

    if (sort) {
      fullURL = fullURL + "&sort_by=" + sort;
    }

    const res = await fetch(fullURL);
    if (!res.ok) {
      console.log("status: " + res.status);
      throw Error;
    }

    const data = await res.json();
    if (data.total_pages > 0) {
      console.log(data.results);
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

  const container = document.createElement("div");

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
              <i id="${id}" class="fa-brands fa-youtube">
              </i>
              <div class="youtube-text">Watch Trailer</div>
          </div>
        </div>
        <div class="overview">
          <h3>Overview</h3>
          ${overview}
        </div>
    `;
      main.appendChild(movieEl);
      // youtube icon opens trailer onclick
      document.getElementById(id).addEventListener("click", () => {
        openTrailer(movie);
      });
    }
  });
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
    resetPage();
    getMovies(currentURL);

    searchText.innerText = `Search Results: ${searchTerm}`;
    search.value = "";
  } else {
    getMovies(currentURL, currentPage);
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
function resetPage() {
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
      resetTrailerPage();
      showTrailer(0);
    } else {
      // if no trailer
      totalTrailerPage = 1;
      setTotalTrailerPage();
      resetTrailerPage();
      checkTrailerBtns();
      overlayContent.innerText = "No Trailer Provided";
    }
  } catch (error) {
    console.error(error);
  }
}

// Show and Remove Trailer
function showTrailer(page) {
  console.log(trailers[0]);
  overlayContent.innerHTML = trailers[page];
  checkTrailerBtns();
}
function removeTrailer() {
  overlayContent.innerHTML = "";
}

// Next and Prev Trailer Page Btn
nextTrailerBtn.addEventListener("click", () => {
  incrementTrailerPage();
  showTrailer(currentTrailerPage - 1);
});
prevTrailerBtn.addEventListener("click", () => {
  decrementTrailerPage();
  showTrailer(currentTrailerPage - 1);
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
