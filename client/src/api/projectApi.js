import api from "./axios";

export const createProjectApi = (data) => api.post("/projects", data);
export const getProjectsApi = () => api.get("/projects");
export const getProjectByIdApi = (id) => api.get(`/projects/${id}`);
export const addMemberApi = (id, data) => api.put(`/projects/${id}/add-member`, data);
export const removeMemberApi = (id, data) =>
  api.delete(`/projects/${id}/remove-member`, { data });
export const deleteProjectApi = (id) => api.delete(`/projects/${id}`);
