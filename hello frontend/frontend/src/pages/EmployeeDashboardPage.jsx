import { useEffect, useState } from "react";
import { getAllTasks } from "../api/tasks";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    setLoading(true);
    getAllTasks()
      .then((res) => {
        const all = res.data.tasks || [];
        const mine = all.filter((t) => t.assignedTo?._id === user?._id || t.assignedTo === user?._id);
        setTasks(mine);
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Dashboard" />
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">👋 Hi, {user?.name?.split(" ")[0]}!</h1>
              <p className="page-subtitle">Here&apos;s your task overview for today</p>
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card purple">
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--gradient-purple)" }} />
              <div className="stat-icon purple">📋</div>
              <div className="stat-value">{tasks.length}</div>
              <div className="stat-label">Total Assigned</div>
            </div>
            <div className="stat-card amber">
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--gradient-amber)" }} />
              <div className="stat-icon amber">⏳</div>
              <div className="stat-value">{pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card cyan">
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #0891b2, #06b6d4)" }} />
              <div className="stat-icon cyan">⚙️</div>
              <div className="stat-value">{inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card emerald">
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--gradient-success)" }} />
              <div className="stat-icon emerald">✅</div>
              <div className="stat-value">{completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: "2rem" }}>🔥 Recent Tasks</div>

          {loading ? (
            <div className="spinner-page"><div className="spinner" /></div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <h3>No tasks assigned yet</h3>
              <p>Tasks will appear here once your admin assigns them to you</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
              {tasks.slice(0, 4).map((task) => (
                <TaskCard key={task._id} task={task} onRefresh={fetchTasks} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
