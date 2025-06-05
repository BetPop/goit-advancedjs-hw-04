import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './pixabay-api';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loader = document.getElementById('loader');

let query = '';
let page = 1;
let totalHits = 0;
let lightbox;
let observerActive = true;

// Loader control
const showLoader = () => loader.classList.remove('hidden');
const hideLoader = () => loader.classList.add('hidden');

// Markup generator
const createImageCard = ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
  <div class="photo-card">
    <a href="${largeImageURL}" data-lightbox="gallery">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <div class="info-item-wrapper"><p class="info-item"><b>Likes</b></p><p class="info-item">${likes}</p></div>
      <div class="info-item-wrapper"><p class="info-item"><b>Views</b></p><p class="info-item">${views}</p></div>
      <div class="info-item-wrapper"><p class="info-item"><b>Comments</b></p><p class="info-item">${comments}</p></div>
      <div class="info-item-wrapper"><p class="info-item"><b>Downloads</b></p><p class="info-item">${downloads}</p></div>
    </div>
  </div>
`;

const renderImages = images => {
  const markup = images.map(createImageCard).join('');
  gallery.insertAdjacentHTML('beforeend', markup);

  if (!lightbox) {
    lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });
  } else {
    lightbox.refresh();
  }
};

const handleSearch = async event => {
  event.preventDefault();
  query = event.currentTarget.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.warning({ title: 'Warning', message: 'Please enter a valid search query.' });
    return;
  }

  page = 1;
  gallery.innerHTML = '';
  observer.unobserve(sentinel);

  showLoader();
  try {
    const data = await fetchImages(query, page);
    hideLoader();

    if (!data || data.hits.length === 0) {
      iziToast.warning({ title: 'No results', message: 'Sorry, there are no images matching your search query. Please try again!' });
      return;
    }

    totalHits = data.totalHits;
    iziToast.success({ title: 'Hooray!', message: `We found ${totalHits} images.` });

    renderImages(data.hits);
    observer.observe(sentinel);

    if (data.hits.length < 40) {
      iziToast.warning({ title: 'End of results', message: "You've reached the end of search results." });
    }
  } catch (error) {
    hideLoader();
    iziToast.error({ title: 'Error', message: 'Something went wrong.' });
  }
};

form.addEventListener('submit', handleSearch);

const loadMoreImages = async () => {
  if (query && page * 40 < totalHits) {
    page += 1;
    showLoader();
    try {
      const data = await fetchImages(query, page);
      hideLoader();

      renderImages(data.hits);

      if (data.hits.length < 40 || page * 40 >= totalHits) {
        iziToast.warning({ title: 'End of results', message: "You've reached the end of search results." });
        observer.unobserve(sentinel);
      }
    } catch (error) {
      hideLoader();
      iziToast.error({ title: 'Error', message: 'Failed to load more images.' });
    }
  }
};

const handleIntersection = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && observerActive) {
      loadMoreImages();
    }
  });
};

const observer = new IntersectionObserver(handleIntersection, {
  rootMargin: '200px',
});

// Create and observe sentinel
const sentinel = document.createElement('div');
sentinel.className = 'sentinel';
document.body.appendChild(sentinel);
observer.observe(sentinel);
