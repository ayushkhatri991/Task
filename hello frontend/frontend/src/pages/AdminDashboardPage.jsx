import { useEffect, useState } from "react";
import { getAdminStats } from "../api/dashboard";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats ? [
    { name: "Pending", value: stats.pending, color: "#fbbf24" },
    { name: "In Progress", value: stats.inProgress, color: "#06b6d4" },
    { name: "Completed", value: stats.completed, color: "#10b981" },
  ] : [];

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
                <div className="section-title">📈 Task Distribution</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} barSize={40}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid-2" style={{ marginTop: "1.5rem" }}>
                <div className="card card-glass">
                  <div className="section-title">🤖 Smart Assignment</div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                    <strong style={{ color: "var(--purple-light)" }}>High priority</strong> tasks prioritize completely free employees. Otherwise, tasks are assigned to the least busy active employee by summing pending + in-progress estimated hours per user.
                  </p>
                </div>
                <div className="card card-glass">
                  <div className="section-title">🔢 Priority Queue</div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                    All active tasks are sorted by <strong style={{ color: "var(--cyan)" }}>priority weight</strong> — High (3) → Medium (2) → Low (1) — so critical work is always handled first.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
