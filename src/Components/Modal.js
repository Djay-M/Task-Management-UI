import React, { useState } from "react";

const getTokenFromCookie = () => {
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  return match ? match[2] : null;
};

const Modal = ({
  onClose,
  onSuccess,
  heading,
  endpoint,
  board,
  status: showStatus,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("To Do");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const token = getTokenFromCookie();
    if (!token) {
      setError("No token found");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          title,
          description,
          ...(board && { boardId: board.id }),
          ...(showStatus && {
            status,
          }),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create board");
      }

      const data = await res.json();
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 shadow-xl text-white relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">{heading}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">
              Title<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Description</label>
            <textarea
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          {showStatus && (
            <div>
              <label className="block mb-1 text-sm">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
              >
                <option value="To Do">To Do</option>
                <option value="Doing">Doing</option>
                <option value="Done">Done</option>
              </select>
            </div>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-800 py-2 rounded"
          >
            {loading ? "Creating..." : "Create Board"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
