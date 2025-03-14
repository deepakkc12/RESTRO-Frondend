import axios from "axios";
import CurrentDate from "./CurrentDate";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Title({showIp=false}) {
  const navigate = useNavigate();

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
        RESTRO
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
