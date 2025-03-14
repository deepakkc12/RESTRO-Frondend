import React, { useState } from "react";
import { useToast } from "../../hooks/UseToast";
// import useWebSocket from "../../hooks/UseWesockt";

const WebSocketPage = () => {

  const toast = useToast();

  const [branchCode, setBranchCode] = useState(""); // State to hold branch code

  const [url, setUrl] = useState(null); // WebSocket URL, initially null

  // const { messages } = useWebSocket(url, {
  //   onOpen: () => toast.success("Connected"),
  //   onClose: () => toast.error("Disconnected"),
  //   onError: () => toast.error("Error occurred"),
  //   onMessage: (data) => {
  //     if (data.action == "trigger") {
  //       toast.success("Printer Triggered event received!");
  //     }
  //   },
  // });

  const handleConnect = () => {
    if (branchCode.trim()) {
      // const wsUrl = ``;
      //     "API_URL": "http://103.12.1.191:9001/api/"

      // const wsUrl = `ws://103.12.1.191:9091/ws/printer/?token=1234567890qwertyuiop&branch=${branchCode}`;

      // setUrl(wsUrl);
      toast.success(`Connecting to branch ${branchCode}`);
    } else {
      toast.error("Please enter a valid branch code.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 rounded shadow-md">
      <h1 className="text-xl font-bold mb-4">WebSocket Alerts</h1>

      {/* Input and Connect Button */}
      <div className="mb-4">
        <label htmlFor="branchCode" className="block text-sm font-medium text-gray-700 mb-2">
          Enter Branch Code:
        </label>
        <div className="flex">
          <input
            id="branchCode"
            type="text"
            value={branchCode}
            onChange={(e) => setBranchCode(e.target.value)}
            placeholder="Branch Code"
            className="flex-grow border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            onClick={handleConnect}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none"
          >
            Connect
          </button>
        </div>
      </div>

      {/* Triggered Events Section */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Triggered Events:</h2>
        <div className="bg-white border p-2 rounded max-h-96 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className="p-2 border-b last:border-b-0">
                {msg.data}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events triggered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSocketPage;
