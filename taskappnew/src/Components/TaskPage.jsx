// TaskPage.jsx - Professional Design with Theme Support
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  X, 
  ClipboardList, 
  User, 
  Calendar, 
  Moon, 
  Sun,
  AlertCircle,
  RefreshCw,
  Eye
} from "lucide-react";

const TaskPage = () => {
  const [tasksCount, setTasksCount] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({ task: "", assignedTo: "", deadline: "" });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');

    const handleStorageChange = () => {
      const newTheme = localStorage.getItem('theme');
      setDarkMode(newTheme === 'dark');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const userTasks = async () => {
    try {
      const res = await axios.get("http://localhost:7800/api/task/gta", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasksCount(res.data);
      setFilteredTasks(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:7800/api/users/getAll", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:7800/api/task/createUser",
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Task created successfully!");
      setShowModal(false);
      setFormData({ task: "", assignedTo: "", deadline: "" });
      userTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("❌ Failed to create task");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = tasksCount.filter((task) =>
      task.name.toLowerCase().includes(value)
    );
    setFilteredTasks(filtered);
  };

  useEffect(() => {
    fetchUsers();
    userTasks();
  }, [token]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className={`w-12 h-12 animate-spin ${darkMode ? 'text-purple-400' : 'text-teal-600'}`} />
          <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Loading tasks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-xl shadow-2xl border-b ${
        darkMode 
          ? 'bg-slate-900/95 border-purple-500/30' 
          : 'bg-white/95 border-teal-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            {/* Title */}
            <h1 className={`text-3xl md:text-4xl font-bold flex items-center gap-3 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <div className={`p-2 rounded-xl shadow-lg ${
                darkMode 
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
                  : 'bg-gradient-to-br from-teal-500 to-cyan-500'
              }`}>
                <ClipboardList size={28} className="text-white" />
              </div>
              <span>
                <span className={darkMode ? 'text-purple-400' : 'text-teal-600'}>Task</span>
                <span className={darkMode ? 'text-pink-400' : 'text-cyan-600'}> Board</span>
              </span>
            </h1>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2 ${
                  darkMode
                    ? "bg-slate-800/70 text-white hover:bg-slate-700 border border-purple-500/30"
                    : "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className="hidden sm:inline">
                  {darkMode ? "Light" : "Dark"}
                </span>
              </button>
              
              <button
                onClick={() => setShowModal(true)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                }`}
              >
                <Plus size={20} /> 
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} size={18} />
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search tasks..."
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl shadow-lg focus:outline-none focus:ring-2 transition ${
                  darkMode 
                    ? 'bg-slate-800/70 border-purple-400/50 text-white focus:ring-purple-500 placeholder-gray-500' 
                    : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500 placeholder-gray-400'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Cards Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredTasks.length === 0 ? (
          <div className={`p-16 text-center rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
            darkMode 
              ? 'bg-slate-800/50 border-purple-500/30' 
              : 'bg-white/90 border-teal-200'
          }`}>
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-purple-400' : 'text-teal-600'
            }`} />
            <p className={`text-xl font-semibold ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No tasks found
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTasks.map((task) => (
              <div
                key={task._id || task.userId || task.name}
                className={`rounded-2xl shadow-2xl backdrop-blur-xl border-2 transition-all hover:scale-105 overflow-hidden ${
                  darkMode 
                    ? 'bg-slate-800/50 border-purple-500/30' 
                    : 'bg-white/95 border-teal-200'
                }`}
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg ring-2 ${
                      darkMode 
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 ring-purple-400/50' 
                        : 'bg-gradient-to-br from-teal-500 to-cyan-500 ring-teal-300'
                    }`}>
                      {task.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`font-bold text-lg truncate ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {task.name}
                      </h2>
                      <p className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Team Member
                      </p>
                    </div>
                  </div>

                  {/* Task Count Badge */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                      darkMode 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-teal-100 text-teal-700 border border-teal-200'
                    }`}>
                      <ClipboardList size={16} className="mr-2" />
                      {task.totalTasks} {task.totalTasks === 1 ? 'Task' : 'Tasks'}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/showTasks/${task.userId}`)}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 ${
                      darkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                        : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                    }`}
                  >
                    <Eye size={18} />
                    View Tasks
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md relative backdrop-blur-xl border-2 ${
            darkMode 
              ? 'bg-slate-800/95 border-purple-500/30' 
              : 'bg-white/95 border-teal-200'
          }`}>
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 p-1 rounded-lg transition-all hover:scale-110 ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X size={20} />
            </button>

            <div className={`p-6 border-b-2 ${darkMode ? 'border-purple-500/30' : 'border-teal-200'}`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Assign New Task
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Task Name */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Task Name
                </label>
                <div className="relative">
                  <ClipboardList className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="task"
                    value={formData.task}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter task description"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                      darkMode 
                        ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500 placeholder-gray-500' 
                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Assign To */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Assign To
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleFormChange}
                    required
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                      darkMode 
                        ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                    }`}
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Deadline
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleFormChange}
                    required
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                      darkMode 
                        ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all ${
                    darkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                  }`}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPage;