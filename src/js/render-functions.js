import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './pixabay-api';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loader = document.getElementById('loader');
const loadMoreBtn = document.getElementById('load-more');

let query = '';
let page = 1;
let totalHits = 0;
let loadedImages = 0;
let lightbox = null;

// UI Controls
const showLoader = () => loader.classList.remove('hidden');
const hideLoader = () => loader.classList.add('hidden');
const showLoadMore = () => loadMoreBtn.classList.remove('hidden');
const hideLoadMore = () => loadMoreBtn.classList.add('hidden');

// Card HTML
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

  // Smooth scroll
  const card = document.querySelector('.gallery .photo-card');
  if (card) {
    const { height: cardHeight } = card.getBoundingClientRect();
    window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
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
  loadedImages = 0;
  gallery.innerHTML = '';
  hideLoadMore();
  showLoader();

  try {
    const data = await fetchImages(query, page);
    hideLoader();

    if (!data || data.hits.length === 0) {
      iziToast.warning({ title: 'No results', message: 'No images found. Try another query.' });
      return;
    }

    totalHits = data.totalHits;
    loadedImages += data.hits.length;

    iziToast.success({ title: 'Success', message: `We found ${totalHits} images.` });

    renderImages(data.hits);
    if (loadedImages < totalHits) showLoadMore();
    else iziToast.info({ title: 'End', message: "You've reached the end of search results." });

  } catch (error) {
    hideLoader();
    iziToast.error({ title: 'Error', message: 'Something went wrong.' });
  }
};

const loadMoreImages = async () => {
  page += 1;
  showLoader();
  hideLoadMore();

  try {
    const data = await fetchImages(query, page);
    hideLoader();

    if (!data || data.hits.length === 0) {
      iziToast.info({ title: 'End', message: "You've reached the end of search results." });
      return;
    }

    loadedImages += data.hits.length;
    renderImages(data.hits);

    if (loadedImages >= totalHits) {
      iziToast.info({ title: 'End', message: "You've reached the end of search results." });
    } else {
      showLoadMore();
    }

  } catch (error) {
    hideLoader();
    iziToast.error({ title: 'Error', message: 'Failed to load more images.' });
  }
};

form.addEventListener('submit', handleSearch);
loadMoreBtn.addEventListener('click', loadMoreImages);
