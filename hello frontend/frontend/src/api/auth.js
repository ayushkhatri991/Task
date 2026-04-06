import API from "./axios";

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const logout = () => API.post("/auth/logout");
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const changePassword = (token, data) => API.post(`/auth/change-password/${token}`, data);
