import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let lightbox;
const gallery = document.querySelector('.gallery');

export const showLoader = () => document.getElementById('loader').classList.remove('hidden');
export const hideLoader = () => document.getElementById('loader').classList.add('hidden');

export const showLoadMore = () => document.getElementById('load-more').classList.remove('hidden');
export const hideLoadMore = () => document.getElementById('load-more').classList.add('hidden');

export const clearGallery = () => {
  gallery.innerHTML = '';
};

const createImageCard = ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
  <li class="photo-card">
    <a href="${largeImageURL}" data-lightbox="gallery">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <div class="info-item-wrapper"><p class="info-item"><b>Likes</b></p><p class="info-item">${likes}</p></div>
      <div class="info-item-wrapper"><p class="info-item"><b>Views</b></p><p class="info-item">${views}</p></div>
      <div class="info-item-wrapper"><p class="info-item"><b>Comments</b></p><p class="info-item">${comments}</p></div>
      <div class="info-item-wrapper"><p class="info-item"><b>Downloads</b></p><p class="info-item">${downloads}</p></div>
    </div>
  </li>
`;

export const renderImages = images => {
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
