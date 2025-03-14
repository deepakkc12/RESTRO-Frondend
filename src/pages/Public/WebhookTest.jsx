import React, { useState, useEffect } from "react";

const WebhookTrigger = () => {
  const [liveData, setLiveData] = useState("Waiting for updates...");

  useEffect(() => {
    
    // Create an EventSource to listen to the SSE endpoint
    const eventSource = new EventSource("http://127.0.0.1:8000/api/sse/");

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveData(data.message);
    };

    // Handle errors
    eventSource.onerror = () => {
      setLiveData("Error connecting to server. Retrying...");
      eventSource.close();
    };

    // Clean up when the component is unmounted
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Live Data Updates</h1>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "5px",
          display: "inline-block",
          minWidth: "200px",
        }}
      >
        {liveData}
      </div>
    </div>
  );
};

export default WebhookTrigger;
