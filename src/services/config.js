let apiUrl = '';

export const loadApiConfig = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    apiUrl = config.API_URL;
    return apiUrl; // Return the API URL
  } catch (error) {
    console.error('Failed to load API URL from config.json:', error);
    throw error; // Optionally, rethrow the error for further handling
  }
};

export const getBaseUrl = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    apiUrl = config.API_URL;
    return apiUrl; // Return the API URL
  } catch (error) {
    console.error('Failed to load API URL from config.json:', error);
    throw error; // Optionally, rethrow the error for further handling
  }
};

export const getApiUrl = () => apiUrl;