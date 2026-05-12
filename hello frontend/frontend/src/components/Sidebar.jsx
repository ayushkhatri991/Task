import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { BarChart3, CheckSquare, ListOrdered, Users, Home, ClipboardList, Zap, LogOut } from "lucide-react";

const adminLinks = [
  { to: "/admin/dashboard", icon: <BarChart3 size={20} />, label: "Dashboard" },
  { to: "/admin/tasks", icon: <CheckSquare size={20} />, label: "Tasks" },
  { to: "/admin/queue", icon: <ListOrdered size={20} />, label: "Priority Queue" },
  { to: "/admin/users", icon: <Users size={20} />, label: "Users" },
];

const employeeLinks = [
  { to: "/employee/dashboard", icon: <Home size={20} />, label: "Dashboard" },
  { to: "/employee/tasks", icon: <ClipboardList size={20} />, label: "My Tasks" },
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
        <div className="sidebar-logo-icon"><Zap size={28} /></div>
        <span className="sidebar-logo-text">Karya Sathi</span>
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

      <div className="sidebar-user" style={{ alignItems: "flex-start", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%" }}>
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button 
          className="btn btn-secondary btn-full btn-sm" 
          onClick={handleLogout} 
          style={{ color: "var(--rose)", borderColor: "rgba(244,63,94,0.2)", background: "rgba(244,63,94,0.05)" }}
        >
          <LogOut size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Logout
        </button>
      </div>
    </aside>
  );
}
