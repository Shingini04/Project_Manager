import { Task } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      case "Backlog":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Work In Progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow dark:bg-dark-secondary dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority || "")}`}>
              {task.priority}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status || "")}`}>
              {task.status}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          ID: {task.id}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {task.tags.split(",").map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Start Date:</span>
          <p className="text-gray-600 dark:text-gray-400">
            {task.startDate ? format(new Date(task.startDate), "MMM dd, yyyy") : "Not set"}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Due Date:</span>
          <p className="text-gray-600 dark:text-gray-400">
            {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "Not set"}
          </p>
        </div>
      </div>

      {/* Team */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Author:</span>
          <p className="text-gray-600 dark:text-gray-400">
            {task.author ? task.author.username : "Unknown"}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Assignee:</span>
          <p className="text-gray-600 dark:text-gray-400">
            {task.assignee ? task.assignee.username : "Unassigned"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;