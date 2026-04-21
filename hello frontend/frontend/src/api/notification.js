import API from "./axios";

export const getUnreadNotifications = () => API.get("/notifications/unread");
export const markNotificationsAsRead = () => API.post("/notifications/read");
