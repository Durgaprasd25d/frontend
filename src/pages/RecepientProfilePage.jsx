import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaUserAlt, FaUserPlus, FaCheck } from "react-icons/fa";

const ProfilePage = () => {
  const { username } = useParams(); // Get the username from the URL params
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState("");
  const [isFriend, setIsFriend] = useState(false); // To track if the user is already a friend
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage

        if (!token) {
          setError("User is not authenticated.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/friends/recepient-profile/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
            },
          }
        );

        setUserProfile(response.data);

        // Check if the logged-in user is friends with the profile
        const currentUser = await axios.get(
          "http://localhost:5000/api/friends/profile", // Fetch logged-in user's data to check friends
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Check if the current user's friend list contains the profile's _id
        const isAlreadyFriend = currentUser.data.friends.some(
          (friendId) => friendId.toString() === response.data._id.toString()
        );
        setIsFriend(isAlreadyFriend);
      } catch (err) {
        setError("User profile not found.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleAddFriend = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("User is not authenticated.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/friends/add-friend/${username}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setIsFriend(true); // After sending the request, mark as friend
      }
    } catch (err) {
      setError("Error occurred while sending friend request.");
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!userProfile) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaUserAlt /> {userProfile.username}'s Profile
        </h1>
        <p className="mt-4 text-gray-600">
          <strong>Email:</strong> {userProfile.email}
        </p>
        <p className="text-gray-600">
          <strong>Friends:</strong> {userProfile.friends.length} friends
        </p>
        <p className="text-gray-600">
          <strong>Account Created:</strong>{" "}
          {new Date(userProfile.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-600">
          <strong>Last Updated:</strong>{" "}
          {new Date(userProfile.updatedAt).toLocaleDateString()}
        </p>

        {/* Conditional Render for Add Friend or Friends */}
        <div className="mt-6">
          {isFriend ? (
            <button className="flex items-center gap-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              <FaCheck /> Friends
            </button>
          ) : (
            <button
              onClick={handleAddFriend}
              className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              <FaUserPlus /> Add Friend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
