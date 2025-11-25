// UserTaskBoard.jsx - Ultimate Professional Design
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Plus,
    MoreHorizontal,
    Edit2,
    Trash2,
    Check,
    Circle,
    X,
    ChevronDown,
    ChevronUp,
    Moon,
    Sun,
    GripVertical,
    LayoutGrid,
    Table as TableIcon,
    AlertCircle,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useViewMode } from '../Hooks/useViewModel';

const UserTaskBoard = () => {
    const navigate = useNavigate();
    const { viewMode, toggleView } = useViewMode();
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState({});
    const [subtasks, setSubtasks] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});
    const [expandedTasks, setExpandedTasks] = useState({});
    const [showTaskMenu, setShowTaskMenu] = useState({});
    const [darkMode, setDarkMode] = useState(false);

    // Form states
    const [newTask, setNewTask] = useState({});
    const [newSubtask, setNewSubtask] = useState({});
    const [editingTask, setEditingTask] = useState(null);
    const [editingSubtask, setEditingSubtask] = useState(null);

    useEffect(() => {
        // Load theme from localStorage (synced with UserDetails)
        const savedTheme = localStorage.getItem('theme');
        setDarkMode(savedTheme === 'dark');

        // Listen for theme changes from other components
        const handleStorageChange = () => {
            const newTheme = localStorage.getItem('theme');
            setDarkMode(newTheme === 'dark');
        };

        window.addEventListener('storage', handleStorageChange);
        initializeData();

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const initializeData = async () => {
        await fetchUsers();
        await fetchAllTasks();
        setLoading(false);
    };

    // Fetch all users except logged-in user
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('No authentication token found. Please login.');
                return;
            }

            const response = await axios.get('http://localhost:7800/api/users/getAll', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data || !Array.isArray(response.data)) {
                setUsers([]);
                return;
            }

            setUsers(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.response?.data?.message || 'Failed to fetch users');
            setUsers([]);
        }
    };

    // Fetch all tasks assigned by logged-in user
    const fetchAllTasks = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get('http://localhost:7800/api/task/assignedbyme', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const tasksByUser = {};

            if (Array.isArray(response.data)) {
                response.data.forEach(task => {
                    let assignedToId;

                    if (typeof task.assignedTo === 'object' && task.assignedTo !== null) {
                        assignedToId = task.assignedTo._id;
                    } else {
                        assignedToId = task.assignedTo;
                    }

                    if (assignedToId) {
                        if (!tasksByUser[assignedToId]) {
                            tasksByUser[assignedToId] = [];
                        }
                        tasksByUser[assignedToId].push(task);
                    }
                });
            }

            setTasks(tasksByUser);

            if (Array.isArray(response.data)) {
                response.data.forEach(task => {
                    if (task && task._id) {
                        fetchSubtasks(task._id);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching all tasks:', error);
        }
    };

    // Fetch subtasks for a specific task
    const fetchSubtasks = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:7800/api/subtask/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const subtasksData = Array.isArray(response.data) ? response.data : [];

            setSubtasks(prev => ({
                ...prev,
                [taskId]: subtasksData
            }));
        } catch (error) {
            console.error(`Error fetching subtasks for task ${taskId}:`, error);
            setSubtasks(prev => ({
                ...prev,
                [taskId]: []
            }));
        }
    };

    // Check if task is overdue
    const isOverdue = (deadline, status) => {
        if (status === 'Complete') return false;
        if (!deadline) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDeadline = new Date(deadline);
        taskDeadline.setHours(0, 0, 0, 0);
        return taskDeadline < today;
    };

    // Handle drag end
    const handleDragEnd = async (result) => {
        const { source, destination, type } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        if (type === 'TASK') {
            const sourceUserId = source.droppableId;
            const destUserId = destination.droppableId;

            const sourceTasks = Array.from(tasks[sourceUserId] || []);
            const [movedTask] = sourceTasks.splice(source.index, 1);

            if (sourceUserId === destUserId) {
                sourceTasks.splice(destination.index, 0, movedTask);
                setTasks(prev => ({
                    ...prev,
                    [sourceUserId]: sourceTasks
                }));
            } else {
                const destTasks = Array.from(tasks[destUserId] || []);
                destTasks.splice(destination.index, 0, movedTask);

                setTasks(prev => ({
                    ...prev,
                    [sourceUserId]: sourceTasks,
                    [destUserId]: destTasks
                }));

                try {
                    const token = localStorage.getItem('token');
                    await axios.put('http://localhost:7800/api/task/updateAssignee',
                        {
                            taskId: movedTask._id,
                            newAssigneeId: destUserId
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } catch (error) {
                    console.error('Error updating task assignee:', error);
                    await fetchAllTasks();
                }
            }
        } else if (type === 'SUBTASK') {
            const sourceTaskId = source.droppableId;
            const destTaskId = destination.droppableId;

            const sourceSubtasks = Array.from(subtasks[sourceTaskId] || []);
            const [movedSubtask] = sourceSubtasks.splice(source.index, 1);

            if (sourceTaskId === destTaskId) {
                sourceSubtasks.splice(destination.index, 0, movedSubtask);
                setSubtasks(prev => ({
                    ...prev,
                    [sourceTaskId]: sourceSubtasks
                }));
            } else {
                const destSubtasks = Array.from(subtasks[destTaskId] || []);
                destSubtasks.splice(destination.index, 0, movedSubtask);

                setSubtasks(prev => ({
                    ...prev,
                    [sourceTaskId]: sourceSubtasks,
                    [destTaskId]: destSubtasks
                }));

                try {
                    const token = localStorage.getItem('token');
                    await axios.put('http://localhost:7800/api/subtask/updateParent',
                        {
                            subtaskId: movedSubtask._id,
                            newParentId: destTaskId
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } catch (error) {
                    console.error('Error updating subtask parent:', error);
                    fetchSubtasks(sourceTaskId);
                    fetchSubtasks(destTaskId);
                }
            }
        }
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        window.dispatchEvent(new Event('storage'));
    };

    // Toggle task form dropdown
    const toggleTaskForm = (userId) => {
        setExpandedCards(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
        if (expandedCards[userId]) {
            setNewTask(prev => ({ ...prev, [userId]: { task: '', deadline: '' } }));
        }
    };

    // Toggle subtask list
    const toggleSubtaskList = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    // Toggle task menu (edit/delete)
    const toggleTaskMenu = (taskId) => {
        setShowTaskMenu(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    // Handle task form input
    const handleTaskInput = (userId, field, value) => {
        setNewTask(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value
            }
        }));
    };

    // Submit new task
    const handleTaskSubmit = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const taskData = {
                task: newTask[userId]?.task,
                assignedTo: userId,
                deadline: newTask[userId]?.deadline
            };

            if (!taskData.task || !taskData.deadline) {
                alert('Please fill in all fields');
                return;
            }

            await axios.post('http://localhost:7800/api/task/newTask', taskData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewTask(prev => ({ ...prev, [userId]: { task: '', deadline: '' } }));
            setExpandedCards(prev => ({ ...prev, [userId]: false }));

            await fetchAllTasks();

            alert('Task created successfully!');
        } catch (error) {
            console.error('Error creating task:', error);
            alert(error.response?.data?.message || 'Failed to create task');
        }
    };

    // Handle subtask form input
    const handleSubtaskInput = (taskId, field, value) => {
        setNewSubtask(prev => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [field]: value
            }
        }));
    };

    // Submit new subtask
    const handleSubtaskSubmit = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const subtaskData = {
                parentTask: taskId,
                name: newSubtask[taskId]?.name,
                deadline: newSubtask[taskId]?.deadline,
                status: 'Pending'
            };

            if (!subtaskData.name || !subtaskData.deadline) {
                alert('Please fill in all fields');
                return;
            }

            await axios.post('http://localhost:7800/api/subtask/add', subtaskData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewSubtask(prev => ({ ...prev, [taskId]: { name: '', deadline: '' } }));
            fetchSubtasks(taskId);

            alert('Subtask created successfully!');
        } catch (error) {
            console.error('Error creating subtask:', error);
            alert(error.response?.data?.message || 'Failed to create subtask');
        }
    };

    // Update task status
    const updateTaskStatus = async (taskId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'Pending' ? 'Complete' : 'Pending';

            await axios.post('http://localhost:7800/api/task/updateS',
                { taskId, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await fetchAllTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('Failed to update task status');
        }
    };

    // Update subtask status
    const updateSubtaskStatus = async (subtaskId, taskId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'Pending' ? 'Complete' : 'Pending';

            await axios.put(`http://localhost:7800/api/subtask/update/${subtaskId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchSubtasks(taskId);
        } catch (error) {
            console.error('Error updating subtask status:', error);
            alert('Failed to update subtask status');
        }
    };

    // Edit task
    const handleEditTask = (task) => {
        setEditingTask({
            ...task,
            task: task.task,
            deadline: task.deadline?.split('T')[0] || ''
        });
        setShowTaskMenu({});
    };

    // Update task
    const handleUpdateTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');

            if (!editingTask.task || !editingTask.deadline) {
                alert('Please fill in all fields');
                return;
            }

            await axios.put(`http://localhost:7800/api/task/taskUpdate/${taskId}`,
                {
                    task: editingTask.task,
                    deadline: editingTask.deadline
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEditingTask(null);
            await fetchAllTasks();
            alert('Task updated successfully!');
        } catch (error) {
            console.error('Error updating task:', error);
            alert(error.response?.data?.message || 'Failed to update task');
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            await axios.delete(`http://localhost:7800/api/task/delete/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowTaskMenu({});
            await fetchAllTasks();
            alert('Task deleted successfully!');
        } catch (error) {
            console.error('Error deleting task:', error);
            alert(error.response?.data?.message || 'Failed to delete task');
        }
    };

    // Edit subtask
    const handleEditSubtask = (subtask) => {
        setEditingSubtask({
            ...subtask,
            name: subtask.name,
            deadline: subtask.deadline?.split('T')[0] || ''
        });
    };

    // Update subtask
    const handleUpdateSubtask = async (subtaskId, taskId) => {
        try {
            const token = localStorage.getItem('token');

            if (!editingSubtask.name || !editingSubtask.deadline) {
                alert('Please fill in all fields');
                return;
            }

            await axios.put(`http://localhost:7800/api/subtask/update/${subtaskId}`,
                {
                    name: editingSubtask.name,
                    deadline: editingSubtask.deadline
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEditingSubtask(null);
            fetchSubtasks(taskId);
            alert('Subtask updated successfully!');
        } catch (error) {
            console.error('Error updating subtask:', error);
            alert(error.response?.data?.message || 'Failed to update subtask');
        }
    };

    // Delete subtask
    const handleDeleteSubtask = async (subtaskId, taskId) => {
        if (!window.confirm('Are you sure you want to delete this subtask?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            await axios.delete(`http://localhost:7800/api/subtask/delete/${subtaskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchSubtasks(taskId);
            alert('Subtask deleted successfully!');
        } catch (error) {
            console.error('Error deleting subtask:', error);
            alert(error.response?.data?.message || 'Failed to delete subtask');
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${darkMode
                ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
                : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
                }`}>
                <div className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Loading your workspace...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${darkMode
                ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
                : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
                }`}>
                <div className={`p-10 rounded-2xl shadow-2xl max-w-md backdrop-blur-xl border-2 ${darkMode
                    ? 'bg-slate-800/50 border-purple-500/30'
                    : 'bg-white/80 border-rose-200'
                    }`}>
                    <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        Error
                    </h3>
                    <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {error}
                    </p>
                    <button
                        onClick={initializeData}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg ${darkMode
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                            : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                            }`}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className={`min-h-screen p-6 transition-all duration-500 ${darkMode
                ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
                : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
                }`}>
                <div className="flex justify-between items-center mb-8">
                    <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Task Board
                    </h1>
                    <button
                        onClick={toggleDarkMode}
                        className={`p-3 rounded-full transition-all transform hover:scale-110 shadow-xl ${darkMode
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                            : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                            }`}
                    >
                        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                </div>
                <div className={`p-16 rounded-2xl shadow-2xl text-center backdrop-blur-xl border-2 ${darkMode
                    ? 'bg-slate-800/50 border-purple-500/30'
                    : 'bg-white/80 border-rose-200'
                    }`}>
                    <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        No other users found in the system.
                    </p>
                </div>
            </div>
        );
    }

    // Get all tasks as flat array for table view
    const getAllTasks = () => {
        const allTasks = [];
        Object.keys(tasks).forEach(userId => {
            const user = users.find(u => u._id === userId);
            tasks[userId].forEach(task => {
                allTasks.push({
                    ...task,
                    assignedToName: user?.name || 'Unknown',
                    assignedToEmail: user?.email || ''
                });
            });
        });
        return allTasks;
    };

    return (
        <div className={`min-h-screen p-6 transition-all duration-500 ${darkMode
            ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
            : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
            }`}>
            {/* Enhanced Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Task Board
                    </h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage and organize your team's tasks efficiently
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className={`flex items-center gap-2 p-1 rounded-xl shadow-lg ${darkMode
                        ? 'bg-slate-800/50 border border-purple-500/30'
                        : 'bg-white/80 border border-teal-200'
                        }`}>
                        <button
                            onClick={() => toggleView()}
                            className={`p-2.5 rounded-lg transition-all transform hover:scale-110 ${viewMode === 'card'
                                ? (darkMode
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg')
                                : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800')
                                }`}
                            title="Card View"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => toggleView()}
                            className={`p-2.5 rounded-lg transition-all transform hover:scale-110 ${viewMode === 'table'
                                ? (darkMode
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg')
                                : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800')
                                }`}
                            title="Table View"
                        >
                            <TableIcon className="w-5 h-5" />
                        </button>
                    </div>


                </div>
            </div>

            {viewMode === 'card' ? (
                // CARD VIEW
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 overflow-x-auto pb-6">
                        {users.map(user => {
                            const userTasks = tasks[user._id] || [];

                            return (
                                <div key={user._id} className="flex-shrink-0 w-80">
                                    {/* Enhanced User Column Header */}
                                    <div className={`rounded-2xl shadow-2xl backdrop-blur-xl transition-all border-2 ${darkMode
                                        ? 'bg-slate-800/50 border-purple-500/30'
                                        : 'bg-white/90 border-teal-200'
                                        }`}>
                                        <div className={`p-5 border-b-2 ${darkMode ? 'border-purple-500/30' : 'border-teal-200'
                                            }`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'
                                                    }`}>
                                                    {user.name.charAt(0).toUpperCase()+user.name.slice(1).toLowerCase()}
                                                </h3>
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ${darkMode
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                                                    }`}>
                                                    {userTasks.length}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {user.email}
                                            </p>
                                        </div>

                                        {/* Tasks Container - Droppable */}
                                        <Droppable droppableId={user._id} type="TASK">
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto transition-colors ${snapshot.isDraggingOver
                                                        ? (darkMode ? 'bg-purple-500/10' : 'bg-teal-50')
                                                        : ''
                                                        }`}
                                                >
                                                    {userTasks.map((task, index) => {
                                                        const taskOverdue = isOverdue(task.deadline, task.status);

                                                        return (
                                                            <Draggable
                                                                key={task._id}
                                                                draggableId={task._id}
                                                                index={index}
                                                            >
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        className={`transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl' : ''
                                                                            }`}
                                                                    >
                                                                        {editingTask?._id === task._id ? (
                                                                            // Edit Task Card
                                                                            <div className={`rounded-xl shadow-xl p-4 backdrop-blur-xl border-2 ${darkMode
                                                                                ? 'bg-slate-700/50 border-purple-400'
                                                                                : 'bg-white border-teal-400'
                                                                                }`}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={editingTask.task}
                                                                                    onChange={(e) => setEditingTask({
                                                                                        ...editingTask,
                                                                                        task: e.target.value
                                                                                    })}
                                                                                    className={`w-full px-4 py-2.5 border-2 rounded-lg mb-3 focus:outline-none focus:ring-2 transition ${darkMode
                                                                                        ? 'bg-slate-600/50 border-purple-400/50 text-white focus:ring-purple-500'
                                                                                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                                                                                        }`}
                                                                                    placeholder="Task name"
                                                                                />
                                                                                <input
                                                                                    type="date"
                                                                                    value={editingTask.deadline || ''}
                                                                                    onChange={(e) => setEditingTask({
                                                                                        ...editingTask,
                                                                                        deadline: e.target.value
                                                                                    })}
                                                                                    className={`w-full px-4 py-2.5 border-2 rounded-lg mb-4 focus:outline-none focus:ring-2 transition ${darkMode
                                                                                        ? 'bg-slate-600/50 border-purple-400/50 text-white focus:ring-purple-500'
                                                                                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                                                                                        }`}
                                                                                />
                                                                                <div className="flex gap-2">
                                                                                    <button
                                                                                        onClick={() => handleUpdateTask(task._id)}
                                                                                        className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg ${darkMode
                                                                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                                                                            : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                                                                                            }`}
                                                                                    >
                                                                                        Save
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setEditingTask(null)}
                                                                                        className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${darkMode
                                                                                            ? 'bg-slate-600/50 text-white hover:bg-slate-600'
                                                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                                            }`}
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            // Task Card
                                                                            <div className={`rounded-xl shadow-xl hover:shadow-2xl transition-all backdrop-blur-xl border-2 relative ${darkMode
                                                                                ? 'bg-slate-800/50 border-purple-500/30 hover:border-purple-500/50'
                                                                                : 'bg-white/95 border-teal-200 hover:border-teal-400'
                                                                                }`}>
                                                                                {/* Overdue Indicator */}
                                                                                {taskOverdue && (
                                                                                    <div className="absolute -top-2 -right-2 z-10">
                                                                                        <div className="relative">
                                                                                            <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                                                                                            <AlertCircle className="w-4 h-4 text-white absolute top-1 left-1" />
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                <div className="p-4">
                                                                                    <div className="flex items-start justify-between mb-3">
                                                                                        {/* Drag Handle */}
                                                                                        <div
                                                                                            {...provided.dragHandleProps}
                                                                                            className={`cursor-grab active:cursor-grabbing mr-2 mt-0.5 transition-colors ${darkMode ? 'text-gray-500 hover:text-purple-400' : 'text-gray-400 hover:text-teal-500'
                                                                                                }`}
                                                                                        >
                                                                                            <GripVertical className="w-5 h-5" />
                                                                                        </div>

                                                                                        <h4 className={`text-sm font-semibold flex-1 pr-2 ${darkMode ? 'text-white' : 'text-gray-800'
                                                                                            }`}>
                                                                                            {task.task}
                                                                                        </h4>

                                                                                        <div className="flex items-center gap-2">
                                                                                            {/* Status Circle */}
                                                                                            <button
                                                                                                onClick={() => updateTaskStatus(task._id, task.status)}
                                                                                                className="relative flex-shrink-0 transition-transform hover:scale-110"
                                                                                                title={`Status: ${task.status || 'Pending'}`}
                                                                                            >
                                                                                                {task.status === 'Complete' ? (
                                                                                                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                                                                                        <Check className="w-4 h-4 text-white" />
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <Circle className={`w-6 h-6 transition-colors ${darkMode ? 'text-gray-500 hover:text-purple-400' : 'text-gray-400 hover:text-teal-500'
                                                                                                        }`} />
                                                                                                )}
                                                                                            </button>

                                                                                            {/* Three Dots Menu */}
                                                                                            <div className="relative">
                                                                                                <button
                                                                                                    onClick={() => toggleTaskMenu(task._id)}
                                                                                                    className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                                                                                                        }`}
                                                                                                >
                                                                                                    <MoreHorizontal className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                                                                                                        }`} />
                                                                                                </button>

                                                                                                {showTaskMenu[task._id] && (
                                                                                                    <div className={`absolute right-0 mt-2 w-44 rounded-xl shadow-2xl border-2 z-20 backdrop-blur-xl ${darkMode
                                                                                                        ? 'bg-slate-800/95 border-purple-500/30'
                                                                                                        : 'bg-white/95 border-teal-200'
                                                                                                        }`}>
                                                                                                        <button
                                                                                                            onClick={() => handleEditTask(task)}
                                                                                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-t-xl transition-all font-medium ${darkMode
                                                                                                                ? 'text-white hover:bg-slate-700'
                                                                                                                : 'text-gray-700 hover:bg-teal-50'
                                                                                                                }`}
                                                                                                        >
                                                                                                            <Edit2 className="w-4 h-4" />
                                                                                                            Edit Task
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={() => handleDeleteTask(task._id)}
                                                                                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-b-xl transition-all font-medium ${darkMode
                                                                                                                ? 'text-red-400 hover:bg-red-500/10'
                                                                                                                : 'text-red-600 hover:bg-red-50'
                                                                                                                }`}
                                                                                                        >
                                                                                                            <Trash2 className="w-4 h-4" />
                                                                                                            Delete Task
                                                                                                        </button>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Task Metadata */}
                                                                                    <div className="flex items-center justify-between text-xs ml-7">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${taskOverdue
                                                                                                ? 'bg-red-100 text-red-700'
                                                                                                : (darkMode ? 'text-gray-400' : 'text-gray-600')
                                                                                                }`}>
                                                                                                {taskOverdue && <Clock className="w-3 h-3" />}
                                                                                                {formatDate(task.deadline)}
                                                                                            </span>
                                                                                        </div>

                                                                                        {/* Subtasks Toggle */}
                                                                                        <button
                                                                                            onClick={() => toggleSubtaskList(task._id)}
                                                                                            className={`flex items-center gap-1 font-semibold transition-all hover:scale-105 ${darkMode
                                                                                                ? 'text-purple-400 hover:text-purple-300'
                                                                                                : 'text-teal-600 hover:text-teal-700'
                                                                                                }`}
                                                                                        >
                                                                                            {expandedTasks[task._id] ? (
                                                                                                <ChevronUp className="w-4 h-4" />
                                                                                            ) : (
                                                                                                <ChevronDown className="w-4 h-4" />
                                                                                            )}
                                                                                            <span>
                                                                                                {subtasks[task._id]?.length || 0}
                                                                                            </span>
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Subtasks Section */}
                                                                                {expandedTasks[task._id] && (
                                                                                    <div className={`border-t-2 p-4 ${darkMode
                                                                                        ? 'border-purple-500/30 bg-slate-900/30'
                                                                                        : 'border-teal-200 bg-teal-50/30'
                                                                                        }`}>
                                                                                        {/* Add Subtask Form */}
                                                                                        <div className="mb-4">
                                                                                            <input
                                                                                                type="text"
                                                                                                placeholder="Subtask name"
                                                                                                value={newSubtask[task._id]?.name || ''}
                                                                                                onChange={(e) => handleSubtaskInput(task._id, 'name', e.target.value)}
                                                                                                className={`w-full px-3 py-2 text-sm border-2 rounded-lg mb-2 focus:outline-none focus:ring-2 transition ${darkMode
                                                                                                    ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500'
                                                                                                    : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                                                                                                    }`}
                                                                                            />
                                                                                            <input
                                                                                                type="date"
                                                                                                value={newSubtask[task._id]?.deadline || ''}
                                                                                                onChange={(e) => handleSubtaskInput(task._id, 'deadline', e.target.value)}
                                                                                                className={`w-full px-3 py-2 text-sm border-2 rounded-lg mb-3 focus:outline-none focus:ring-2 transition ${darkMode
                                                                                                    ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500'
                                                                                                    : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                                                                                                    }`}
                                                                                            />
                                                                                            <button
                                                                                                onClick={() => handleSubtaskSubmit(task._id)}
                                                                                                disabled={!newSubtask[task._id]?.name || !newSubtask[task._id]?.deadline}
                                                                                                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed ${darkMode
                                                                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                                                                                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                                                                                                    }`}
                                                                                            >
                                                                                                Add Subtask
                                                                                            </button>
                                                                                        </div>

                                                                                        {/* Subtasks List - Droppable */}
                                                                                        <Droppable droppableId={task._id} type="SUBTASK">
                                                                                            {(provided, snapshot) => (
                                                                                                <div
                                                                                                    ref={provided.innerRef}
                                                                                                    {...provided.droppableProps}
                                                                                                    className={`space-y-2 transition-colors rounded-lg p-2 ${snapshot.isDraggingOver
                                                                                                        ? (darkMode ? 'bg-purple-500/10' : 'bg-teal-100')
                                                                                                        : ''
                                                                                                        }`}
                                                                                                >
                                                                                                    {subtasks[task._id] && subtasks[task._id].length > 0 ? (
                                                                                                        subtasks[task._id].map((subtask, subtaskIndex) => {
                                                                                                            const subtaskOverdue = isOverdue(subtask.deadline, subtask.status);

                                                                                                            return (
                                                                                                                <Draggable
                                                                                                                    key={subtask._id}
                                                                                                                    draggableId={subtask._id}
                                                                                                                    index={subtaskIndex}
                                                                                                                >
                                                                                                                    {(provided, snapshot) => (
                                                                                                                        <div
                                                                                                                            ref={provided.innerRef}
                                                                                                                            {...provided.draggableProps}
                                                                                                                            className={`transition-all ${snapshot.isDragging ? 'rotate-1 scale-105 shadow-xl' : ''
                                                                                                                                }`}
                                                                                                                        >
                                                                                                                            {editingSubtask?._id === subtask._id ? (
                                                                                                                                // Edit Subtask
                                                                                                                                <div className={`rounded-lg p-3 backdrop-blur-xl border-2 ${darkMode
                                                                                                                                    ? 'bg-slate-700/50 border-purple-400'
                                                                                                                                    : 'bg-white border-teal-400'
                                                                                                                                    }`}>
                                                                                                                                    <input
                                                                                                                                        type="text"
                                                                                                                                        value={editingSubtask.name}
                                                                                                                                        onChange={(e) => setEditingSubtask({
                                                                                                                                            ...editingSubtask,
                                                                                                                                            name: e.target.value
                                                                                                                                        })}
                                                                                                                                        className={`w-full px-3 py-1.5 text-sm border rounded-lg mb-2 focus:outline-none focus:ring-2 transition ${darkMode
                                                                                                                                            ? 'bg-slate-600/50 border-purple-400/50 text-white focus:ring-purple-500'
                                                                                                                                            : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                                                                                                                                            }`}
                                                                                                                                    />
                                                                                                                                    <input
                                                                                                                                        type="date"
                                                                                                                                        value={editingSubtask.deadline || ''}
                                                                                                                                        onChange={(e) => setEditingSubtask({
                                                                                                                                            ...editingSubtask,
                                                                                                                                            deadline: e.target.value
                                                                                                                                        })}
                                                                                                                                        className={`w-full px-3 py-1.5 text-sm border rounded-lg mb-2 focus:outline-none focus:ring-2 transition ${darkMode
                                                                                                                                            ? 'bg-slate-600/50 border-purple-400/50 text-white focus:ring-purple-500'
                                                                                                                                            : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                                                                                                                                            }`}
                                                                                                                                    />
                                                                                                                                    <div className="flex gap-2">
                                                                                                                                        <button
                                                                                                                                            onClick={() => handleUpdateSubtask(subtask._id, task._id)}
                                                                                                                                            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all text-xs shadow-lg ${darkMode
                                                                                                                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                                                                                                                                : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                                                                                                                                                }`}
                                                                                                                                        >
                                                                                                                                            Save
                                                                                                                                        </button>
                                                                                                                                        <button
                                                                                                                                            onClick={() => setEditingSubtask(null)}
                                                                                                                                            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all text-xs ${darkMode
                                                                                                                                                ? 'bg-slate-600/50 text-white hover:bg-slate-600'
                                                                                                                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                                                                                                }`}
                                                                                                                                        >
                                                                                                                                            Cancel
                                                                                                                                        </button>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            ) : (
                                                                                                                                // Display Subtask
                                                                                                                                <div className={`rounded-lg p-2.5 flex items-center justify-between gap-2 hover:shadow-lg transition-all backdrop-blur-xl relative ${darkMode
                                                                                                                                    ? 'bg-slate-700/30 hover:bg-slate-700/50'
                                                                                                                                    : 'bg-white hover:bg-gray-50'
                                                                                                                                    }`}>
                                                                                                                                    {/* Subtask Overdue Indicator */}
                                                                                                                                    {subtaskOverdue && (
                                                                                                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                                                                                                    )}

                                                                                                                                    {/* Drag Handle */}
                                                                                                                                    <div
                                                                                                                                        {...provided.dragHandleProps}
                                                                                                                                        className={`cursor-grab active:cursor-grabbing ${darkMode ? 'text-gray-600' : 'text-gray-400'
                                                                                                                                            }`}
                                                                                                                                    >
                                                                                                                                        <GripVertical className="w-3.5 h-3.5" />
                                                                                                                                    </div>

                                                                                                                                    <button
                                                                                                                                        onClick={() => updateSubtaskStatus(subtask._id, task._id, subtask.status)}
                                                                                                                                        className="flex-shrink-0 transition-transform hover:scale-110"
                                                                                                                                    >
                                                                                                                                        {subtask.status === 'Complete' ? (
                                                                                                                                            <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                                                                                                                                <Check className="w-3 h-3 text-white" />
                                                                                                                                            </div>
                                                                                                                                        ) : (
                                                                                                                                            <Circle className={`w-5 h-5 ${darkMode ? 'text-gray-500 hover:text-purple-400' : 'text-gray-400 hover:text-teal-500'
                                                                                                                                                }`} />
                                                                                                                                        )}
                                                                                                                                    </button>

                                                                                                                                    <div className="flex-1 min-w-0">
                                                                                                                                        <p className={`text-sm font-medium ${subtask.status === 'Complete'
                                                                                                                                            ? (darkMode ? 'line-through text-gray-500' : 'line-through text-gray-500')
                                                                                                                                            : (darkMode ? 'text-white' : 'text-gray-800')
                                                                                                                                            }`}>
                                                                                                                                            {subtask.name}
                                                                                                                                        </p>
                                                                                                                                        <p className={`text-xs mt-0.5 ${subtaskOverdue
                                                                                                                                            ? 'text-red-500 font-semibold'
                                                                                                                                            : (darkMode ? 'text-gray-500' : 'text-gray-500')
                                                                                                                                            }`}>
                                                                                                                                            {formatDate(subtask.deadline)}
                                                                                                                                        </p>
                                                                                                                                    </div>

                                                                                                                                    <div className="flex items-center gap-1">
                                                                                                                                        <button
                                                                                                                                            onClick={() => handleEditSubtask(subtask)}
                                                                                                                                            className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                                                                                                                                                }`}
                                                                                                                                            title="Edit"
                                                                                                                                        >
                                                                                                                                            <Edit2 className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                                                                                                                                                }`} />
                                                                                                                                        </button>
                                                                                                                                        <button
                                                                                                                                            onClick={() => handleDeleteSubtask(subtask._id, task._id)}
                                                                                                                                            className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-100'
                                                                                                                                                }`}
                                                                                                                                            title="Delete"
                                                                                                                                        >
                                                                                                                                            <Trash2 className={`w-3.5 h-3.5 ${darkMode ? 'text-red-400' : 'text-red-600'
                                                                                                                                                }`} />
                                                                                                                                        </button>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                </Draggable>
                                                                                                            );
                                                                                                        })
                                                                                                    ) : (
                                                                                                        <p className={`text-xs text-center py-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'
                                                                                                            }`}>
                                                                                                            No subtasks yet
                                                                                                        </p>
                                                                                                    )}
                                                                                                    {provided.placeholder}
                                                                                                </div>
                                                                                            )}
                                                                                        </Droppable>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    })}
                                                    {provided.placeholder}

                                                    {/* Add New Task Button */}
                                                    {!expandedCards[user._id] ? (
                                                        <button
                                                            onClick={() => toggleTaskForm(user._id)}
                                                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all transform hover:scale-105 font-semibold shadow-lg ${darkMode
                                                                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 hover:from-purple-600/30 hover:to-pink-600/30 border-2 border-purple-500/30'
                                                                : 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 hover:from-teal-100 hover:to-cyan-100 border-2 border-teal-300'
                                                                }`}
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                            Add Task
                                                        </button>
                                                    ) : (
                                                        <div className={`rounded-xl shadow-xl p-4 backdrop-blur-xl border-2 ${darkMode
                                                            ? 'bg-slate-800/50 border-purple-500/30'
                                                            : 'bg-white/95 border-teal-200'
                                                            }`}>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter task name..."
                                                                value={newTask[user._id]?.task || ''}
                                                                onChange={(e) => handleTaskInput(user._id, 'task', e.target.value)}
                                                                className={`w-full px-4 py-2.5 border-2 rounded-lg mb-3 focus:outline-none focus:ring-2 text-sm transition ${darkMode
                                                                    ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500'
                                                                    : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                                                                    }`}
                                                            />
                                                            <input
                                                                type="date"
                                                                value={newTask[user._id]?.deadline || ''}
                                                                onChange={(e) => handleTaskInput(user._id, 'deadline', e.target.value)}
                                                                className={`w-full px-4 py-2.5 border-2 rounded-lg mb-4 focus:outline-none focus:ring-2 text-sm transition ${darkMode
                                                                    ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500'
                                                                    : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500'
                                                                    }`}
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleTaskSubmit(user._id)}
                                                                    disabled={!newTask[user._id]?.task || !newTask[user._id]?.deadline}
                                                                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed ${darkMode
                                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                                                        : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                                                                        }`}
                                                                >
                                                                    Add Task
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleTaskForm(user._id)}
                                                                    className={`p-2.5 rounded-lg transition-all ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                                                                        }`}
                                                                >
                                                                    <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                                                                        }`} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Enhanced Add User Button */}
                        <div className="flex-shrink-0 flex items-start pt-16">
                            <button
                                onClick={() => navigate('/sign')}
                                className={`group w-20 h-20 flex items-center justify-center rounded-2xl transition-all transform hover:scale-110 hover:rotate-12 shadow-2xl ${darkMode
                                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                    : 'bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                                    }`}
                                title="Add New User"
                            >
                                <Plus className="w-10 h-10 text-white transition-transform group-hover:rotate-90" />
                            </button>
                        </div>
                    </div>
                </DragDropContext>
            ) : (
                // TABLE VIEW
                <div className={`rounded-2xl shadow-2xl backdrop-blur-xl border-2 overflow-hidden ${darkMode
                    ? 'bg-slate-800/50 border-purple-500/30'
                    : 'bg-white/90 border-teal-200'
                    }`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={`${darkMode ? 'bg-slate-900/50' : 'bg-teal-50'}`}>
                                <tr>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-purple-300' : 'text-teal-700'
                                        }`}>
                                        Status
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-purple-300' : 'text-teal-700'
                                        }`}>
                                        Task
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-purple-300' : 'text-teal-700'
                                        }`}>
                                        Assigned To
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-purple-300' : 'text-teal-700'
                                        }`}>
                                        Deadline
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-purple-300' : 'text-teal-700'
                                        }`}>
                                        Subtasks
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-purple-300' : 'text-teal-700'
                                        }`}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-teal-100'}`}>
                                {getAllTasks().map((task) => {
                                    const taskOverdue = isOverdue(task.deadline, task.status);

                                    return (
                                        <tr
                                            key={task._id}
                                            className={`transition-colors ${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-teal-50'
                                                }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => updateTaskStatus(task._id, task.status)}
                                                    className="relative transition-transform hover:scale-110"
                                                >
                                                    {task.status === 'Complete' ? (
                                                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <Circle className={`w-6 h-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                                                                }`} />
                                                            {taskOverdue && (
                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                            )}
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                            <td className={`px-6 py-4 ${darkMode ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                <div className="font-medium">{task.task}</div>
                                            </td>
                                            <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                                }`}>
                                                <div className="font-medium">{task.assignedToName}</div>
                                                <div className="text-sm">{task.assignedToEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${taskOverdue
                                                    ? 'bg-red-100 text-red-700'
                                                    : (darkMode ? 'bg-slate-700 text-gray-300' : 'bg-teal-100 text-teal-700')
                                                    }`}>
                                                    {formatDate(task.deadline)}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode
                                                    ? 'bg-purple-600/20 text-purple-300'
                                                    : 'bg-teal-100 text-teal-700'
                                                    }`}>
                                                    {subtasks[task._id]?.length || 0} subtasks
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditTask(task)}
                                                        className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-teal-100'
                                                            }`}
                                                        title="Edit"
                                                    >
                                                        <Edit2 className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-teal-600'
                                                            }`} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(task._id)}
                                                        className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-100'
                                                            }`}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className={`w-4 h-4 ${darkMode ? 'text-red-400' : 'text-red-600'
                                                            }`} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTaskBoard;