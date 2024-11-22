import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [notepadText, setNotepadText] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch workspace details
    const fetchWorkspace = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/workspaces/${workspaceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWorkspace(res.data.workspace);
        setNotepadText(res.data.workspace.notepadContent || "");
      } catch (err) {
        console.error("Failed to fetch workspace:", err);
      }
    };

    fetchWorkspace();

    // Setup socket connection
    const socketInstance = io("http://localhost:5000");
    setSocket(socketInstance);

    socketInstance.emit("joinWorkspace", workspaceId);

    socketInstance.on("notepad-update", (data) => {
      setNotepadText(data.text);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [workspaceId]);

  const handleNotepadChange = (e) => {
    const text = e.target.value;
    setNotepadText(text);
    socket.emit("notepad-update", { workspaceId, text });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/workspaces/${workspaceId}/save`,
        { notepadContent: notepadText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Content saved successfully!");
    } catch (err) {
      console.error("Failed to save content:", err);
      alert("Could not save content. Please try again.");
    }
  };

  const handleStartLiveSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/workspaces/startLiveSession`,
        { workspaceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkspace(res.data.workspace); // Update workspace to reflect live status
      alert("Live session started!");
    } catch (err) {
      console.error("Failed to start live session:", err);
      alert("Could not start live session. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-500 to-teal-700 flex flex-col items-center justify-center p-6">
      {workspace ? (
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-teal-600">
              {workspace.name}
            </h1>
            <span
              className={`text-sm font-semibold px-4 py-2 rounded-full ${
                workspace.isLive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {workspace.isLive ? "Live" : "Offline"}
            </span>
          </div>

          {/* Notepad Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">
              Live Notepad
            </h2>
            <textarea
              value={notepadText}
              onChange={handleNotepadChange}
              className="w-full h-80 bg-teal-50 border-2 border-teal-300 rounded-lg p-6 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 resize-none"
              placeholder="Start typing here... (updates will reflect live)"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition"
            >
              Save
            </button>
            {!workspace.isLive && (
              <button
                onClick={handleStartLiveSession}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
              >
                Start Live Session
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-teal-700 text-lg">
          Loading workspace...
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
