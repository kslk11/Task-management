// ShowAllTasks.jsx - Professional Design with Theme Support
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Calendar,
  Check,
  Clock,
  RefreshCw
} from "lucide-react";

const ShowAllTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDates, setFilterDates] = useState({ assignedDate: "", deadline: "" });
    const [loading, setLoading] = useState(true);
    const [openSubtasks, setOpenSubtasks] = useState({});
    const [darkMode, setDarkMode] = useState(false);
    const { id } = useParams();
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

    const getAllTasks = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:7800/api/task/getOne/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = Array.isArray(res.data) ? res.data : [res.data];
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            await axios.post(
                `http://localhost:7800/api/task/updateS`,
                { taskId, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getAllTasks();
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const updateSubtaskStatus = async (subtaskId, newStatus) => {
        try {
            await axios.put(
                `http://localhost:7800/api/subtask/update/${subtaskId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getAllTasks();
        } catch (error) {
            console.error("Error updating subtask:", error);
        }
    };

    const sortByStatus = async (selectedStatus) => {
        setFilterStatus(selectedStatus);
        if (!selectedStatus) return getAllTasks();
        try {
            const res = await axios.post(
                `http://localhost:7800/api/task/sortBystatus/${id}`,
                { status: selectedStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks(res.data);
        } catch (error) {
            console.error("Error sorting by status:", error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterDates((prev) => ({ ...prev, [name]: value }));
    };

    const sortByDate = async () => {
        const { assignedDate, deadline } = filterDates;
        if (!assignedDate || !deadline) {
            alert("Please select both start and end dates");
            return;
        }
        try {
            const res = await axios.post(
                `http://localhost:7800/api/task/sortByDate/${id}`,
                { assignedDate, deadline },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks(res.data);
        } catch (error) {
            console.error("Error sorting by date:", error);
        }
    };

    const showsubtask = async (taskId) => {
        if (openSubtasks[taskId]) {
            setOpenSubtasks((prev) => {
                const newState = { ...prev };
                delete newState[taskId];
                return newState;
            });
            return;
        }
        try {
            const res = await axios.get(`http://localhost:7800/api/subtask/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOpenSubtasks((prev) => ({
                ...prev,
                [taskId]: res.data || [],
            }));
        } catch (error) {
            console.error("Error fetching subtasks:", error);
            setOpenSubtasks((prev) => ({ ...prev, [taskId]: [] }));
        }
    };

    const isOverdue = (deadline, status) => {
        if (status === 'Complete' || status === 'Completed') return false;
        if (!deadline) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDeadline = new Date(deadline);
        taskDeadline.setHours(0, 0, 0, 0);
        return taskDeadline < today;
    };

    useEffect(() => {
        if (token) getAllTasks();
    }, []);

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
        <div className={`min-h-screen p-6 transition-all duration-500 ${
            darkMode 
                ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
                : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
        }`}>
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className={`text-4xl font-bold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                    All Tasks
                </h1>
                <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                    Manage and track all tasks for the selected user
                </p>
            </div>

            {/* Filters */}
            <div className={`max-w-7xl mx-auto mb-8 p-6 rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
                darkMode 
                    ? 'bg-slate-800/50 border-purple-500/30' 
                    : 'bg-white/90 border-teal-200'
            }`}>
                <div className="flex items-center gap-3 mb-4">
                    <Filter className={darkMode ? 'text-purple-400' : 'text-teal-600'} size={24} />
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Filters
                    </h2>
                </div>

                <div className="flex flex-wrap gap-4 items-end">
                    {/* Status Filter */}
                    <div className="flex-1 min-w-[200px]">
                        <label className={`block text-sm font-semibold mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Filter by Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => sortByStatus(e.target.value)}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                                darkMode 
                                    ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                                    : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                            }`}
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {/* Date Range Filters */}
                    <div className="flex-1 min-w-[200px]">
                        <label className={`block text-sm font-semibold mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            From Date
                        </label>
                        <input
                            type="date"
                            name="assignedDate"
                            value={filterDates.assignedDate}
                            onChange={handleFilterChange}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                                darkMode 
                                    ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                                    : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                            }`}
                        />
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className={`block text-sm font-semibold mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            To Date
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            value={filterDates.deadline}
                            onChange={handleFilterChange}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                                darkMode 
                                    ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                                    : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                            }`}
                        />
                    </div>

                    <button
                        onClick={sortByDate}
                        className={`px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg flex items-center gap-2 ${
                            darkMode 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                                : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                        }`}
                    >
                        <Calendar size={18} />
                        Apply Filter
                    </button>
                </div>
            </div>

            {/* Tasks Grid */}
            {tasks.length === 0 ? (
                <div className={`max-w-7xl mx-auto p-16 text-center rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
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
                        No tasks found for this user
                    </p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tasks.map((task) => {
                        const taskOverdue = isOverdue(task.deadline, task.status);

                        return (
                            <div
                                key={task._id}
                                className={`rounded-2xl shadow-2xl backdrop-blur-xl border-2 transition-all hover:scale-105 relative overflow-hidden ${
                                    darkMode 
                                        ? 'bg-slate-800/50 border-purple-500/30' 
                                        : 'bg-white/95 border-teal-200'
                                }`}
                            >
                                {/* Overdue Indicator */}
                                {taskOverdue && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <div className="relative">
                                            <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
                                                <AlertCircle className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-6">
                                    <h2 className={`text-xl font-bold mb-4 ${
                                        darkMode ? 'text-white' : 'text-gray-800'
                                    }`}>
                                        {task.task}
                                    </h2>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className={`w-4 h-4 ${
                                                darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`} />
                                            <p className={`text-sm ${
                                                darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                <strong>Assigned:</strong>{" "}
                                                {task.assignedDate
                                                    ? new Date(task.assignedDate).toLocaleDateString()
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-2 ${
                                            taskOverdue ? 'text-red-500 font-semibold' : ''
                                        }`}>
                                            <Clock className="w-4 h-4" />
                                            <p className="text-sm">
                                                <strong>Deadline:</strong>{" "}
                                                {task.deadline
                                                    ? new Date(task.deadline).toLocaleDateString()
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 items-center mb-4">
                                        <span
                                            className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                                                task.status === "Completed"
                                                    ? "bg-gradient-to-r from-emerald-400 to-green-600 text-white"
                                                    : task.status === "Pending"
                                                    ? (darkMode ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" : "bg-yellow-100 text-yellow-700 border border-yellow-300")
                                                    : (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700")
                                            }`}
                                        >
                                            {task.status}
                                        </span>

                                        {task.status !== "Completed" && (
                                            <button
                                                onClick={() => updateStatus(task._id, "Completed")}
                                                className="bg-gradient-to-r from-emerald-400 to-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-emerald-500 hover:to-green-700 transition-all shadow-lg hover:scale-105 flex items-center gap-2"
                                            >
                                                <Check size={16} />
                                                Mark Complete
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => showsubtask(task._id)}
                                        className={`w-full py-3 px-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                                            darkMode 
                                                ? 'bg-slate-700/50 text-white hover:bg-slate-600/50 border border-purple-500/30' 
                                                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                                        }`}
                                    >
                                        {openSubtasks[task._id] ? (
                                            <>
                                                <ChevronUp size={18} />
                                                Hide Subtasks
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown size={18} />
                                                Show Subtasks ({openSubtasks[task._id]?.length || 0})
                                            </>
                                        )}
                                    </button>

                                    {openSubtasks[task._id] && (
                                        <div className={`mt-4 space-y-3 pt-4 border-t-2 ${
                                            darkMode ? 'border-purple-500/30' : 'border-teal-200'
                                        }`}>
                                            {openSubtasks[task._id].length === 0 ? (
                                                <p className={`text-center py-4 ${
                                                    darkMode ? 'text-gray-500' : 'text-gray-500'
                                                }`}>
                                                    No subtasks found
                                                </p>
                                            ) : (
                                                openSubtasks[task._id].map((subtask, index) => {
                                                    const subtaskOverdue = isOverdue(subtask.deadline, subtask.status);

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`p-4 rounded-xl shadow-lg border-2 transition-all relative ${
                                                                darkMode 
                                                                    ? 'bg-slate-700/30 border-purple-400/30' 
                                                                    : 'bg-white border-teal-100'
                                                            }`}
                                                        >
                                                            {subtaskOverdue && (
                                                                <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                            )}

                                                            <div className="flex justify-between items-start gap-3 mb-2">
                                                                <span className={`font-semibold flex-1 ${
                                                                    darkMode ? 'text-white' : 'text-gray-800'
                                                                }`}>
                                                                    {subtask.name}
                                                                </span>
                                                                <span
                                                                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                                                                        subtask.status === "Completed"
                                                                            ? "bg-gradient-to-r from-emerald-400 to-green-600 text-white"
                                                                            : (darkMode ? "bg-yellow-500/20 text-yellow-300" : "bg-yellow-100 text-yellow-700")
                                                                    }`}
                                                                >
                                                                    {subtask.status}
                                                                </span>
                                                            </div>
                                                            <p className={`text-xs mb-3 ${
                                                                subtaskOverdue ? 'text-red-500 font-semibold' : (darkMode ? 'text-gray-400' : 'text-gray-600')
                                                            }`}>
                                                                Deadline: {subtask.deadline ? new Date(subtask.deadline).toLocaleDateString() : 'N/A'}
                                                            </p>

                                                            {subtask.status !== "Completed" && (
                                                                <button
                                                                    onClick={() => updateSubtaskStatus(subtask._id, "Completed")}
                                                                    className="w-full bg-gradient-to-r from-emerald-400 to-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-emerald-500 hover:to-green-700 transition-all shadow-lg text-sm flex items-center justify-center gap-2"
                                                                >
                                                                    <Check size={14} />
                                                                    Complete
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ShowAllTasks;