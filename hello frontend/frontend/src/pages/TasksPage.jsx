import { useEffect, useState } from "react";
import { getAllTasks } from "../api/tasks";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchTasks = () => {
    setLoading(true);
    getAllTasks()
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Task Management" />
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">✅ All Tasks</h1>
              <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? "s" : ""} total</p>
            </div>
            <button id="assign-task-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
              ⚡ Assign New Task
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {["all", "pending", "in-progress", "completed"].map((f) => (
              <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="spinner-page"><div className="spinner" /><span>Loading tasks...</span></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No tasks found</h3>
              <p>Assign a new task using the button above</p>
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

      {showModal && <TaskModal onClose={() => setShowModal(false)} onSuccess={fetchTasks} />}
    </div>
  );
}
