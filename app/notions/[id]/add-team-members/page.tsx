"use client";

import { useState } from "react";

const AddTeamMembersPage = ({ params }: { params: { id: string } }) => {
  const notionId = params.id;
  console.log("Notion ID:", notionId);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/search?query=${query}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/notions/${notionId}/add-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add member");
      }

      alert("Member added successfully!");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Add Team Members</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          searchUsers(e.target.value);
        }}
        className="w-full px-4 py-2 border rounded-lg"
      />

      {isLoading && <p className="mt-2 text-gray-500">Searching...</p>}

      <ul className="mt-4">
        {searchResults.map((user) => (
          <li key={user._id} className="flex justify-between items-center p-2 border-b">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={() => addMember(user._id)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddTeamMembersPage;