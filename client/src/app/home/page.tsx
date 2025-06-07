"use client";

import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "@/state/api";
import React from "react";
import { useAppSelector } from "../redux";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
  { field: "dueDate", headerName: "Due Date", width: 150 },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const HomePage = () => {
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksQuery({ projectId: parseInt("1") });
  const { data: projects, isLoading: isProjectsLoading } =
    useGetProjectsQuery();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (tasksLoading || isProjectsLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (tasksError || !tasks || !projects) return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
      <Header name="Project Management Dashboard" />
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error fetching data. Please try again later.</p>
      </div>
    </div>
  );

  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  const statusCount = projects.reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? "Completed" : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: "#3B82F6",
        barGrid: "#374151",
        text: "#F9FAFB",
      }
    : {
        bar: "#3B82F6",
        barGrid: "#E5E7EB",
        text: "#111827",
      };

  return (
    <div className="container h-full w-[100%] bg-gray-50 dark:bg-gray-900 p-8">
      <Header name="Project Management Dashboard" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Task Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDistribution}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.barGrid}
              />
              <XAxis dataKey="name" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill={chartColors.bar} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Project Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                dataKey="count" 
                data={projectStatus} 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                label
              >
                {projectStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-secondary md:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Recent Tasks
          </h3>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={tasks}
              columns={taskColumns}
              checkboxSelection
              loading={tasksLoading}
              getRowClassName={() => "data-grid-row"}
              getCellClassName={() => "data-grid-cell"}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
              autoHeight
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;