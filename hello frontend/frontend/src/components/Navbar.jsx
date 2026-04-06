import { useAuth } from "../context/AuthContext";

export default function Navbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>
      <span className={`navbar-badge ${user?.role === "admin" ? "badge-admin" : "badge-employee"}`}>
        {user?.role}
      </span>
    </header>
  );
}
