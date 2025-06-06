import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export interface User {
  userId?: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers, { getState }) => {
      try {
        // Set content type
        headers.set("Content-Type", "application/json");
        
        // Add authentication
        const session = await fetchAuthSession();
        const { accessToken } = session.tokens ?? {};
        
        if (accessToken) {
          headers.set("Authorization", `Bearer ${accessToken}`);
        }
        
        console.log("Headers prepared:", {
          baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
          hasAuth: !!accessToken,
        });
        
        return headers;
      } catch (error) {
        console.error("Error preparing headers:", error);
        return headers;
      }
    },
    // Add response handler for better error handling
    responseHandler: async (response) => {
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("API Response:", { 
          url: response.url, 
          status: response.status, 
          data 
        });
        return data;
      }
      
      const text = await response.text();
      console.log("Non-JSON Response:", { 
        url: response.url, 
        status: response.status, 
        text 
      });
      return text;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams"],
  endpoints: (build) => ({
    getAuthUser: build.query({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const user = await getCurrentUser();
          const session = await fetchAuthSession();
          if (!session) throw new Error("No session found");
          const { userSub } = session;
          const { accessToken } = session.tokens ?? {};

          const userDetailsResponse = await fetchWithBQ(`users/${userSub}`);
          const userDetails = userDetailsResponse.data as User;

          return { data: { user, userSub, userDetails } };
        } catch (error: any) {
          console.error("getAuthUser error:", error);
          return { error: error.message || "Could not fetch user data" };
        }
      },
    }),
    
    getProjects: build.query<Project[], void>({
      query: () => {
        console.log("Fetching projects...");
        return "projects";
      },
      providesTags: ["Projects"],
      transformErrorResponse: (response: any) => {
        console.error("getProjects error:", response);
        return response;
      },
    }),
    
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => {
        console.log("Creating project with data:", project);
        return {
          url: "projects",
          method: "POST",
          body: project,
        };
      },
      invalidatesTags: ["Projects"],
      transformErrorResponse: (response: any) => {
        console.error("createProject error:", response);
        return response;
      },
    }),
    
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => {
        console.log("Fetching tasks for project:", projectId);
        return `tasks?projectId=${projectId}`;
      },
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
      transformErrorResponse: (response: any) => {
        console.error("getTasks error:", response);
        return response;
      },
    }),
    
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => {
        console.log("Fetching tasks for user:", userId);
        return `tasks/user/${userId}`;
      },
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
      transformErrorResponse: (response: any) => {
        console.error("getTasksByUser error:", response);
        return response;
      },
    }),
    
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => {
        console.log("Creating task with data:", task);
        return {
          url: "tasks",
          method: "POST",
          body: task,
        };
      },
      invalidatesTags: ["Tasks"],
      transformErrorResponse: (response: any) => {
        console.error("createTask error:", response);
        return response;
      },
    }),
    
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => {
        console.log("Updating task status:", { taskId, status });
        return {
          url: `tasks/${taskId}/status`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
      transformErrorResponse: (response: any) => {
        console.error("updateTaskStatus error:", response);
        return response;
      },
    }),
    
    getUsers: build.query<User[], void>({
      query: () => {
        console.log("Fetching users...");
        return "users";
      },
      providesTags: ["Users"],
      transformErrorResponse: (response: any) => {
        console.error("getUsers error:", response);
        return response;
      },
    }),
    
    getTeams: build.query<Team[], void>({
      query: () => {
        console.log("Fetching teams...");
        return "teams";
      },
      providesTags: ["Teams"],
      transformErrorResponse: (response: any) => {
        console.error("getTeams error:", response);
        return response;
      },
    }),
    
    search: build.query<SearchResults, string>({
      query: (query) => {
        console.log("Searching for:", query);
        return `search?query=${query}`;
      },
      transformErrorResponse: (response: any) => {
        console.error("search error:", response);
        return response;
      },
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
} = api;