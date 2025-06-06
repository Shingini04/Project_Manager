import Modal from "@/components/Modal";
import { useCreateTaskMutation, useGetAuthUserQuery, Priority, Status } from "@/state/api";
import React, { useState } from "react";
import { formatISO } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id: string; // projectId
};

const ModalNewTask = ({ isOpen, onClose, id }: Props) => {
  const [createTask, { isLoading, error, isError }] = useCreateTaskMutation();
  const { data: authUser } = useGetAuthUserQuery({});
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: Status.ToDo,
    priority: Priority.Medium,
    tags: "",
    startDate: "",
    dueDate: "",
    points: 0,
  });
  
  const [localError, setLocalError] = useState("");

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: Status.ToDo,
      priority: Priority.Medium,
      tags: "",
      startDate: "",
      dueDate: "",
      points: 0,
    });
    setLocalError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setLocalError("Task title is required");
      return;
    }

    if (!authUser?.userDetails?.userId) {
      setLocalError("User authentication required");
      return;
    }

    try {
      setLocalError("");
      
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags.trim() || undefined,
        startDate: formData.startDate ? formatISO(new Date(formData.startDate)) : undefined,
        dueDate: formData.dueDate ? formatISO(new Date(formData.dueDate)) : undefined,
        points: formData.points || undefined,
        projectId: Number(id),
        authorUserId: authUser.userDetails.userId,
        assignedUserId: authUser.userDetails.userId, // Default to current user
      };

      console.log("Submitting task data:", taskData);

      const result = await createTask(taskData).unwrap();

      console.log("Task created successfully:", result);
      resetForm();
      onClose();
      
    } catch (err: any) {
      console.error("Failed to create task:", err);
      
      // Handle different error types
      if (err?.status === 401) {
        setLocalError("Authentication failed. Please log in again.");
      } else if (err?.status === 403) {
        setLocalError("You don't have permission to create tasks in this project.");
      } else if (err?.status === 400) {
        setLocalError(err?.data?.message || "Invalid task data. Please check your inputs.");
      } else if (err?.status >= 500) {
        setLocalError("Server error. Please try again later.");
      } else {
        setLocalError(err?.data?.message || "Failed to create task. Please try again.");
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (localError && field === 'title' && value.trim()) {
      setLocalError("");
    }
  };

  const inputStyles = "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  // Show loading if auth is still being fetched
  if (!authUser && !error) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} name="Create New Task">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading user information...</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} name="Create New Task">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Error Display */}
        {(localError || isError) && (
          <div className="rounded bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">
            {localError || (error as any)?.data?.message || "An error occurred"}
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            Debug: Project ID: {id}, User ID: {authUser?.userDetails?.userId || 'Not loaded'}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className={labelStyles}>
            Task Title *
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Enter task title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            disabled={isLoading}
            required
            maxLength={255}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelStyles}>
            Description
          </label>
          <textarea
            className={inputStyles}
            placeholder="Enter task description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            disabled={isLoading}
            rows={3}
            maxLength={1000}
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyles}>
              Status
            </label>
            <select
              className={inputStyles}
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value as Status)}
              disabled={isLoading}
            >
              <option value={Status.ToDo}>To Do</option>
              <option value={Status.WorkInProgress}>Work In Progress</option>
              <option value={Status.UnderReview}>Under Review</option>
              <option value={Status.Completed}>Completed</option>
            </select>
          </div>
          
          <div>
            <label className={labelStyles}>
              Priority
            </label>
            <select
              className={inputStyles}
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value as Priority)}
              disabled={isLoading}
            >
              <option value={Priority.Low}>Low</option>
              <option value={Priority.Medium}>Medium</option>
              <option value={Priority.High}>High</option>
              <option value={Priority.Urgent}>Urgent</option>
              <option value={Priority.Backlog}>Backlog</option>
            </select>
          </div>
        </div>

        {/* Tags and Points */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyles}>
              Tags
            </label>
            <input
              type="text"
              className={inputStyles}
              placeholder="Enter tags (comma separated)"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              disabled={isLoading}
              maxLength={255}
            />
          </div>
          
          <div>
            <label className={labelStyles}>
              Points
            </label>
            <input
              type="number"
              className={inputStyles}
              placeholder="Enter points"
              value={formData.points}
              onChange={(e) => handleInputChange("points", parseInt(e.target.value) || 0)}
              disabled={isLoading}
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyles}>
              Start Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className={labelStyles}>
              Due Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              disabled={isLoading}
              min={formData.startDate || undefined}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className={`flex-1 flex justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              !formData.title.trim() || isLoading || !authUser?.userDetails?.userId 
                ? "cursor-not-allowed opacity-50" 
                : ""
            }`}
            disabled={!formData.title.trim() || isLoading || !authUser?.userDetails?.userId}
          >
            {isLoading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalNewTask;