import { useEffect, useState } from "react";
import { getPriorityQueue, deleteTask } from "../api/tasks";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PriorityBadge from "../components/PriorityBadge";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function PriorityQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [targetTask, setTargetTask] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchQueue = () => {
    setLoading(true);
    getPriorityQueue()
      .then((res) => {
        setQueue(res.data.queue || []);
        setTotal(res.data.total || 0);
      })
      .catch(() => setQueue([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDelete = async () => {
    if (!targetTask) return;
    setDeleteLoading(true);
    try {
      await deleteTask(targetTask._id);
      toast.success("Task deleted successfully");
      fetchQueue();
      setTargetTask(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    } finally {
      setDeleteLoading(false);
    }
  };

  const rankIcon = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Priority Queue" />
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">🔢 Priority Queue</h1>
              <p className="page-subtitle">Active tasks sorted by priority weight — High (3) → Medium (2) → Low (1)</p>
            </div>
            <div className="card" style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--purple-light)" }}>{total}</span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>tasks in queue</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {[
              { label: "High Priority", weight: 3, cls: "badge-high" },
              { label: "Medium Priority", weight: 2, cls: "badge-medium" },
              { label: "Low Priority", weight: 1, cls: "badge-low" },
            ].map((item) => (
              <div key={item.label} className="card" style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className={`badge ${item.cls}`}>{item.label}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>weight = {item.weight}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="spinner-page"><div className="spinner" /><span>Loading queue...</span></div>
          ) : queue.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <h3>Queue is empty</h3>
              <p>No pending or in-progress tasks</p>
            </div>
          ) : (
            <div>
              {queue.map((task, i) => (
                <div key={task._id} className="queue-item">
                  <div className="queue-rank">{rankIcon(i)}</div>
                  <div className="queue-info">
                    <div className="queue-title">{task.title}</div>
                    <div className="queue-assigned">
                      {task.assignedTo ? `👤 ${task.assignedTo.name}` : "Unassigned"}
                      {" · "}⏱ {task.estimatedHours}h
                    </div>
                  </div>
                  <div className="queue-meta">
                    <PriorityBadge priority={task.priority} />
                    <span className={`badge badge-${task.status}`}>{task.status}</span>
                    {user?.role === "admin" && (
                      <button 
                        className="btn btn-sm" 
                        onClick={() => setTargetTask(task)}
                        style={{ padding: "0.4rem", minWidth: "auto", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", marginLeft: "0.5rem" }}
                        title="Delete Task"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!targetTask}
        onClose={() => setTargetTask(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${targetTask?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
