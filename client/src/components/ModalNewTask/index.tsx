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
  const [status] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority(Priority.Medium);
    setTags("");
    setStartDate("");
    setDueDate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      const taskData: any = {
        title: title.trim(),
        status: "To Do",
        priority,
        projectId: id ? Number(id) : 1,
        authorUserId: currentUser?.userDetails?.userId || 1,
      };

      // Add optional fields only if they have values
      if (description.trim()) {
        taskData.description = description.trim();
      }
      
      if (tags.trim()) {
        taskData.tags = tags.trim();
      }

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

      console.log("Creating task with data:", taskData);

      await createTask(taskData).unwrap();
      
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  const selectStyles =
    "w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        {/* Task Title - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

        {/* Description - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <textarea
            className={inputStyles}
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Status - Fixed to "To Do" */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <div className={`${inputStyles} bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}>
            To Do
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            className={selectStyles}
            value={priority}
            onChange={(e) => setPriority(Priority[e.target.value as keyof typeof Priority])}
          >
            <option value={Priority.Urgent}>Urgent</option>
            <option value={Priority.High}>High</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Backlog}>Backlog</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="e.g. frontend, urgent, bug"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
        
        {/* Submit Button */}
        <button
          type="submit"
          className={`mt-6 flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            !title.trim() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;