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
    
    // params: {
    //   token:TOKEN,
    // },



    // Optional headers
    // headers: { 
    //   'Cookie': 'sessionid=zpbtoxxuxytuha6ydo7qj3t3yzc0pexg',
    // },
    // xsrfCookieName: 'csrftoken',
    // xsrfHeaderName: 'X-CSRFToken',
  });
};

// console.log(` headers: {Authorization: TOKEN ? Bearer ${TOKEN}}`)

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
        // console.log("response.............................")

      const { status } = error.response;
    //   console.log(`response.............................${status}`)

    if (status === 401) {
      // console.log(error)

      const show_expired_toast = localStorage.getItem(TOAST_SHOW_KEY)

      if(!show_expired_toast){
        toast.error(error.response.data.message, {
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
      // Show error toast with custom styling matching your toast configuration
      localStorage.setItem(TOAST_SHOW_KEY,true)

      // Clear local storage
      window.localStorage.removeItem(USER_SESSION_KEY);
      window.localStorage.removeItem(token);



      // localStorage.removeItem('pos_current_order');
      // localStorage.removeItem('pos_current_payments');
      // localStorage.removeItem('pos_counter_status');
      // localStorage.removeItem('pos_payment_success');

      // Redirect after a short delay to ensure the message is seen
      setTimeout(() => {
      window.location.href = '/';
      localStorage.removeItem(TOAST_SHOW_KEY)

      }, 2000);
    }
    if (status === 403) {
      // console.log(error)
      // const show_expired_toast = localStorage.getItem(TOAST_SHOW_KEY)

        toast.error(error.response.data.message, {
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


// Export the initialized axios client
export default initializeAxiosClient;