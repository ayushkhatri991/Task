import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const adminLinks = [
  { to: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/admin/tasks", icon: "✅", label: "Tasks" },
  { to: "/admin/queue", icon: "🔢", label: "Priority Queue" },
  { to: "/admin/users", icon: "👥", label: "Users" },
];

const employeeLinks = [
  { to: "/employee/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/employee/tasks", icon: "📋", label: "My Tasks" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === "admin" ? adminLinks : employeeLinks;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <span className="sidebar-logo-text">TaskFlow</span>
      </div>

      <span className="sidebar-section-label">Navigation</span>

      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <span className="icon">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}

      <div className="sidebar-divider" />

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">{user?.role}</div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}
