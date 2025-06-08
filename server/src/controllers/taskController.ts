import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tasks: ${error.message}` });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      projectId,
      authorUserId,
    } = req.body;

    console.log("Received task data:", req.body);

    // Validate required fields
    if (!title || !projectId || !authorUserId) {
      res.status(400).json({ 
        message: "Missing required fields: title, projectId, and authorUserId are required" 
      });
      return;
    }

    // Create task data object with only the fields we need
    const taskData: any = {
      title: title.trim(),
      status: status || "To Do",
      priority: priority || "Medium",
      projectId: Number(projectId),
      authorUserId: Number(authorUserId),
    };

    // Add optional fields only if they exist and have values
    if (description && description.trim()) {
      taskData.description = description.trim();
    }
    
    if (tags && tags.trim()) {
      taskData.tags = tags.trim();
    }
    
    if (startDate) {
      taskData.startDate = new Date(startDate);
    }
    
    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }

    console.log("Creating task with processed data:", taskData);

    const newTask = await prisma.task.create({
      data: taskData,
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });

    console.log("Task created successfully:", newTask);
    res.status(201).json(newTask);
  } catch (error: any) {
    console.error("Error creating task:", error);
    res
      .status(500)
      .json({ message: `Error creating a task: ${error.message}` });
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};