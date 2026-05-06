import api from "./axios";

export const createTaskApi = (data) => api.post("/tasks", data);
export const getTasksByProjectApi = (projectId) =>
  api.get(`/tasks/${projectId}`);
export const updateTaskApi = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTaskApi = (id) => api.delete(`/tasks/${id}`);
