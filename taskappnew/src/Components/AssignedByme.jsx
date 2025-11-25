import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    Search,
    ClipboardList,
    User,
    Calendar,
    CheckCircle,
    Clock,
    X,
    Plus,
    ChevronDown,
    Dot,
} from "lucide-react";

const AssignedByme = () => {
    const [tasksbyme, setTasksbyme] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [search, setSearch] = useState("");
    const [themeColor, setThemeColor] = useState("#c2a679");
    const token = localStorage.getItem("token");

    const [edittaskname, setedittaskname] = useState("");
    const [editdeadline, seteditdeadline] = useState("");
    const [editid, seteditid] = useState("");
    const [open, setOpen] = useState(false);

    const [opensub, setOpensub] = useState(false);
    const [subTaskName, setSubTaskName] = useState("");
    const [subDeadline, setSubDeadline] = useState("");
    const [subStatus, setSubStatus] = useState("Pending");
    const [parentTaskId, setParentTaskId] = useState("");

    const [Showsubtask, setShowsubtask] = useState([]);
    const navigate = useNavigate();

    const fetchUserTheme = async () => {
        try {
            const res = await axios.get("https://task-management-b4ua.onrender.com/api/users/getOne", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.themeColor) setThemeColor(res.data.themeColor);
        } catch (err) {
            console.error("Error fetching theme:", err);
        }
    };

    const fetchTasksByme = async () => {
        try {
            const res = await axios.get("https://task-management-b4ua.onrender.com/api/task/assignedbyme", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasksbyme(res.data);
            setFilteredTasks(res.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            setTasksbyme((prev) =>
                prev.map((task) =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                )
            );
            setFilteredTasks((prev) =>
                prev.map((task) =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                )
            );
            await axios.post(
                "https://task-management-b4ua.onrender.com/api/task/updateS",
                { taskId, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTasksByme();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        const filtered = tasksbyme.filter((task) =>
            task.task.toLowerCase().includes(value)
        );
        setFilteredTasks(filtered);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://task-management-b4ua.onrender.com/api/task/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasksByme();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    useEffect(() => {
        fetchUserTheme();
        fetchTasksByme();
    }, [token]);

    const handleEdit = (taskid) => {
        const findTask = tasksbyme.find((task) => task._id === taskid);
        if (findTask) {
            setedittaskname(findTask.task);
            seteditdeadline(findTask.deadline?.split("T")[0]);
            seteditid(findTask._id);
            setOpen(true);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `https://task-management-b4ua.onrender.com/api/task/taskUpdate/${editid}`,
                { task: edittaskname, deadline: editdeadline },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOpen(false);
            fetchTasksByme();
        } catch (error) {
            console.log(error);
        }
    };

    const handleOpenSubtask = (taskId) => {
        setParentTaskId(taskId);
        setSubTaskName("");
        setSubDeadline("");
        setSubStatus("Pending");
        setOpensub(true);
    };

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "https://task-management-b4ua.onrender.com/api/subtask/add",
                {
                    parentTask: parentTaskId,
                    name: subTaskName,
                    deadline: subDeadline,
                    status: subStatus,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOpensub(false);
            fetchTasksByme();
        } catch (error) {
            console.error("Error adding subtask:", error);
            alert("Failed to add subtask");
        }
    };

    const updateSubtaskStatus = async (subtaskId, newStatus) => {
        try {
            await axios.put(
                `https://task-management-b4ua.onrender.com/api/subtask/update/${subtaskId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTasksByme();
        } catch (error) {
            console.error("Error updating subtask:", error);
        }
    };

    const deleteSubtask = async (subtaskId) => {
        try {
            await axios.delete(`https://task-management-b4ua.onrender.com/api/subtask/delete/${subtaskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasksByme();
        } catch (error) {
            console.error("Error deleting subtask:", error);
        }
    };

    const fetchSubtask = async (taskId) => {
        try {
            const res = await axios.get(`https://task-management-b4ua.onrender.com/api/subtask/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowsubtask(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            {open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-md relative border border-[#e6e0d8]">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                            Edit Task
                        </h2>
                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Task Name
                                </label>
                                <input
                                    type="text"
                                    value={edittaskname}
                                    onChange={(e) => setedittaskname(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#c2a679] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={editdeadline}
                                    onChange={(e) => seteditdeadline(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#c2a679] focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-between mt-6">
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#c2a679] text-white rounded-xl hover:bg-[#b99756] transition-all"
                                >
                                    Update Task
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {opensub && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-md relative border border-[#e6e0d8]">
                        <button
                            onClick={() => setOpensub(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                            Add Subtask
                        </h2>
                        <form onSubmit={handleAddSubtask} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Subtask Name
                                </label>
                                <input
                                    type="text"
                                    value={subTaskName}
                                    onChange={(e) => setSubTaskName(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#c2a679] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={subDeadline}
                                    onChange={(e) => setSubDeadline(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#c2a679] focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-between mt-6">
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#c2a679] text-white rounded-xl hover:bg-[#b99756] transition-all"
                                >
                                    Add Subtask
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOpensub(false)}
                                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-white p-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-8">
                    <ClipboardList className="text-[#c2a679]" /> Tasks Assigned by Me
                </h1>

                <div className="flex items-center mb-8">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search tasks..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#c2a679] focus:outline-none"
                        />
                    </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTasks.length === 0 ? (
                        <p className="text-gray-500 text-center col-span-full">
                            No tasks assigned yet.
                        </p>
                    ) : (
                        filteredTasks.map((task) => (
                            <div
                                key={task._id}
                                className="p-6 bg-white rounded-3xl border border-[#ebe6de] shadow-md hover:shadow-xl transition-all"
                            >
                                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <ClipboardList className="text-[#c2a679]" size={18} />{" "}
                                    {task.task}
                                </h2>

                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <User size={16} /> <strong>Assigned to:</strong>{" "}
                                    {task.assignedTo.name || "Unknown"}
                                </p>

                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Calendar size={16} /> <strong>Deadline:</strong>{" "}
                                    {new Date(task.deadline).toLocaleDateString()}
                                </p>

                                <p className="text-sm mt-2 flex items-center gap-2">
                                    <strong>Status:</strong>
                                    <span
                                        className={`${task.status === "Pending"
                                                ? "text-yellow-600"
                                                : "text-green-600"
                                            } font-medium flex items-center gap-1`}
                                    >
                                        {task.status === "Pending" ? (
                                            <Clock size={16} />
                                        ) : (
                                            <CheckCircle size={16} />
                                        )}
                                        {task.status}
                                    </span>
                                </p>

                                <div className="flex flex-wrap gap-2 mt-5">
                                    <button
                                        onClick={() => updateStatus(task._id, "Completed")}
                                        className="flex-1 px-2 py-2 bg-[#c2a679] text-white font-medium text-sm rounded-xl  hover:bg-[#b99756] transition-all"
                                    >
                                        Complete
                                    </button>
                                    <button
                                        onClick={() => updateStatus(task._id, "Pending")}
                                        className="flex-1 px-2 py-2 bg-[#c2a679] text-white font-medium text-sm rounded-xl  hover:bg-[#b99756] transition-all"
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => handleEdit(task._id)}
                                        className="bg-[#c2a679] text-white px-3 py-1 rounded-xl  hover:bg-[#b99756]"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task._id)}
                                        className="bg-[#c2a679] text-white px-3 py-1 rounded-xl  hover:bg-[#b99756]"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => handleOpenSubtask(task._id)}
                                        className="bg-[#c2a679] text-white px-3 py-1 rounded-xl hover:bg-[#b99756] flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Subtask
                                    </button>
                                    <button
                                        onClick={() => fetchSubtask(task._id)}
                                        className="bg-[#c2a679] text-white px-3 py-1 rounded-xl hover:bg-[#b99756] flex items-center gap-1"
                                    >
                                        Show
                                    </button>
                                </div>

                                {Showsubtask.length > 0 &&
                                    Showsubtask.some((st) => st.parentTask === task._id) && (
                                        <div className="mt-5 bg-[#faf8f5] p-4 rounded-2xl border border-[#ebe6de]">
                                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <ChevronDown size={16} /> Subtasks
                                            </h3>
                                            <ul className="space-y-2">
                                                {Showsubtask.filter(
                                                    (st) => st.parentTask === task._id
                                                ).map((subtask) => (
                                                    <li
                                                        key={subtask._id}
                                                        className="flex justify-between items-center bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                {subtask.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Deadline:{" "}
                                                                {new Date(
                                                                    subtask.deadline
                                                                ).toLocaleDateString()}
                                                            </p>
                                                            <p
                                                                className={`text-sm font-medium mt-1 ${subtask.status === "Completed"
                                                                        ? "text-green-600"
                                                                        : "text-yellow-600"
                                                                    }`}
                                                            >
                                                                Status: {subtask.status}
                                                            </p>
                                                            {subtask.status !== "Completed" && new Date(subtask.deadline) < new Date() &&
                                                                <span className="text-red-500"> <Dot size={16} className="text-red-500" /></span>
                                                            }
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    updateSubtaskStatus(subtask._id, "Completed")
                                                                }
                                                                className="bg-[#c2a679] text-white px-2 py-1 rounded text-sm  hover:bg-[#b99756]"
                                                            >
                                                                Complete
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    updateSubtaskStatus(subtask._id, "Pending")
                                                                }
                                                                className="bg-[#c2a679] text-white px-2 py-1 rounded text-sm  hover:bg-[#b99756]"
                                                            >
                                                                Pending
                                                            </button>
                                                            <button
                                                                onClick={() => deleteSubtask(subtask._id)}
                                                                className="bg-[#c2a679] text-white px-2 py-1 rounded text-sm hover:bg-[#b99756]"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                            
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default AssignedByme;
