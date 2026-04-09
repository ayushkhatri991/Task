import { useState } from "react";
import { trackTask, updateTaskStatus, deleteTask } from "../api/tasks";
import ProgressBar from "./ProgressBar";
import PriorityBadge from "./PriorityBadge";
import ConfirmModal from "./ConfirmModal";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["pending", "in-progress", "completed"];

export default function TaskCard({ task, onRefresh, showUpdate = true }) {
  const { user } = useAuth();
  const [tracking, setTracking] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Only allow updating if showUpdate is true AND the user is an employee
  const canUpdate = showUpdate && user?.role === "employee";

  const handleTrack = async () => {
    if (tracking) { setTracking(null); return; }
    setTrackLoading(true);
    try {
      const res = await trackTask(task._id);
      setTracking(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot track this task yet");
    } finally {
      setTrackLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await updateTaskStatus(task._id, { status: newStatus });
      toast.success(`Status updated to "${newStatus}"`);
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTask(task._id);
      toast.success("Task deleted successfully");
      onRefresh?.();
      setShowConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div>
          <div className="task-card-title">{task.title}</div>
          {task.assignedTo && (
            <div className="task-card-assignee">👤 {task.assignedTo.name || task.assignedTo.email || "Assigned"}</div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {user?.role === "admin" && (
            <button 
              className="btn btn-sm" 
              onClick={() => setShowConfirm(true)}
              disabled={deleteLoading}
              style={{ padding: "0.4rem", minWidth: "auto", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
              title="Delete Task"
            >
              🗑️
            </button>
          )}
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <p className="task-card-desc">{task.description}</p>

      <div className="task-card-meta">
        <span className={`badge badge-${task.status}`}>{task.status}</span>
        <span className="badge" style={{ background: "rgba(139,92,246,0.1)", color: "var(--purple-light)", border: "1px solid rgba(139,92,246,0.2)" }}>
          ⏱ {task.estimatedHours}h
        </span>

        {canUpdate && (
          <select
            className="form-select"
            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", width: "auto", marginLeft: "auto" }}
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusLoading}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {task.status === "pending" && canUpdate ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleStatusChange("in-progress")}
            disabled={statusLoading}
            style={{ marginLeft: canUpdate ? "0.5rem" : "auto", background: "var(--purple)", color: "white", border: "none" }}
          >
            ▶ Start Task
          </button>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleTrack}
            disabled={trackLoading || task.status === "pending"}
            title={task.status === "pending" ? "Cannot track pending tasks" : ""}
            style={{ marginLeft: canUpdate ? "0.5rem" : "auto" }}
          >
            {trackLoading ? "..." : tracking ? "Hide" : "📈 Track"}
          </button>
        )}
      </div>

      {tracking && (
        <div style={{ marginTop: "1rem" }}>
          <div className="track-info-grid">
            <div className="track-info-item">
              <div className="track-info-value">{tracking.elapsedHours}h</div>
              <div className="track-info-label">{task.status === "completed" ? "Total Time" : "Elapsed"}</div>
            </div>
            <div className="track-info-item">
              <div className="track-info-value">{tracking.remainingHours}h</div>
              <div className="track-info-label">Remaining</div>
            </div>
            <div className="track-info-item">
              <div className="track-info-value" style={{ color: "var(--emerald)" }}>{tracking.progress}</div>
              <div className="track-info-label">{task.status === "completed" ? "Final Progress" : "Progress"}</div>
            </div>
          </div>
          <ProgressBar 
            percent={task.status === "completed" ? 100 : parseFloat(tracking.progress)} 
            label={task.status === "completed" ? "Status: Completed" : "Completion"} 
          />
        </div>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
