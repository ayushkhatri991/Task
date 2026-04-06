import API from "./axios";

export const getAllUsers = () => API.get("/users");
export const getUserById = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post("/users/create", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
