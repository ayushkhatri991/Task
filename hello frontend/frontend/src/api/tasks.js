import API from "./axios";

export const getAllTasks = () => API.get("/task");
export const getPriorityQueue = () => API.get("/task/queue");
export const assignTask = (data) => API.post("/task/assign", data);
export const trackTask = (taskId) => API.get(`/task/${taskId}/track`);
export const updateTaskStatus = (id, data) => API.put(`/task/${id}`, data);
