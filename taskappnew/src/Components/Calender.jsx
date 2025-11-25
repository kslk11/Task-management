// Calendar.jsx - Same functionality, Beautiful Tailwind
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewMonthGrid } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";

import { 
  X, 
  ClipboardList, 
  User, 
  Calendar as CalendarIcon, 
  Plus,
  Moon,
  Sun,
  Info
} from "lucide-react";

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    task: "",
    assignedTo: "",
    deadline: "",
  });

  const token = localStorage.getItem("token");
  const eventsService = useState(() => createEventsServicePlugin())[0];

  // Theme sync
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

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:7800/api/task/assignedbyme", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data || []);
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:7800/api/task/newTask",
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Task created successfully!");
      setShowModal(false);
      setFormData({ task: "", assignedTo: "", deadline: "" });
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  const calendar = useCalendarApp({
    views: [createViewMonthGrid()],
    plugins: [eventsService],
    callbacks: {
      onClickDate(date, e) {
        console.log("Clicked date:", date.toString());
        setShowModal(true);
        setFormData((prev) => ({ ...prev, deadline: date.toString() }));
      },
      onClickEvent(event) {
        setSelectedEvent(event);
        setShowPopup(true);
      },
    },
  });

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchUsers();
    }
  }, [token]);

  useEffect(() => {
    if (tasks.length > 0) {
      tasks.forEach((task, i) => {
        try {
          const startDate = Temporal.Instant.from(task.assignedDate)
            .toZonedDateTimeISO("UTC")
            .toPlainDate();
          const endDate = Temporal.Instant.from(task.assignedDate)
            .toZonedDateTimeISO("UTC")
            .toPlainDate();
          eventsService.add({
            id: `task-${i}`,
            title: `${task.task} – ${task.status || "Pending"}`,
            start: startDate,
            end: endDate,
            description: task.description || "No description provided",
          });
        } catch (err) {
          console.error("Error parsing task dates:", err, task);
        }
      });
    }
  }, [tasks, eventsService]);

  return (
    <div className={`min-h-screen p-6 transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
    }`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className={`text-3xl md:text-4xl font-bold flex items-center gap-3 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <div className={`p-2 rounded-xl shadow-lg ${
              darkMode 
                ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
                : 'bg-gradient-to-br from-teal-500 to-cyan-500'
            }`}>
              <CalendarIcon size={28} className="text-white" />
            </div>
            <span>
              <span className={darkMode ? 'text-purple-400' : 'text-teal-600'}>Task</span>
              <span className={darkMode ? 'text-pink-400' : 'text-cyan-600'}> Calendar</span>
            </span>
          </h1>

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
              <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"}</span>
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

        {/* Info Banner */}
        <div className={`mt-4 p-4 rounded-xl border-2 flex items-start gap-3 ${
          darkMode 
            ? 'bg-purple-500/10 border-purple-500/30' 
            : 'bg-teal-50 border-teal-200'
        }`}>
          <Info className={darkMode ? 'text-purple-400' : 'text-teal-600'} size={20} />
          <div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Click on any date to create a new task
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Click on existing events to view details
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="max-w-7xl mx-auto">
        <div className={`rounded-2xl shadow-2xl backdrop-blur-xl border-2 p-6 min-h-[600px] ${
          darkMode 
            ? 'bg-slate-800/50 border-purple-500/30' 
            : 'bg-white/95 border-teal-200'
        }`}>
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      </div>

      {/* Event Details Popup */}
      {showPopup && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md relative backdrop-blur-xl border-2 ${
            darkMode 
              ? 'bg-slate-800/95 border-purple-500/30' 
              : 'bg-white/95 border-teal-200'
          }`}>
            <button
              onClick={() => setShowPopup(false)}
              className={`absolute top-4 right-4 p-1 rounded-lg transition-all hover:scale-110 ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X size={20} />
            </button>

            <div className={`p-6 border-b-2 ${darkMode ? 'border-purple-500/30' : 'border-teal-200'}`}>
              <h2 className={`text-2xl font-bold pr-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedEvent.title}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-xl border-2 ${
                darkMode 
                  ? 'bg-slate-700/30 border-purple-400/30' 
                  : 'bg-teal-50 border-teal-200'
              }`}>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Date Range
                </p>
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedEvent.start.toString()} → {selectedEvent.end.toString()}
                </p>
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                darkMode 
                  ? 'bg-slate-700/30 border-purple-400/30' 
                  : 'bg-cyan-50 border-cyan-200'
              }`}>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Details
                </p>
                <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedEvent.description || "No details available"}
                </p>
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Deadline
                </label>
                <div className="relative">
                  <CalendarIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
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

export default Calendar;