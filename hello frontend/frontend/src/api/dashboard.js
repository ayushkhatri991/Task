import API from "./axios";

export const getAdminStats = () => API.get("/dashboard/admin-stats");
