import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Navbar({ title }) {
  const { user } = useAuth();
  const { unreadCount, markAsRead, notifications } = useSocket();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && unreadCount > 0) {
      markAsRead();
    }
  };

  return (
    <header className="navbar" style={{ position: "relative" }}>
      <h1 className="navbar-title">{title}</h1>
      
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
        
        <div className="nav-notification-container" style={{ position: "relative" }}>
          <button 
            className="nav-bell-btn" 
            onClick={handleBellClick}
            style={{ 
              background: "transparent", 
              border: "none", 
              fontSize: "1.2rem", 
              cursor: "pointer", 
              position: "relative" 
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="white" 
              stroke="black" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ display: "block" }}
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="nav-badge" style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                background: "var(--primary)",
                color: "white",
                fontSize: "0.6rem",
                padding: "2px 6px",
                borderRadius: "10px",
                fontWeight: "bold"
              }}>
                {unreadCount}
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div className="nav-dropdown" style={{
              position: "absolute",
              top: "120%",
              right: 0,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              width: "300px",
              maxHeight: "400px",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              zIndex: 100,
              padding: "1rem"
            }}>
              <h3 style={{ fontSize: "0.9rem", margin: "0 0 1rem 0", color: "var(--text-muted)" }}>Notifications</h3>
              {notifications.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>No notifications</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {notifications.map((n, i) => (
                    <div key={i} style={{ 
                      fontSize: "0.85rem", 
                      padding: "0.8rem", 
                      background: "rgba(255,255,255,0.03)", 
                      borderRadius: "6px" 
                    }}>
                      {n.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <span className={`navbar-badge ${user?.role === "admin" ? "badge-admin" : "badge-employee"}`}>
          {user?.role}
        </span>
      </div>
    </header>
  );
}
