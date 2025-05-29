import axios from "axios";
import CurrentDate from "./CurrentDate";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Title({showIp=false}) {
  const navigate = useNavigate();

  const [heading,setHeading] = useState('RESTRO')

  const [ip, setIp] = useState("");

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        setIp(response.data.ip);
        console.log(response);
      } catch (error) {
        console.error("Error fetching IP address:", error);
      }
    };

    function extractPort(url) {
      try {
        const parsedUrl = new URL(url);
        return parsedUrl.port || null; // returns "" if no port is specified
      } catch (error) {
        console.error("Invalid URL:", error.message);
        return null;
      }
    }

    
 const getHeading = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();

   const port = extractPort(config.API_URL)

   if(port == 9001){
    setHeading("RESTRO")
   }else if(port == 9091){
    setHeading("RESTRO DEMO-SERVER")
   }else if(port == 8000){
    setHeading("RESTRO DEV")
   }else {
    setHeading("RESTRO Unknown Server");
  }

  } catch (error) {
    console.error('Failed to load API URL from config.json:', error);
    throw error; // Optionally, rethrow the error for further handling
  }
};

getHeading()
    fetchIp();
  }, []);
  
  return (
    <div className="flex flex-col gap-1 justify-center">
        <div className="text-2xl font-bold flex items-center text-green-600 dark:text-green-400 ">
      <span
        className="cursor-pointer"
        onClick={() => {
          navigate("/");
        }}
      >
        {heading}
      </span>
      <CurrentDate />
      {showIp &&  <span className="dark:text-white text-xs">
        {ip}
    </span>}
    </div>


    </div>
  );
}

export default Title;
