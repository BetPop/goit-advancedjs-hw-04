import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

iziToast.settings({
  position: 'topRight',
});

const API_KEY = '44296746-7471de79088029a055864728c';
const BASE_URL = 'https://pixabay.com/api/';

export const fetchImages = async (searchQuery, page) => {
  const url = `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=false&page=${page}&per_page=40`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    iziToast.error({ title: 'Error', message: 'Failed to fetch images' });
  }
};
