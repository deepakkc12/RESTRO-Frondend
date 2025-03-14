import { useState, useEffect } from "react";

const useWebSocket = (url, options) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let ws = new WebSocket(url);

    ws.onopen = options.onOpen || (() => console.log("WebSocket connected!"));
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
      if (options.onMessage) options.onMessage(data);
    };
    ws.onclose = options.onClose || (() => console.log("WebSocket disconnected."));
    ws.onerror = options.onError || (() => console.error("WebSocket error."));

    setSocket(ws);

    return () => ws.close();
  }, [url]);

  return { socket, messages };
};

export default useWebSocket