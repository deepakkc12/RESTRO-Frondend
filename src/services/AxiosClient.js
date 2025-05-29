import axios from 'axios';
import { getApiUrl, loadApiConfig } from './config';
import { USER_SESSION_KEY } from '../utils/constants';
import toast from 'react-hot-toast';

const TOAST_SHOW_KEY = "ihgdjgve"
export const token_key = "lkjhgfdtyjmnv"

const TOKEN = localStorage.getItem(token_key)

// Create the axios instance in an async function
const createAxiosClient = async () => {
  await loadApiConfig(); // Ensure config is loaded
  return axios.create({
    baseURL: getApiUrl(),
    withCredentials: true,
    headers: {
      Authorization: TOKEN ? `Bearer ${TOKEN}` : "",
    },
  });
};

const initializeAxiosClient = async () => {
  const axiosClient = await createAxiosClient();

  axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(token_key);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add a response interceptor to handle unauthorized responses
  axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      // FIX: Use error.response instead of undefined 'response'
      console.log("error response.............................", error.response);

      // Add safety check for error.response
      if (!error.response) {
        console.error("Network error or no response:", error.message);
        return Promise.reject(error);
      }

      const { status } = error.response;

      if (status === 401) {
        const show_expired_toast = localStorage.getItem(TOAST_SHOW_KEY);

        if (!show_expired_toast) {
          toast.error(error.response.data?.message || "Session expired", {
            duration: 2000,
            position: 'top-center',
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px',
            },
            icon: '❌',
          });
        }

        localStorage.setItem(TOAST_SHOW_KEY, true);

        // Clear local storage
        window.localStorage.removeItem(USER_SESSION_KEY);
        window.localStorage.removeItem(token_key); // FIX: Use token_key instead of token

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/';
          localStorage.removeItem(TOAST_SHOW_KEY);
        }, 2000);
      }

      if (status === 403) {
        toast.error(error.response.data?.message || "Access forbidden", {
          duration: 1000,
          position: 'top-center',
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px',
          },
          icon: '❌',
        });
      }

      return Promise.reject(error);
    }
  );

  return axiosClient;
};

export default initializeAxiosClient;