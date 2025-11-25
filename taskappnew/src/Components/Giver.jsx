import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import {
    AlignJustify,
    PlusCircle,
    Circle,
    CheckCircle2,
    MoreHorizontal,
    Trash2,
    Edit3,
    ChevronDown,
    ChevronUp,
    X,
    Calendar,
    Tag,
    Plus,
    CheckSquare,
    Users,
    MessageSquare,
} from "lucide-react";

// --- DND Imports ---
import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCorners,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";

// --- DND SortableItem Component ---
const SortableItem = ({ id, data, children, disabled = false }) => {
    const stableData = useMemo(() => data, [JSON.stringify(data)]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: id,
        data: stableData,
        disabled: disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? "default" : (isDragging ? "grabbing" : "grab"),
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

// --- Subtask Detail Modal Component ---
const SubtaskModal = ({ subtask, taskTitle, isOpen, onClose, onUpdate, onDelete, theme }) => {
    const [description, setDescription] = useState(subtask?.description || "");
    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState(subtask?.name || "");
    const [deadline, setDeadline] = useState(subtask?.deadline?.split("T")[0] || "");
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const isDark = theme === "dark";
    const modalBg = isDark ? "bg-gray-800" : "bg-gray-50";
    const cardBg = isDark ? "bg-gray-700" : "bg-white";
    const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
    const textSecondary = isDark ? "text-gray-300" : "text-gray-600";
    const borderColor = isDark ? "border-gray-600" : "border-gray-300";
    const inputBg = isDark ? "bg-gray-600" : "bg-gray-100";
    const buttonBg = isDark ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300";

    useEffect(() => {
        if (subtask) {
            setName(subtask.name || "");
            setDescription(subtask.description || "");
            setDeadline(subtask.deadline?.split("T")[0] || "");
        }
    }, [subtask]);

    if (!isOpen || !subtask) return null;

    const handleSave = () => {
        onUpdate({
            ...subtask,
            name,
            description,
            deadline,
        });
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            const comment = {
                id: Date.now(),
                text: newComment,
                author: "Current User", // Replace with actual user name
                timestamp: new Date().toISOString(),
            };
            setComments([...comments, comment]);
            setNewComment("");
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className={`${modalBg} rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-inherit z-10 p-6 pb-4 border-b border-gray-600">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckSquare size={20} className={textSecondary} />
                                {editingName ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={() => {
                                            setEditingName(false);
                                            handleSave();
                                        }}
                                        className={`text-xl font-semibold ${textPrimary} ${inputBg} px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        autoFocus
                                    />
                                ) : (
                                    <h2
                                        className={`text-xl font-semibold ${textPrimary} cursor-pointer hover:bg-gray-600/50 px-2 py-1 rounded`}
                                        onClick={() => setEditingName(true)}
                                    >
                                        {name}
                                    </h2>
                                )}
                            </div>
                            <p className={`text-sm ${textSecondary} ml-7`}>
                                in list <span className="underline">{taskTitle}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`${textSecondary} hover:${textPrimary} transition p-1 rounded hover:bg-gray-600`}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Sidebar Actions */}
                    <div className="flex gap-6">
                        <div className="flex-1 space-y-6">
                            {/* Description */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <AlignJustify size={20} className={textSecondary} />
                                    <h3 className={`font-semibold ${textPrimary}`}>Description</h3>
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={handleSave}
                                    placeholder="Add a more detailed description..."
                                    className={`w-full ${inputBg} ${textPrimary} p-3 rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                />
                            </div>

                            {/* Comments and Activity */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={20} className={textSecondary} />
                                        <h3 className={`font-semibold ${textPrimary}`}>Comments and activity</h3>
                                    </div>
                                    <button className={`text-sm ${textSecondary} hover:${textPrimary}`}>
                                        Show details
                                    </button>
                                </div>

                                {/* Add Comment */}
                                <div className="mb-4">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className={`w-full ${inputBg} ${textPrimary} p-3 rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                    />
                                    {newComment && (
                                        <button
                                            onClick={handleAddComment}
                                            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition"
                                        >
                                            Save
                                        </button>
                                    )}
                                </div>

                                {/* Comments List */}
                                <div className="space-y-3">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className={`${cardBg} p-3 rounded-lg`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center`}>
                                                    <span className={`text-sm font-semibold ${textPrimary}`}>
                                                        {comment.author.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className={`font-semibold text-sm ${textPrimary}`}>{comment.author}</p>
                                                    <p className={`text-xs ${textSecondary}`}>
                                                        {new Date(comment.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className={`text-sm ${textPrimary} ml-10`}>{comment.text}</p>
                                        </div>
                                    ))}
                                    {comments.length === 0 && (
                                        <p className={`text-sm ${textSecondary} italic text-center py-4`}>
                                            No comments yet
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-48 space-y-2">
                            <p className={`text-xs font-semibold ${textSecondary} mb-2`}>ADD TO CARD</p>

                            <button className={`w-full ${buttonBg} ${textPrimary} px-3 py-2 rounded text-sm font-medium transition flex items-center gap-2`}>
                                <Users size={16} />
                                Members
                            </button>

                            <button className={`w-full ${buttonBg} ${textPrimary} px-3 py-2 rounded text-sm font-medium transition flex items-center gap-2`}>
                                <Tag size={16} />
                                Labels
                            </button>

                            <button
                                className={`w-full ${buttonBg} ${textPrimary} px-3 py-2 rounded text-sm font-medium transition flex items-center gap-2`}
                                onClick={() => document.getElementById('deadline-input')?.focus()}
                            >
                                <Calendar size={16} />
                                Dates
                            </button>

                            <button className={`w-full ${buttonBg} ${textPrimary} px-3 py-2 rounded text-sm font-medium transition flex items-center gap-2`}>
                                <CheckSquare size={16} />
                                Checklist
                            </button>

                            {/* Deadline Input */}
                            <div className="pt-4">
                                <label className={`text-xs font-semibold ${textSecondary} mb-2 block`}>
                                    DEADLINE
                                </label>
                                <input
                                    id="deadline-input"
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => {
                                        setDeadline(e.target.value);
                                        handleSave();
                                    }}
                                    className={`w-full ${inputBg} ${textPrimary} px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-4">
                                <p className={`text-xs font-semibold ${textSecondary} mb-2`}>ACTIONS</p>
                                <button
                                    onClick={onDelete}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Giver Component ---
const Giver = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState({});
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [subtasks, setSubtasks] = useState({});
    const [subtaskInputs, setSubtaskInputs] = useState({});
    const [taskInputs, setTaskInputs] = useState({});
    const [showTaskForm, setShowTaskForm] = useState({});
    const [editingTask, setEditingTask] = useState(null);
    const navigate = useNavigate()
    // ***** NAYA BADLAV 1: editingSubtask state *****
    const [editingSubtask, setEditingSubtask] = useState(null); // { id: null, newName: "", newDeadline: "", parentTask: "" }

    const [showOptions, setShowOptions] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [theme, setTheme] = useState("light");
    const [selectedSubtask, setSelectedSubtask] = useState(null);
    const [selectedTaskTitle, setSelectedTaskTitle] = useState("");
    const token = localStorage.getItem("token");

    const dragDataRef = useRef({ active: null, over: null });

    // --- Fetch User Theme ---
    const getUserTheme = async () => {
        try {
            const res = await axios.get("http://localhost:7800/api/users/getOne", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userTheme = res.data.theme || "light";
            setTheme(userTheme);
            localStorage.setItem("theme", userTheme);
        } catch (err) {
            console.error("Error fetching user theme:", err);
            const savedTheme = localStorage.getItem("theme") || "light";
            setTheme(savedTheme);
        }
    };

    useEffect(() => {
        if (token) {
            getUserTheme();
        }
    }, [token]);

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedTheme = localStorage.getItem("theme") || "light";
            setTheme(updatedTheme);
        };

        window.addEventListener("storage", handleStorageChange);

        // Also check on mount
        const currentTheme = localStorage.getItem("theme") || "light";
        setTheme(currentTheme);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    // Theme-based styles
    const isDark = theme === "dark";
    const bgGradient = isDark
        ? "from-gray-900 via-gray-800 to-gray-900"
        : "from-purple-600 to-indigo-700";
    const cardBg = isDark ? "bg-gray-800/90" : "bg-white/80";
    const cardBorder = isDark ? "border-gray-700" : "border-white/20";
    const textPrimary = isDark ? "text-gray-100" : "text-black/90";
    const textSecondary = isDark ? "text-gray-300" : "text-black/80";
    const inputBg = isDark ? "bg-gray-700" : "bg-white";
    const inputText = isDark ? "text-gray-100" : "text-black";
    const buttonBg = isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-white/40";
    const taskBg = isDark ? "bg-gray-700" : "bg-white";
    const taskHoverBg = isDark ? "hover:bg-gray-600" : "hover:bg-white/30";
    const subtaskPanelBg = isDark ? "bg-gray-900/80" : "bg-black/20";
    const subtaskItemBg = isDark ? "bg-gray-700/50" : "bg-white/20";
    const dropZoneBorder = isDark ? "border-gray-600" : "border-gray-400/30";
    const dropZoneText = isDark ? "text-gray-500" : "text-gray-400";
    const iconColor = isDark ? "text-gray-400 hover:text-gray-200" : "text-black/40 hover:text-black/80";
    const menuBg = isDark ? "bg-gray-800/90 border-gray-700" : "bg-white/20 border-white/10";

    // --- DND Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    // --- Data Fetching ---
    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://localhost:7800/api/users/getAll", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await axios.get("http://localhost:7800/api/task/assignedbyme", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const grouped = {};

            users.forEach(user => {
                grouped[user._id] = [];
            });

            res.data.forEach((t) => {
                const userId = t.assignedTo?._id || t.assignedTo;
                if (grouped[userId]) {
                    grouped[userId].push(t);
                }
            });

            setTasks(grouped);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    };

    const fetchSubtasks = async (taskId) => {
        try {
            const res = await axios.get(`http://localhost:7800/api/subtask/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubtasks((prev) => ({ ...prev, [taskId]: res.data || [] }));
        } catch (err) {
            console.error("Error fetching subtasks:", err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    useEffect(() => {
        if (users.length > 0) {
            fetchTasks();
        }
    }, [users]);

    // --- Task Handlers ---
    const handleTaskChange = (userId, field, value) => {
        setTaskInputs((prev) => ({
            ...prev,
            [userId]: { ...prev[userId], [field]: value },
        }));
    };

    const handleTaskSubmit = async (userId) => {
        const data = taskInputs[userId];
        if (!data?.task || !data?.deadline) return alert("Fill all fields!");

        try {
            await axios.post(
                "http://localhost:7800/api/task/newTask",
                { task: data.task, assignedTo: userId, deadline: data.deadline },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTasks();
            setTaskInputs((prev) => ({ ...prev, [userId]: { task: "", deadline: "" } }));
            setShowTaskForm((prev) => ({ ...prev, [userId]: false }));
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    // --- Subtask Handlers ---
    const handleSubtaskChange = (taskId, field, value) => {
        setSubtaskInputs((prev) => ({
            ...prev,
            [taskId]: { ...prev[taskId], [field]: value },
        }));
    };

    const addSubtask = async (taskId) => {
        const data = subtaskInputs[taskId];
        if (!data?.name || !data?.deadline) return alert("Fill all fields!");

        try {
            await axios.post(
                "http://localhost:7800/api/subtask/add",
                { parentTask: taskId, name: data.name, deadline: data.deadline },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchSubtasks(taskId);
            setSubtaskInputs((prev) => ({ ...prev, [taskId]: { name: "", deadline: "" } }));
        } catch (err) {
            console.error("Error adding subtask:", err);
        }
    };

    const deleteSubtask = async (id, taskId) => {
        try {
            await axios.delete(`http://localhost:7800/api/subtask/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSubtasks(taskId);
            setSelectedSubtask(null);
        } catch (err) {
            console.error("Error deleting subtask:", err);
        }
    };

    const updateSubtask = async (updatedSubtask) => {
        try {
            await axios.put(
                `http://localhost:7800/api/subtask/update/${updatedSubtask._id}`,
                {
                    name: updatedSubtask.name,
                    description: updatedSubtask.description,
                    deadline: updatedSubtask.deadline,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchSubtasks(updatedSubtask.parentTask);
            setSelectedSubtask(null);
        } catch (err) {
            console.error("Error updating subtask:", err);
        }
    };

    // --- UI Handlers ---
    const handleToggleExpand = (taskId) => {
        const newExpandedId = expandedTaskId === taskId ? null : taskId;
        setExpandedTaskId(newExpandedId);
        if (newExpandedId) fetchSubtasks(taskId);
    };

    const toggleStatus = async (taskId, current) => {
        try {
            const newStatus = current === "Pending" ? "Complete" : "Pending";
            await axios.post(
                "http://localhost:7800/api/task/updateS",
                { taskId, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTasks();
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:7800/api/task/delete/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasks();
            setShowOptions(null);
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const updateTask = async (taskId) => {
        try {
            await axios.put(
                `http://localhost:7800/api/task/taskUpdate/${taskId}`,
                {
                    task: editingTask.newName,
                    deadline: editingTask.newDeadline,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTasks();
            setEditingTask(null);
        } catch (err) {
            console.error("Error editing task:", err);
        }
    };

    const handleSaveSubtaskEdit = async (subtaskId) => {
        if (!editingSubtask || editingSubtask.id !== subtaskId) return;

        const parentTaskId = editingSubtask.parentTask;

        try {
            await axios.put(
                `http://localhost:7800/api/subtask/update/${subtaskId}`,
                {
                    name: editingSubtask.newName,
                    deadline: editingSubtask.newDeadline,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (parentTaskId) {
                fetchSubtasks(parentTaskId);
            }
            setEditingSubtask(null);
        } catch (err) {
            console.error("Error updating subtask:", err);
        }
    };

    const handleSubtaskClick = (subtask, taskTitle) => {
        setSelectedSubtask(subtask);
        setSelectedTaskTitle(taskTitle);
    };

    const handleDragStart = (event) => {
        const activeData = event.active.data?.current || event.active.data || {};
        dragDataRef.current.active = {
            id: event.active.id,
            data: activeData
        };

        setActiveId(event.active.id);
        setExpandedTaskId(null);
        setShowOptions(null);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) {
            dragDataRef.current = { active: null, over: null };
            return;
        }

        const activeData = dragDataRef.current.active?.data || {};
        const overData = over.data?.current || over.data || {};

        const activeType = activeData?.type;
        const overType = overData?.type;

        dragDataRef.current = { active: null, over: null };

        if (!activeType) {
            console.error('CRITICAL: activeType is undefined!');
            return;
        }

        // --- Task Dragging Logic ---
        if (activeType === "TASK") {
            const fromUser = activeData.parentUser;
            let toUser;

            if (overType === "TASK") {
                toUser = overData.parentUser;
            } else if (overType === "USER_COLUMN") {
                toUser = over.id;
            } else {
                toUser = over.id;
            }

            if (fromUser === toUser) {
                return;
            }

            setTasks((prev) => {
                const updated = {};

                Object.keys(prev).forEach(userId => {
                    updated[userId] = [...prev[userId]];
                });

                const movingTask = updated[fromUser]?.find((t) => t._id === active.id);

                if (!movingTask) {
                    console.error('Task not found in source user');
                    return prev;
                }

                updated[fromUser] = updated[fromUser].filter((t) => t._id !== active.id);

                if (!updated[toUser]) {
                    updated[toUser] = [];
                }

                const alreadyExists = updated[toUser].some(t => t._id === active.id);
                if (!alreadyExists) {
                    updated[toUser] = [...updated[toUser], { ...movingTask, assignedTo: toUser }];
                }

                return updated;
            });

            try {

                await axios.put(
                    `http://localhost:7800/api/task/updateAssignee`,
                    {
                        taskId: active.id,
                        newAssigneeId: toUser
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

            } catch (err) {
                console.error("Error moving task:", err.response?.data || err);
                fetchTasks();
                alert('Failed to move task: ' + (err.response?.data?.message || err.message));
            }
        }

        // --- Subtask Dragging Logic ---
        else if (activeType === "SUBTASK") {
            const fromTask = activeData.parentTask;
            let toTask;

            if (overType === "SUBTASK") {
                toTask = overData.parentTask;
            } else if (overType === "TASK") {
                toTask = over.id;
            } else {
                return; // Can't drop subtask on user column
            }

            if (fromTask === toTask) {
                return;
            }

            setSubtasks((prev) => {
                const updated = {};

                Object.keys(prev).forEach(taskId => {
                    updated[taskId] = [...prev[taskId]];
                });

                const movingSubtask = updated[fromTask]?.find((s) => s._id === active.id);

                if (!movingSubtask) {
                    console.error('Subtask not found in source task');
                    return prev;
                }

                updated[fromTask] = updated[fromTask].filter((s) => s._id !== active.id);

                if (!updated[toTask]) {
                    updated[toTask] = [];
                }

                const alreadyExists = updated[toTask].some(s => s._id === active.id);
                if (!alreadyExists) {
                    updated[toTask] = [...updated[toTask], { ...movingSubtask, parentTask: toTask }];
                }

                return updated;
            });

            try {
                // NEW API CALL FOR EMAIL:
                await axios.put(
                    `http://localhost:7800/api/subtask/updateParent`, // Aapka naya route
                    {
                        subtaskId: active.id,   // Jo subtask move hua
                        newParentId: toTask     // Naya parent task
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Yeh line's waisi hi rehne de taaki UI update hojaye
                await Promise.all([
                    fetchSubtasks(fromTask),
                    fetchSubtasks(toTask)
                ]);
            } catch (err) {
                console.error("Error moving subtask:", err.response?.data || err);
                // Revert UI on error by re-fetching
                fetchSubtasks(fromTask);
                fetchSubtasks(toTask);
                alert('Failed to move subtask: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    // --- Render ---
    return (
        <div className={`min-h-screen bg-gradient-to-tl ${bgGradient} transition-all duration-500`}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >

                <div className="flex gap-6 overflow-x-auto pl-2 pr-2 h-screen w-full rounded-2xl pb-6 items-start">

                    {users.map((user) => {
                        const userTasks = tasks[user._id] || [];
                        const taskIds = userTasks.map(t => t._id);
                        const sortableIds = taskIds.length > 0 ? taskIds : [user._id];

                        return (
                            <SortableContext
                                key={user._id}
                                id={user._id}
                                items={sortableIds}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className={`${cardBg} backdrop-blur-md mt-5 border ${cardBorder} rounded-2xl p-4 w-72 flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
                                    {/* User Header */}
                                    <h3 className={`text-xl font-semibold ${textPrimary} mb-3 flex justify-between items-center`}>
                                        {user.name.charAt(0).toUpperCase() + user.name.slice(1).toLowerCase()}
                                        <button
                                            onClick={() =>
                                                setShowTaskForm((prev) => ({ ...prev, [user._id]: !prev[user._id] }))
                                            }
                                            className={`${textPrimary} transition`}
                                        >
                                            {showTaskForm[user._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </h3>

                                    {/* Add Task Form */}
                                    {showTaskForm[user._id] && (
                                        <div className={`${buttonBg} backdrop-blur-sm p-3 rounded-xl mb-3 space-y-2 fade-in`}>
                                            <input
                                                type="text"
                                                placeholder="Task name"
                                                value={taskInputs[user._id]?.task || ""}
                                                onChange={(e) => handleTaskChange(user._id, "task", e.target.value)}
                                                className={`w-full px-2 py-1 rounded-md ${inputBg} ${inputText} placeholder-gray-400 focus:outline-none`}
                                            />
                                            <input
                                                type="date"
                                                value={taskInputs[user._id]?.deadline || ""}
                                                onChange={(e) => handleTaskChange(user._id, "deadline", e.target.value)}
                                                className={`w-full px-2 py-1 rounded-md ${inputBg} ${inputText} focus:outline-none`}
                                            />
                                            <button
                                                onClick={() => handleTaskSubmit(user._id)}
                                                className="bg-green-500 hover:bg-green-600 text-white w-full py-1 rounded-md transition flex items-center justify-center gap-1"
                                            >
                                                <PlusCircle size={16} /> Add Task
                                            </button>
                                        </div>
                                    )}

                                    {/* Task List */}
                                    {userTasks.length > 0 ? (
                                        <div className="space-y-2 min-h-[100px]">
                                            {userTasks.map((t) => (
                                                <div key={t._id}>
                                                    <SortableItem
                                                        id={t._id}
                                                        data={{ type: "TASK", parentUser: user._id }}
                                                    >
                                                        <div className={`relative ${taskBg} ${textSecondary} p-3 rounded-lg fade-in flex justify-between items-center ${taskHoverBg} transition`}>
                                                            <div className="flex items-center gap-2 flex-1 pointer-events-none">
                                                                {t.status === "Complete" ? (
                                                                    <CheckCircle2
                                                                        size={18}
                                                                        className="text-green-400 cursor-pointer pointer-events-auto"
                                                                        onClick={(e) => { e.stopPropagation(); toggleStatus(t._id, t.status); }}
                                                                    />
                                                                ) : (
                                                                    <Circle
                                                                        size={18}
                                                                        className="text-gray-600 cursor-pointer pointer-events-auto"
                                                                        onClick={(e) => { e.stopPropagation(); toggleStatus(t._id, t.status); }}
                                                                    />
                                                                )}
                                                                {editingTask?.id === t._id ? (
                                                                    <div className="flex flex-col gap-1 w-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                                                        <input type="text" value={editingTask.newName} onChange={(e) => setEditingTask({ ...editingTask, newName: e.target.value })} className={`bg-transparent border-b ${isDark ? 'border-gray-600' : 'border-white/40'} text-sm focus:outline-none w-full`} autoFocus />
                                                                        <input type="date" value={editingTask.newDeadline || ""} onChange={(e) => setEditingTask({ ...editingTask, newDeadline: e.target.value })} className={`bg-transparent border-b ${isDark ? 'border-gray-600' : 'border-white/40'} text-xs focus:outline-none w-full`} />
                                                                        <button onClick={(e) => { e.stopPropagation(); updateTask(t._id); }} className="bg-blue-500 text-white text-xs rounded px-2 py-0.5 mt-1 self-end">Save</button>
                                                                    </div>
                                                                ) : (
                                                                    <p className="font-medium text-sm">{t.task.charAt(0).toUpperCase() + t.task.slice(1).toLowerCase()}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 pointer-events-none">
                                                                <AlignJustify
                                                                    size={18}
                                                                    className={`cursor-pointer ${iconColor} pointer-events-auto`}
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleExpand(t._id); }}
                                                                />
                                                                <MoreHorizontal
                                                                    size={18}
                                                                    className={`cursor-pointer ${iconColor} pointer-events-auto`}
                                                                    onClick={(e) => { e.stopPropagation(); setShowOptions(showOptions === t._id ? null : t._id); }}
                                                                />
                                                            </div>
                                                            {showOptions === t._id && (
                                                                <div className={`absolute right-0 top-8 ${menuBg} backdrop-blur-lg border rounded-md text-sm shadow-md overflow-hidden z-10 pointer-events-auto`}>
                                                                    <button onClick={(e) => { e.stopPropagation(); setEditingTask({ id: t._id, newName: t.task, newDeadline: t.deadline?.split("T")[0] || "" }); setShowOptions(null); }} className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-white/30'} w-full`}>
                                                                        <Edit3 size={14} /> Edit
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); deleteTask(t._id); }} className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/40 w-full text-red-300">
                                                                        <Trash2 size={14} /> Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </SortableItem>

                                                    {/* Subtask Panel */}
                                                    {expandedTaskId === t._id && (
                                                        <div className={`${subtaskPanelBg} text-white p-4 rounded-b-lg mb-2 fade-in space-y-4`}>
                                                            <SortableContext
                                                                id={t._id}
                                                                items={subtasks[t._id]?.map((s) => s._id) || []}
                                                                strategy={verticalListSortingStrategy}
                                                            >
                                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                                    {subtasks[t._id]?.length ? (
                                                                        subtasks[t._id].map((s) => (
                                                                            // ***** NAYA BADLAV 3: Pura subtask item logic *****
                                                                            <SortableItem
                                                                                key={s._id}
                                                                                id={s._id}
                                                                                data={{ type: "SUBTASK", parentTask: t._id }}
                                                                                // Edit karte waqt drag disable karein
                                                                                disabled={editingSubtask?.id === s._id}
                                                                            >
                                                                                {editingSubtask?.id === s._id ? (
                                                                                    // --- EDITING VIEW ---
                                                                                    <div className={`${subtaskItemBg} px-3 py-1.5 rounded-md text-sm space-y-2`}>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={editingSubtask.newName}
                                                                                            onChange={(e) => setEditingSubtask({ ...editingSubtask, newName: e.target.value })}
                                                                                            className={`w-full px-2 py-1 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none`}
                                                                                            autoFocus
                                                                                            onClick={(e) => e.stopPropagation()} // Modal open hone se rokein
                                                                                        />
                                                                                        <input
                                                                                            type="date"
                                                                                            value={editingSubtask.newDeadline}
                                                                                            onChange={(e) => setEditingSubtask({ ...editingSubtask, newDeadline: e.target.value })}
                                                                                            className={`w-full px-2 py-1 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none`}
                                                                                            onClick={(e) => e.stopPropagation()} // Modal open hone se rokein
                                                                                        />
                                                                                        <div className="flex justify-end gap-2">
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); setEditingSubtask(null); }}
                                                                                                className="text-xs text-gray-300 hover:text-white"
                                                                                            >
                                                                                                Cancel
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); handleSaveSubtaskEdit(s._id); }}
                                                                                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                                                                                            >
                                                                                                Save
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    // --- NORMAL VIEW ---
                                                                                    <div
                                                                                        className={`flex justify-between ${subtaskItemBg} px-3 py-1.5 rounded-md text-sm items-center cursor-pointer hover:bg-opacity-80 transition`}
                                                                                        onClick={() => handleSubtaskClick(s, t.task)}
                                                                                    >
                                                                                        <span>{s.name}</span>
                                                                                        <div className="flex items-center gap-2">
                                                                                            {/* --- PENCIL ICON (NEW) --- */}
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setEditingSubtask({
                                                                                                        id: s._id,
                                                                                                        newName: s.name,
                                                                                                        newDeadline: s.deadline?.split("T")[0] || "",
                                                                                                        parentTask: t._id // Parent task ID store karein
                                                                                                    });
                                                                                                }}
                                                                                                className={`${iconColor} hover:text-white`}
                                                                                            >
                                                                                                <Edit3 size={14} />
                                                                                            </button>
                                                                                            {/* --- DELETE ICON (EXISTING) --- */}
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    deleteSubtask(s._id, t._id);
                                                                                                }}
                                                                                                className="text-red-400 hover:text-red-500"
                                                                                            >
                                                                                                <Trash2 size={14} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </SortableItem>
                                                                            // ***** BADLAV 3 KHATAM *****
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-xs text-gray-300 italic">No subtasks yet</p>
                                                                    )}
                                                                </div>
                                                            </SortableContext>

                                                            {/* Add Subtask Form */}
                                                            <div className="flex flex-col gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Subtask name"
                                                                    value={subtaskInputs[t._id]?.name || ""}
                                                                    onChange={(e) => handleSubtaskChange(t._id, "name", e.target.value)}
                                                                    className="w-full px-2 py-1 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none"
                                                                />
                                                                <input
                                                                    type="date"
                                                                    value={subtaskInputs[t._id]?.deadline || ""}
                                                                    onChange={(e) => handleSubtaskChange(t._id, "deadline", e.target.value)}
                                                                    className="w-full px-2 py-1 rounded-md bg-white text-black focus:outline-none"
                                                                />
                                                                <button
                                                                    onClick={() => addSubtask(t._id)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 rounded-md transition flex items-center justify-center gap-1"
                                                                >
                                                                    <PlusCircle size={14} /> Add Subtask
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <SortableItem
                                            id={user._id}
                                            data={{ type: "USER_COLUMN" }}
                                        >
                                            <div className={`min-h-[100px] border-2 border-dashed ${dropZoneBorder} rounded-lg flex items-center justify-center ${dropZoneText} text-sm`}>
                                                Drop tasks here
                                            </div>
                                        </SortableItem>
                                    )}
                                </div>
                            </SortableContext>
                        );
                    })}
                    <div className="flex justify-center items-center">
                        <button
                        className="flex justify-center items-center border-2 border mt-20 size-20 p-4 border-gray-400 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-300"
                        onClick={() =>navigate('/sign')}
                    >
                              <Plus size={48} className="text-gray-900 hover:text-indigo-600 transition-all duration-300" />

                    </button>
                    </div>
                </div>
            </DndContext>

            {/* Subtask Detail Modal */}
            <SubtaskModal
                subtask={selectedSubtask}
                taskTitle={selectedTaskTitle}
                isOpen={!!selectedSubtask}
                onClose={() => setSelectedSubtask(null)}
                onUpdate={updateSubtask}
                onDelete={() => {
                    if (selectedSubtask) {
                        deleteSubtask(selectedSubtask._id, selectedSubtask.parentTask);
                    }
                }}
                theme={theme}
            />
        </div>
    );
};

export default Giver;