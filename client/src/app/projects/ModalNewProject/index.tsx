import Modal from "@/components/Modal";
import { useCreateProjectMutation } from "@/state/api";
import React, { useState } from "react";
import { formatISO } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ModalNewProject = ({ isOpen, onClose }: Props) => {
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => {
    setProjectName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      const projectData: any = {
        name: projectName,
        description: description || undefined,
      };

      // Only add dates if they are provided
      if (startDate) {
        projectData.startDate = formatISO(new Date(startDate), {
          representation: "complete",
        });
      }

      if (endDate) {
        projectData.endDate = formatISO(new Date(endDate), {
          representation: "complete",
        });
      }

      await createProject(projectData).unwrap();
      
      // Reset form and close modal on success
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  const isFormValid = () => {
    return projectName.trim() !== "";
  };

  const inputStyles =
    "w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Project">
      <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            className={inputStyles}
            placeholder="Enter project description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
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
              End Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

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
            "Create Project"
          )}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewProject;