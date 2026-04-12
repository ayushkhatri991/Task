import API from "./axios";

export const getAdminStats = () => API.get("/dashboard/admin-stats");
export const getUserTaskStats = () => API.get("/dashboard/user-task-stats");

