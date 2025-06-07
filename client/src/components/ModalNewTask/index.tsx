import Modal from "@/components/Modal";
import { Priority, Status, useCreateTaskMutation, useGetAuthUserQuery } from "@/state/api";
import React, { useState } from "react";
import { formatISO } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { data: currentUser } = useGetAuthUserQuery({});
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(Status.ToDo);
    setPriority(Priority.Medium);
    setTags("");
    setStartDate("");
    setDueDate("");
    setProjectId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      const taskData: any = {
        title,
        description: description || undefined,
        status,
        priority,
        tags: tags || undefined,
        projectId: id !== null ? Number(id) : Number(projectId),
        authorUserId: currentUser?.userDetails?.userId,
      };

      // Only add dates if they are provided
      if (startDate) {
        taskData.startDate = formatISO(new Date(startDate), {
          representation: "complete",
        });
      }

      if (dueDate) {
        taskData.dueDate = formatISO(new Date(dueDate), {
          representation: "complete",
        });
      }

      await createTask(taskData).unwrap();
      
      // Reset form and close modal on success
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const isFormValid = () => {
    return title.trim() !== "" && (id !== null || projectId.trim() !== "");
  };

  const inputStyles =
    "w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white";

  const selectStyles =
    "w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
      <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            className={inputStyles}
            placeholder="Enter task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              className={selectStyles}
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value={Status.ToDo}>To Do</option>
              <option value={Status.WorkInProgress}>Work In Progress</option>
              <option value={Status.UnderReview}>Under Review</option>
              <option value={Status.Completed}>Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              className={selectStyles}
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value={Priority.Urgent}>Urgent</option>
              <option value={Priority.High}>High</option>
              <option value={Priority.Medium}>Medium</option>
              <option value={Priority.Low}>Low</option>
              <option value={Priority.Backlog}>Backlog</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Enter tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {id === null && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project ID *
            </label>
            <input
              type="number"
              className={inputStyles}
              placeholder="Enter project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </div>
          ) : (
            "Create Task"
          )}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;