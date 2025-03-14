import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";
import { DarkModeProvider } from "./contexts/DarkModeContext";

function App() {
  
  const location = useLocation();

  useEffect(() => {

    const mainContent = document.querySelector('main > div');
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <>
    <DarkModeProvider>
      <AppRoutes />
    </DarkModeProvider>
    </>
  );
}

export default App;