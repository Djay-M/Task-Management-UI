import React, { useEffect, useState } from "react";
import { backend } from "../config/constant";
import Modal from "./Modal";
const _ = require("lodash");

const getTokenFromCookie = () => {
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  return match ? match[2] : null;
};

const BoardView = () => {
  const [boardData, setBoardData] = useState([]);
  const [selectBoard, setSelectedBoard] = useState("");
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenForTask, setIsModalOpenForTask] = useState(false);

  useEffect(() => {
    const token = getTokenFromCookie();

    const headers = {
      "Content-Type": "application/json",
      Authorization: token,
    };

    const fetchBoard = async () => {
      try {
        const boardRes = await fetch(
          `${backend.endpoint}${backend.getAllBoards}`,
          { headers }
        );
        const boardData = await boardRes.json();
        setBoardData(boardData.data || []);
        boardData?.data?.[0] && handleBoardClick(boardData.data[0]);
      } catch (err) {
        setError("Failed to fetch board data");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [isModalOpen]);

  const handleBoardClick = async (board) => {
    setSelectedBoard(board);
    const token = getTokenFromCookie();

    const headers = {
      "Content-Type": "application/json",
      Authorization: token,
    };
    const tasksRes = await fetch(
      `${backend.endpoint}${backend.getAllTasks}?boardId=${board.id}`,
      { headers }
    );
    const tasksData = await tasksRes.json();
    setColumns(_.groupBy(tasksData?.data, "status"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 p-6 border-r border-gray-700 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">kanban</h2>
          <nav className="space-y-3">
            {boardData &&
              boardData?.map((board) => {
                return (
                  <button
                    className="w-full text-left px-3 py-2 rounded bg-purple-700"
                    onClick={() => handleBoardClick(board)}
                  >
                    {board.title}
                  </button>
                );
              })}
            <button
              className="text-purple-400 hover:underline mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              + Create New Board
            </button>
          </nav>
        </div>
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className="text-gray-400 text-sm">☀️</span>
          <div className="w-10 h-5 bg-purple-700 rounded-full flex items-center p-1 cursor-pointer">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-white text-sm">🌙</span>
        </div>
      </aside>

      {/* Main board */}
      <main className="flex-1 p-6 space-y-4 overflow-x-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">{selectBoard?.title}</h1>
          <button
            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white"
            onClick={() => setIsModalOpenForTask(true)}
          >
            + Add New Task
          </button>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Column
            title="TODO"
            tasks={columns["To Do"] || []}
            color="bg-purple-500"
          />
          <Column
            title="DOING"
            tasks={columns["Doing"] || []}
            color="bg-blue-500"
          />
          <Column
            title="DONE"
            tasks={columns["Done"] || []}
            color="bg-green-500"
          />
        </div>
      </main>

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
          heading={"Create New Board"}
          endpoint={`${backend.endpoint}${backend.createBoard}`}
        />
      )}
      {isModalOpenForTask && (
        <Modal
          onClose={() => {
            setIsModalOpenForTask(false);
            handleBoardClick(selectBoard);
          }}
          onSuccess={() => {
            setIsModalOpenForTask(false);
            handleBoardClick(selectBoard);
          }}
          board={selectBoard}
          heading={`Create New Task for Board '${selectBoard?.title}'`}
          endpoint={`${backend.endpoint}${backend.createTask}`}
          status={true}
        />
      )}
    </div>
  );
};

// Column Component
const Column = ({ title, tasks, color }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`}></span>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {tasks.length > 0 ? (
      tasks.map((task, index) => (
        <div
          key={index}
          className="bg-gray-800 border border-gray-700 rounded p-4 hover:shadow-lg transition"
        >
          {task.title}
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-sm">No tasks</p>
    )}
  </div>
);

export default BoardView;
