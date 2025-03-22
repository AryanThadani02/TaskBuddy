import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, setTasks } from "../redux/taskSlice";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { signOutUser } from "../firebase/firebaseConfig";
import { clearUser } from "../redux/userSlice";
import { RootState } from "../redux/store";
import { FaSignOutAlt, FaListUl, FaThLarge } from "react-icons/fa";
import AddTaskModal from "./AddTaskModal";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchTasks(user.uid) as any);
    } else {
      dispatch(setTasks([]));
    }
  }, [user?.uid, dispatch]);

  const handleLogout = () => {
    signOutUser();
    dispatch(clearUser());
    navigate("/");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setDueDateFilter("");
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* First Row */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">📋 TaskBuddy</h1>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-gray-700 font-medium">{user?.displayName}</span>
          <img
            src={user?.photoURL ?? ""}
            alt="Profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
          />
        </div>
      </div>

      {/* Navigation and Logout (Second Row - Desktop Only) */}
      <div className="hidden sm:flex justify-between items-center mt-4">
        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/home/tasks"
            className={`flex items-center gap-2 ${
              location.pathname === '/home/tasks'
                ? 'text-purple-600'
                : 'text-gray-600'
            }`}
          >
            <FaListUl /> List
          </Link>
          <Link
            to="/home/board"
            className={`flex items-center gap-2 ${
              location.pathname === '/home/board'
                ? 'text-purple-600'
                : 'text-gray-600'
            }`}
          >
            <FaThLarge /> Board
          </Link>
        </div>

        {/* Logout Button (Desktop Only) */}
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Logout Button (Mobile Only) */}
      <div className="sm:hidden mt-4">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-lg hover:bg-red-600 text-sm flex items-center justify-end gap-2"
        >
          <FaSignOutAlt className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Add Task Button for Mobile */}
      <div className="sm:hidden mt-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          + Add Task
        </button>
      </div>

      {/* Filter Section */}
      <div className="mt-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        {/* Category and Date Filters */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm whitespace-nowrap">Filter by:</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="w-28 sm:flex-none px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm"
              onChange={(e) => setCategoryFilter(e.target.value)}
              value={categoryFilter}
            >
              <option value="">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
            </select>
            <div className="relative w-28">
              <input
                type="date"
                className="w-full sm:flex-none px-3 pl-8 py-2 rounded-lg bg-white border border-gray-300 text-sm appearance-none"
                onChange={(e) => setDueDateFilter(e.target.value)}
                value={dueDateFilter}
                placeholder="Filter by Date"
              />
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                📅
              </span>
            </div>
            {(categoryFilter || dueDateFilter) && (
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 text-sm whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search and Add Task (Desktop) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search tasks..."
            className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Render Task or Board View */}
      <div className="mt-6">
        <Outlet context={{ searchQuery, categoryFilter, dueDateFilter }} />
      </div>

      {/* Task Modal */}
      {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}