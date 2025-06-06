import { fetchImages } from './js/pixabay-api';
import {
  renderImages,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMore,
  hideLoadMore
} from './js/render-functions';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.getElementById('search-form');
const loadMoreBtn = document.getElementById('load-more');

let query = '';
let page = 1;
let totalHits = 0;
let loadedImages = 0;

form.addEventListener('submit', async event => {
  event.preventDefault();
  query = event.currentTarget.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.warning({ title: 'Warning', message: 'Please enter a valid search query.' });
    return;
  }

  page = 1;
  loadedImages = 0;
  clearGallery();
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

    if (loadedImages < totalHits) {
      showLoadMore();
    } else {
      iziToast.info({ title: 'End', message: "You've reached the end of search results." });
    }

  } catch (error) {
    hideLoader();
    iziToast.error({ title: 'Error', message: 'Something went wrong.' });
  }
});

loadMoreBtn.addEventListener('click', async () => {
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
});
