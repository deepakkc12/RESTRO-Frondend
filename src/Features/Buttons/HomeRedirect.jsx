import { Home } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

function HomeRedirect() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/home")}
      className="flex items-center justify-center p-2 rounded-full bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition duration-300 shadow-lg"
    >
      <Home size={16} />
    </button>
  );
}

export default HomeRedirect;
