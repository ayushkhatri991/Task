import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import { getUnreadNotifications, markNotificationsAsRead } from "../api/notification";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) socket.disconnect();
      return;
    }

    const newSocket = io("http://localhost:4001");
    setSocket(newSocket);

    newSocket.emit("join", user._id);

    newSocket.on("newTask", (data) => {
      toast.success(data.message, {
        icon: "🔔",
        duration: 5000,
      });
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    getUnreadNotifications().then(res => {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.notifications.length);
    }).catch(console.error);

    return () => newSocket.disconnect();
  }, [user]);

  const markAsRead = async () => {
    try {
      await markNotificationsAsRead();
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
