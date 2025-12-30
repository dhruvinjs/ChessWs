import axios from 'axios';

const user_base_url = import.meta.env.VITE_USER_BASE_URL;
const game_base_url = import.meta.env.VITE_GAME_BASE_URL;

export const userApi = axios.create({
  baseURL: user_base_url,
  withCredentials: true,
});

export const gamesApi = axios.create({
  baseURL: game_base_url,
  withCredentials: true,
});

export const roomApi = axios.create({
  baseURL: `${user_base_url}/room`,
  withCredentials: true,
});
