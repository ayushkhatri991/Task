import { useEffect, useState } from "react";
import { getAllTasks } from "../api/tasks";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Tasks" />
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">📋 My Tasks</h1>
              <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? "s" : ""} assigned to you</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {["all", "pending", "in-progress", "completed"].map((f) => (
              <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f}
                {" "}
                <span style={{ opacity: 0.7 }}>
                  ({f === "all" ? tasks.length : tasks.filter((t) => t.status === f).length})
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="spinner-page"><div className="spinner" /><span>Loading your tasks...</span></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No tasks in this category</h3>
              <p>Your assigned tasks will show up here</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
              {filtered.map((task) => (
                <TaskCard key={task._id} task={task} onRefresh={fetchTasks} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
