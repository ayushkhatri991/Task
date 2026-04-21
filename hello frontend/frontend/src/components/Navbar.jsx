import { useAuth } from "../context/AuthContext";

export default function Navbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="navbar" style={{ position: "relative" }}>
      <h1 className="navbar-title">{title}</h1>
      
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
        

        <span className={`navbar-badge ${user?.role === "admin" ? "badge-admin" : "badge-employee"}`}>
          {user?.role}
        </span>
      </div>
    </header>
  );
}
