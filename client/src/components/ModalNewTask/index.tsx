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
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(Status.ToDo);
    setPriority(Priority.Medium);
    setTags("");
    setStartDate("");
    setDueDate("");
    setAssignedUserId("");
    setProjectId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    // Determine project ID
    const finalProjectId = id ? Number(id) : (projectId ? Number(projectId) : 1);
    
    // Determine author user ID
    const authorUserId = currentUser?.userDetails?.userId || 1;

    try {
      const taskData: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        tags: tags.trim() || undefined,
        projectId: finalProjectId,
        authorUserId: authorUserId,
      };

      // Add dates if provided
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

      // Add assigned user if provided
      if (assignedUserId && assignedUserId.trim()) {
        taskData.assignedUserId = parseInt(assignedUserId);
      }

      console.log("Creating task with data:", taskData);

      await createTask(taskData).unwrap();
      
      // Reset form and close modal on success
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
    "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
      <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
        <input
          type="text"
          className={inputStyles}
          placeholder="Task Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <textarea
          className={inputStyles}
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <select
            className={selectStyles}
            value={status}
            onChange={(e) =>
              setStatus(Status[e.target.value as keyof typeof Status])
            }
          >
            <option value={Status.ToDo}>To Do</option>
            <option value={Status.WorkInProgress}>Work In Progress</option>
            <option value={Status.UnderReview}>Under Review</option>
            <option value={Status.Completed}>Completed</option>
          </select>
          
          <select
            className={selectStyles}
            value={priority}
            onChange={(e) =>
              setPriority(Priority[e.target.value as keyof typeof Priority])
            }
          >
            <option value={Priority.Urgent}>Urgent</option>
            <option value={Priority.High}>High</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Backlog}>Backlog</option>
          </select>
        </div>
        
        <input
          type="text"
          className={inputStyles}
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={inputStyles}
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className={inputStyles}
            placeholder="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        
        <input
          type="number"
          className={inputStyles}
          placeholder="Assigned User ID (optional)"
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
          min="1"
        />
        
        {id === null && (
          <input
            type="number"
            className={inputStyles}
            placeholder="Project ID (default: 1)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            min="1"
          />
        )}
        
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
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