import axios from 'axios';

const post = (path, params) =>
  axios.post(window.location.origin + path, params);

export { post };
