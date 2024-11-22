import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiPlus } from "react-icons/fi";
import { MdWorkspaces } from "react-icons/md";

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const navigate = useNavigate();

  // Fetch workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/workspaces", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedWorkspaces = res.data.workspaces || [];
        setWorkspaces(fetchedWorkspaces);
      } catch (err) {
        console.error("Error fetching workspaces:", err);
        setWorkspaces([]);
      }
    };

    fetchWorkspaces();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Handle workspace creation
  const handleCreateWorkspace = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/workspaces",
        { name: workspaceName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWorkspaces([...workspaces, res.data]);
      setWorkspaceName("");
      setShowModal(false);
    } catch (err) {
      console.error("Error creating workspace:", err);
    }
  };

  // Navigate to workspace page on click
  const handleOpenWorkspace = (workspaceId) => {
    navigate(`/workspace/${workspaceId}`);
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-900 min-h-screen w-full flex flex-col text-white">
      {/* Header */}
      <div className="flex justify-between items-center bg-purple-800 shadow py-4 px-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white py-2 px-4 rounded-full hover:opacity-90"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Workspaces</h2>
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 px-4 py-2 rounded-full hover:opacity-90"
            onClick={() => setShowModal(true)}
          >
            <FiPlus /> Add Workspace
          </button>
        </div>

        {/* Workspace List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-[3px] justify-items-center">
          {workspaces.length > 0 ? (
            workspaces.map((workspace) => (
              <div
                key={workspace._id} // Unique key for each workspace
                className="flex flex-col items-center justify-center bg-white text-purple-700 shadow-lg rounded-lg h-32 w-32 hover:shadow-2xl transition cursor-pointer"
                onClick={() => handleOpenWorkspace(workspace._id)}
              >
                <MdWorkspaces className="text-3xl mb-2" />
                <h3 className="text-sm font-semibold">{workspace.name}</h3>
                <p className="text-gray-500 text-xs">
                  {new Date(workspace.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-300 col-span-full text-center">
              No workspaces found. Click "Add Workspace" to create your first
              one!
            </p>
          )}
        </div>
      </div>

      {/* Modal for Creating Workspace */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white text-purple-700 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Workspace</h2>
            <input
              type="text"
              placeholder="Workspace Name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCreateWorkspace}
                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 px-4 rounded-lg hover:opacity-90"
              >
                Create
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gradient-to-r from-gray-400 to-gray-500 text-white py-2 px-4 rounded-lg hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
