import api from "./axios";

export const getDashboardApi = (projectId) =>
  api.get(`/dashboard/${projectId}`);
