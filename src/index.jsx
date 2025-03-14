import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';

import Store from "./redux/store.js";
import { ToastProvider } from "./hooks/UseToast.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={Store}>
    <BrowserRouter>
    <ToastProvider defaultPosition="top-center">
    <App />
    </ToastProvider>
    </BrowserRouter>
    </Provider>
  </StrictMode>
);
