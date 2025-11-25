import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { FaEdit, FaChevronDown, FaChevronUp, FaRegEye } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import Theame from './UseTheame'


const NewGiver = () => {

  const {currentMode}=Theame()

  const [allUsers, setAllUsers] = useState([]);
  const [openUserIds, setOpenUserIds] = useState([]);
  const [tasksByMe, setAssignByMe] = useState([]);
  const [taskDetail, setTaskDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState(false);

  const [editTaskId, setEditTaskId] = useState("");
  const [editTask, setEditTask] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [openTaskIds, setOpenTaskIds] = useState([]);

  const [updateSubTask, setUpdateTask] = useState(false);
  const [editSubTaskId, setEditSubTaskId] = useState(null);
  const [editesubStatus, setEditeSubstatus] = useState("");

  const [subTaskForm, setsubTaskForm] = useState({
    subTaskName: "",
    subTaskDesc: "",
    SubTaskEndDate: "",
  });

  const handleOnChangeSubTask = (e) => {
    setsubTaskForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [subTaskData, setSubtaskData] = useState({});

  const [form, setForm] = useState({
    taskname: "",
    deadLine: "",
    assignTo: "",
  });

  // const theame=localStorage.getItem("mode");

  const token = localStorage.getItem("userToken");

  const handleOnChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get("http://localhost:7800/users/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const assignTask = await axios.get("http://localhost:7800/task/assignedtome", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignByMe(assignTask.data || []);
    } catch (error) {
      console.error("Error fetching Assigned tasks:", error);
      toast.error("Failed to fetch assigned tasks");
    }
  };

  useEffect(() => {
    if (token) {
      fetchAssignedTasks();
      fetchAllUsers();
    }
  }, [token]);

  const toggleForm = (userId) => {
    setOpenUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e, userId) => {
    e.preventDefault();
    if (!form.taskname || !form.deadLine) {
      toast.error("Please fill all fields before submitting!");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:7800/task/newTask",
        {
          task: form.taskname,
          deadlineDate: form.deadLine,
          assignedTo: userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message || "Task created");
      setForm({ taskname: "", deadLine: "", assignTo: "" });
      setOpenUserIds((prev) => prev.filter((id) => id !== userId));
      fetchAssignedTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Error creating task!");
    }
  };
  const showTaskDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:7800/task/getOne/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaskDetail(res.data.task);
      setIsModalOpen(true);
      await showSubTaskData(id);
    } catch (error) {
      console.log("Error fetching task details", error);
      toast.error("Failed to fetch task details");
    }
  };

  const DeleteTask = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:8080/task/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Task Deletion Successful!");
      setIsModalOpen(false);
      setTaskDetail(null);
      fetchAssignedTasks();
    } catch (error) {
      console.log("error to delete task", error);
      toast.error("Failed to delete task");
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:8080/task/taskUpdate/${editTaskId}`,
        {
          task: editTask,
          status: editStatus,
          deadlineDate: editDeadline,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Task Updated Successfully");
      setUpdateForm(false);
      fetchAssignedTasks();
    } catch (error) {
      console.log("Error while updating task details:", error);
      toast.error("Failed to update task");
    }
  };

  const CreateSubTask = async (e) => {
    e.preventDefault();
    if (!taskDetail || !taskDetail[0]?._id) {
      toast.error("No parent task selected");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:8080/sabTask/add/${taskDetail[0]._id}`,
        {
          subtaskName: subTaskForm.subTaskName,
          subTaskDesc: subTaskForm.subTaskDesc,
          subtaskEndDate: subTaskForm.SubTaskEndDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message || "Subtask created successfully!");
      setsubTaskForm({ subTaskName: "", subTaskDesc: "", SubTaskEndDate: "" });
      await showSubTaskData(taskDetail[0]._id);
    } catch (error) {
      console.log("Error while creating subtask!", error);
      toast.error("Failed to create subtask!");
    }
  };

  
  const showSubTaskData = async (taskid) => {
    try {
      const res = await axios.get(`http://localhost:7800/sabTask/${taskid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubtaskData((prev) => ({
        ...prev,
        [taskid]: res.data.subTasks || [],
      }));
    } catch (error) {
      console.error("Error fetching SubTasks:", error);
      toast.error("Failed to load subtasks");
    }
  };

  const handleEditSubTask = (subTask) => {
    setEditSubTaskId(subTask._id);
    setsubTaskForm({
      subTaskName: subTask.SubTaskName,
      subTaskDesc: subTask.SubTaskDiscription,
      SubTaskEndDate: subTask.SubTaskDeadLine?.split("T")[0] || "",
    });
    setUpdateTask(true);
  };

  const deleteSubTask = async (subtask_id) => {
    try {
      const res = await axios.delete(`http://localhost:7800/sabTask/delete/${subtask_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message || "Subtask deleted");
      if (taskDetail && taskDetail[0]?._id) {
        await showSubTaskData(taskDetail[0]._id);
      } else {
        const keys = Object.keys(subTaskData);
        for (const k of keys) {
          await showSubTaskData(k);
        }
      }
    } catch (error) {
      console.log("Error to delete subtask", error);
      toast.error("Failed to delete subtask");
    }
  };

  const handleUpdateSubTask = async (e) => {
    e.preventDefault?.();
    if (!editSubTaskId) {
      toast.error("No subtask selected to update");
      return;
    }
    try {
      const res = await axios.put(
        `http://localhost:7800/sabTask/update/${editSubTaskId}`,
        {
          subtaskName: subTaskForm.subTaskName,
          subTaskDesc: subTaskForm.subTaskDesc,
          subtaskEndDate: subTaskForm.SubTaskEndDate,
          SubTaskStatus: editesubStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Subtask updated");
      setsubTaskForm({ subTaskName: "", subTaskDesc: "", SubTaskEndDate: "" });
      setUpdateTask(false);
      if (taskDetail && taskDetail[0]?._id) {
        await showSubTaskData(taskDetail[0]._id);
      }
    } catch (error) {
      console.log("Error updating subtask", error);
      toast.error("Failed to update subtask");
    }
  };

  // DND
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const dragged = active.data.current;
    const droppedOn = over.data.current;

    if (dragged?.type === "task" && droppedOn?.type === "user") {
      const taskId = dragged.task._id;
      const newUserId = droppedOn.user._id;

      if (dragged.task.assignedTo?._id === newUserId) return;

      try {
        await axios.put(
          `http://localhost:8080/task/reassign/${taskId}`,
          { assignedTo: newUserId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Task reassigned!");
        fetchAssignedTasks();
      } catch (err) {
        console.error("Error reassigning task:", err);
        toast.error("Failed to reassign task");
      }
    }

    if (dragged?.type === "subtask" && droppedOn?.type === "task-dropzone") {
      const subTaskId = dragged.subTask._id;
      const newTaskId = droppedOn.task._id;

      if (dragged.subTask.parentTaskId === newTaskId) return;


      try {
        const res = await axios.put(
          `http://localhost:8080/sabTask/reassignSubtask/${subTaskId}`,
          { parentTaskId: newTaskId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(res.data.message || "Subtask reassigned successfully!");
        await fetchAssignedTasks();
        await showSubTaskData(newTaskId);
      } catch (err) {
        console.error("Error reassigning subtask:", err);
        toast.error("Failed to reassign subtask");
      }
    }
  };

  const DraggableTask = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: task._id,
      data: { type: "task", task },
    });

    const style = {
      transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      cursor: "grab",
    };

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <div className="bg-white/20 p-2 rounded-md text-sm text-white mt-2 hover:bg-white/30 transition-all">
          {task.task}
        </div>
      </div>
    );
  };

  const DroppableUser = ({ user, children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: user._id,
      data: { type: "user", user },
    });

    return (
      <div
        ref={setNodeRef}
        className={`border border-white rounded-2xl p-5 w-80 flex-shrink-0 shadow-lg transition-all duration-300 ${
          isOver ? "bg-green-400/30 scale-[1.02]" : "bg-white/10"
        }`}
      >
        {children}
      </div>
    );
  };

  const DraggableSubTask = ({ subTask }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: subTask._id,
      data: { type: "subtask", subTask },
    });

    const style = {
      transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      cursor: "grab",
    };

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className="border border-gray-300 rounded-md p-2 mb-2 bg-gray-100 hover:bg-gray-200 transition"
      >
        <p className="truncate font-semibold">{subTask.SubTaskName}</p>
        <p className="text-xs">
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              subTask.subTaskStatus === "Pending" ? "bg-yellow-400 text-black" : "bg-green-500 text-white"
            }`}
          >
            {subTask.subTaskStatus || "Pending"}
          </span>
        </p>
      </div>
    );
  };

  const DroppableTask = ({ task, children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: task._id,
      data: { type: "task-dropzone", task },
    });

    return (
      <div ref={setNodeRef} className={`p-2 rounded-md transition ${isOver ? "bg-green-200/50 border border-green-500" : ""}`}>
        {children}
      </div>
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={`min-h-[90vh] p-8 text-white relative ${currentMode==="light"?" bg-gradient-to-b from-teal-500 to-teal-700":"bg-black text-white"}`}>
        <h2 className="text-3xl font-bold mb-8 text-center drop-shadow-lg">Assign Tasks to Users</h2>

        <DndContext onDragEnd={handleDragEnd}>
          <div
            className="flex gap-6 overflow-x-auto pb-6 items-start scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 h-[78vh]"
             style={{ scrollBehavior: "smooth", whiteSpace: "nowrap" }}
             >
            {allUsers.map((user) => {
              const userTasks = tasksByMe.filter((task) => task.assignedTo?._id === user._id);
              return (
                <DroppableUser key={user._id} user={user}>
                  <h3 className={`text-xl font-semibold mb-3 text-black text-center ${currentMode==="light"?"text-black":" text-white"} `}>{user.name}</h3>

                  <button
                    onClick={() => toggleForm(user._id)}
                    className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg w-full mb-3 text-white font-medium transition-all"
                  >
                    {openUserIds.includes(user._id) ? "Close Form" : "➕ Add Task"}
                  </button>

                  {openUserIds.includes(user._id) && (
                    <form onSubmit={(e) => handleSubmit(e, user._id)}>
                      <label className="block mb-1 text-sm font-semibold text-black">Enter Task Details</label>
                      <input
                        type="text"
                        name="taskname"
                        value={form.taskname}
                        onChange={handleOnChange}
                        className="border-b border-gray-300 w-full mb-3 text-black outline-none bg-transparent"
                        placeholder="Task name"
                      />
                      <label className="block mb-1 text-sm font-semibold text-black">Select Task Deadline</label>
                      <input
                        type="date"
                        name="deadLine"
                        value={form.deadLine}
                        onChange={handleOnChange}
                        className="border-b border-gray-300 w-full mb-3 text-black outline-none bg-transparent"
                      /> <br />
                      <button type="submit" className="mt-2 bg-green-500 hover:bg-green-600 text-white w-full py-1 rounded-md">
                        Submit
                      </button>
                    </form>
                  )}

                  <div className="mt-4">
                    <h4 className={`text-md font-semibold text-black mb-2 underline ${currentMode==="light"?"text-black":"text-white"}`}>Assigned Tasks:</h4>
                    {userTasks.length > 0 ? (
                      userTasks.map((task) => (
                        <div key={task._id} className="border border-gray-300 rounded-lg p-2 mb-3 text-black shadow-md">
                          <div className="flex w-full">
                            <div className="w-8/10">
                              <DraggableTask task={task} />
                            </div>
                            <div className="flex justify-end">
                              <button onClick={() => showTaskDetails(task._id)} className="text-lg text-black px-3 py-1 rounded-lg transition-all cursor-pointer">
                                <span className="text-2xl"><IoIosAddCircleOutline /></span>
                              </button>

                              <button
                                onClick={() => {
                                  if (openTaskIds.includes(task._id)) {
                                    setOpenTaskIds((prev) => prev.filter((id) => id !== task._id));
                                  } else {
                                    showSubTaskData(task._id);
                                    setOpenTaskIds((prev) => [...prev, task._id]);
                                  }
                                }}
                                className="text-lg text-gray-700 hover:text-gray-900 transition cursor-pointer"
                              >
                                {openTaskIds.includes(task._id) ? <FaChevronUp /> : <FaChevronDown />}
                              </button>
                            </div>
                          </div>
                          
                          {openTaskIds.includes(task._id) && (
                            <DroppableTask task={task}>
                              <div className="mt-2 pl-4 border-l-2 border-gray-400">
                                {subTaskData[task._id] && subTaskData[task._id].length > 0 ? (
                                  subTaskData[task._id].map((subTask) => <DraggableSubTask key={subTask._id} subTask={subTask} />)
                                ) : (
                                  <p className="text-gray-500 text-sm italic">No subtasks added yet.</p>
                                )}
                              </div>
                            </DroppableTask>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-300">No tasks assigned yet.</p>
                    )}
                  </div>
                </DroppableUser>
              );
            })}
          </div>
        </DndContext>
        {isModalOpen && taskDetail && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex pt-1 justify-center z-50">
            <div className="bg-[#1e1f22] text-gray-100 rounded-xl shadow-2xl w-4/5 h-[70vh] flex overflow-hidden relative">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setShowSubTasks(false);
                  setSubtaskData((prev) => {
                    if (!taskDetail || !taskDetail[0]) return prev;
                    const copy = { ...prev };
                    delete copy[taskDetail[0]._id];
                    return copy;
                  });
                  setTaskDetail(null);
                }}
                className="absolute top-3 right-4 text-xl cursor-pointer"
              >
                ✖
              </button>

              <div className="w-6/10 p-3 border-r border-gray-700">
                <h3 className="text-xl font-bold mb-1 text-teal-500 text-center">➕ Create Sub-Task</h3>
                <form onSubmit={updateSubTask ? handleUpdateSubTask : CreateSubTask} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-300">Sub-Task Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#2a2b2f] border border-gray-600 rounded-md p-2 outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter sub-task name"
                      name="subTaskName"
                      value={subTaskForm.subTaskName}
                      onChange={handleOnChangeSubTask}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300">Description</label>
                    <textarea
                      rows="4"
                      className="w-full bg-[#2a2b2f] border border-gray-600 rounded-md p-2 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      placeholder="Add sub-task description..."
                      name="subTaskDesc"
                      value={subTaskForm.subTaskDesc}
                      onChange={handleOnChangeSubTask}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300">Deadline</label>
                    <input
                      type="date"
                      className="w-full bg-[#2a2b2f] border border-gray-600 rounded-md p-2 outline-none focus:ring-2 focus:ring-teal-500"
                      name="SubTaskEndDate"
                      value={subTaskForm.SubTaskEndDate}
                      onChange={handleOnChangeSubTask}
                    />
                  </div>

                  {updateSubTask && (
                    <>
                      <label className="text-gray-300">Update Status</label>
                      <br />
                      <select
                        value={editesubStatus}
                        onChange={(e) => setEditeSubstatus(e.target.value)}
                        className="w-full bg-[#2a2b2f] border border-gray-600 rounded-md p-2 outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </>
                  )}

                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-semibold transition">
                    {updateSubTask ? "Update-SubTask" : "Add Sub-Task"}
                  </button>
                </form>
              </div>

              <div className="w-1/2 p-8 overflow-y-auto h-[65vh]">
                <h3 className="text-2xl font-bold mb-6 text-teal-500 text-center">📝 Task Details</h3>

                <div className="space-y-4 text-sm text-gray-300">
                  <p>
                    <strong className="text-gray-200">Task:</strong> {taskDetail[0].task}
                  </p>

                  <div className="flex justify-between">
                    <p className="inline">
                      <strong className="text-gray-200">Deadline:</strong>{" "}
                      {new Date(taskDetail[0].deadlineDate).toLocaleDateString()}
                    </p>

                    <p className="inline">
                      <strong className="text-gray-200">Status:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          taskDetail[0].status === "Pending" ? "bg-yellow-600 text-black" : "bg-green-600 text-white"
                        }`}
                      >
                        {taskDetail[0].status || "Pending"}
                      </span>
                    </p>
                  </div>

                  <p>
                    <strong className="text-gray-200">Assigned To:</strong> {taskDetail[0].assignedTo?.name || "N/A"}
                  </p>
                </div>

                <div className="mt-8 flex gap-4 justify-end">
                  <button
                    className="rounded-lg transition text-2xl cursor-pointer"
                    onClick={() => {
                      setEditTaskId(taskDetail[0]._id);
                      setEditTask(taskDetail[0].task);
                      setEditDeadline(taskDetail[0].deadlineDate.split("T")[0]);
                      setEditStatus(taskDetail[0].status);
                      setUpdateForm(true);
                      setIsModalOpen(false);
                    }}
                  >
                    <FaEdit />
                  </button>

                  <button className="rounded-lg transition text-2xl cursor-pointer" onClick={() => DeleteTask(taskDetail[0]._id)}>
                    <MdDelete />
                  </button>
                </div>

                <div className="mt-20">
                  <h4 className="flex justify-between text-lg font-semibold mb-3 text-gray-200 border-b border-gray-600 pb-1">
                    <span>Existing Sub-Tasks</span>
                    <button
                      onClick={() => {
                        if (!showSubTasks) {
                          showSubTaskData(taskDetail[0]._id);
                        }
                        setShowSubTasks((prev) => !prev);
                      }}
                    >
                      {showSubTasks ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </h4>

                  <div className="overflow-y-auto">
                    {showSubTasks && (
                      <>
                        {subTaskData[taskDetail[0]._id] && subTaskData[taskDetail[0]._id].length > 0 ? (
                          subTaskData[taskDetail[0]._id].map((subTask, i) => (
                            <div key={i} className="border border-gray-700 rounded-md p-3 mb-2 bg-[#2a2b2f]">
                              <p>
                                <strong>Name:</strong> {subTask.SubTaskName}
                              </p>
                              <p>
                                <strong>Description:</strong> {subTask.SubTaskDiscription}
                              </p>
                              <p>
                                <strong>Status:</strong>{" "}
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    subTask.subTaskStatus === "Pending" ? "bg-yellow-600 text-black" : "bg-green-600 text-white"
                                  }`}
                                >
                                  {subTask.subTaskStatus || "Pending"}
                                </span>
                              </p>
                              <div className="flex gap-2 text-xl justify-end">
                                <button className="cursor-pointer" onClick={() => handleEditSubTask(subTask)}>
                                  <FaEdit />
                                </button>
                                <button className="cursor-pointer" onClick={() => deleteSubTask(subTask._id)}>
                                  <MdDelete />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm italic">No sub-tasks added yet.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {updateForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <form onSubmit={handleUpdateTask} className="bg-white text-black rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-teal-600 text-center">Update Task</h3>
              <label>Task Name</label>
              <input type="text" value={editTask} onChange={(e) => setEditTask(e.target.value)} className="border-b p-2 w-full mb-3 outline-none" />
              <label>Deadline</label>
              <input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="border-b p-2 w-full mb-3 outline-none" />
              <label>Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="border p-2 w-full mb-3">
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setUpdateForm(false)} className="border px-3 py-1 rounded-full hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="border px-3 py-1 rounded-full bg-teal-500 text-white hover:bg-teal-600">
                  Update
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default NewGiver;