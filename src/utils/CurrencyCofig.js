import { getRequest } from "../services/apis/requests";

// currency.js
let CurrencyVal = "RMsm";

export  const CurrecnyKey = "pstc692091/1"

// Function to initialize the currency
const initializeCurrency = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await getRequest('settings/details/');

    const { currency } = response.data;

    const storedCurrency = localStorage.getItem(CurrecnyKey);

    if (storedCurrency !== currency) {
      localStorage.setItem(CurrecnyKey, currency);
      window.location.reload(); // Reload only if the currency is different
    }

  } catch (error) {
    console.error('Failed to fetch currency:', error);
  }
};
// Call this once when your app starts
export const initCurrency = () => {
  initializeCurrency();
};

// This is what all your existing imports will use
export { CurrencyVal };