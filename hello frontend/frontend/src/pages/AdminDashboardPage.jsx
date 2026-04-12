import { useEffect, useState } from "react";
import { getAdminStats, getUserTaskStats } from "../api/dashboard";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getUserTaskStats()])
      .then(([adminRes, userRes]) => {
        setStats(adminRes.data);
        setUserStats(userRes.data.stats || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Admin Dashboard" />
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">📊 Overview</h1>
              <p className="page-subtitle">Real-time snapshot of your task management system</p>
            </div>
          </div>

          {loading ? (
            <div className="spinner-page"><div className="spinner" /><span>Loading stats...</span></div>
          ) : (
            <>
              <div className="stat-grid">
                <StatCard label="Total Tasks" value={stats?.totalTasks} icon="📋" color="purple" />
                <StatCard label="Completed" value={stats?.completed} icon="✅" color="emerald" />
                <StatCard label="In Progress" value={stats?.inProgress} icon="⚙️" color="cyan" />
                <StatCard label="Pending" value={stats?.pending} icon="⏳" color="amber" />
                <StatCard label="Employees" value={stats?.employees} icon="👥" color="rose" />
              </div>

              <div className="card" style={{ marginTop: "2rem" }}>
                <div className="section-title">👥 Employee Performance Overview</div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Assigned Tasks</th>
                        <th>Completed Tasks</th>
                        <th>Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userStats.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                            No employee stats available
                          </td>
                        </tr>
                      ) : userStats.map((u) => {
                        const percentage = u.totalAssigned > 0 
                          ? Math.round((u.totalCompleted / u.totalAssigned) * 100) 
                          : 0;
                        
                        return (
                          <tr key={u._id || u.email}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <div className="sidebar-user-avatar" style={{ width: 30, height: 30, fontSize: "0.75rem" }}>
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-pending">{u.totalAssigned}</span>
                            </td>
                            <td>
                              <span className="badge badge-completed">{u.totalCompleted}</span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                <div style={{ flex: 1, height: "6px", background: "var(--bg-secondary)", borderRadius: "10px", overflow: "hidden" }}>
                                  <div style={{ 
                                    width: `${percentage}%`, 
                                    height: "100%", 
                                    background: percentage > 70 ? "var(--emerald)" : percentage > 30 ? "var(--amber)" : "var(--rose)",
                                    transition: "width 0.5s ease"
                                  }} />
                                </div>
                                <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "60px" }}>
                                  {percentage}% <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({u.totalCompleted}/{u.totalAssigned})</span>
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
