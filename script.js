import API_KEY from "./secrets.js";

// API URLs
// const API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&page=1`;
const API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&&include_adult=false`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&include_adult=false&query=`;

// Elements
const form = document.getElementById("form");
const search = document.getElementById("search");
const main = document.getElementById("main");
const searchText = document.getElementsByClassName("search-text");

// Page Elements
const prev1 = document.getElementById("prev1");
const prev2 = document.getElementById("prev2");
const next = document.querySelectorAll(".next");
const currentPageText = document.querySelectorAll(".current-page");
const totalPageText = document.querySelectorAll(".total-page");

// Current URL
let currentURL = API_URL;
let currentPage = 1;
let totalPage = 15;

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
      showMovies(data.results);
    } else {
      // need style
      totalPage = 1;
      setTotalPage();
      main.innerText = "no results";
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
    const { title, poster_path, vote_average, overview } = movie;

    if (poster_path !== null) {
      const movieEl = document.createElement("div");
      movieEl.classList.add("movie");

      movieEl.innerHTML = `
        <img src="${IMG_PATH + poster_path}" alt="${title}" />
        <div class="movie-info">
          <h3>${title}</h3>
          <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(
        1
      )}</span>
        </div>
        <div class="overview">
          <h3>Overview</h3>
          ${overview}
        </div>
    `;

      main.appendChild(movieEl);
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

// Next Page Btn
next.forEach((nextBtn) => {
  nextBtn.addEventListener("click", showNextPage);
});

function showNextPage() {
  if (currentPage < totalPage) {
    console.log(currentPage);
    incrementPage();
  }
  if (currentPage <= totalPage) {
    getMovies(currentURL, currentPage);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

// Page inc + dec + reset
function incrementPage() {
  currentPage++;
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

// Set Total Page
function setTotalPage() {
  totalPageText.forEach((page) => {
    page.innerText = totalPage;
  });
}
