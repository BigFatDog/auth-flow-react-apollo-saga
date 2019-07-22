import axios from 'axios';

const post = (path, params) =>
  axios.post(window.location.origin + path, params);

const get = path => axios.get(window.location.origin + path);

export { post, get };
