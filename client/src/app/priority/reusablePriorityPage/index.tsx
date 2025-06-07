"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Priority,
  Task,
  useGetAuthUserQuery,
  useGetTasksByUserQuery,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";

type Props = {
  priority: Priority;
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 200,
  },
  {
    field: "description",
    headerName: "Description",
    width: 300,
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 100,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 150,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.value?.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value?.username || "Unassigned",
  },
];

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const { data: currentUser } = useGetAuthUserQuery({});
  const userId = currentUser?.userDetails?.userId ?? null;
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserQuery(userId || 0, {
    skip: userId === null,
  });

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const filteredTasks = tasks?.filter(
    (task: Task) => task.priority === priority,
  );

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isTasksError) return (
    <div className="m-5 p-4">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error fetching tasks. Please try again later.</p>
      </div>
    </div>
  );

  return (
    <div className="m-5 p-4">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      <Header
        name={`${priority} Priority Tasks`}
        buttonComponent={
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add Task
          </button>
        }
      />
      <div className="mb-6 flex justify-start">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              view === "list" 
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            onClick={() => setView("list")}
          >
            List View
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              view === "table" 
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            onClick={() => setView("table")}
          >
            Table View
          </button>
        </div>
      </div>

      {!filteredTasks || filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No {priority.toLowerCase()} priority tasks found.</p>
        </div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow">
          <DataGrid
            rows={filteredTasks}
            columns={columns}
            checkboxSelection
            getRowId={(row) => row.id}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
            autoHeight
          />
        </div>
      )}
    </div>
  );
};

export default ReusablePriorityPage;