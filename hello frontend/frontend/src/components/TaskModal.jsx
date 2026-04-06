import { useState } from "react";
import { assignTask } from "../api/tasks";
import toast from "react-hot-toast";

export default function TaskModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: "", description: "", estimatedHours: "", priority: "medium" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.estimatedHours) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await assignTask({ ...form, estimatedHours: Number(form.estimatedHours) });
      toast.success(`Task assigned to ${res.data.assignedTo} 🎯`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">⚡ Assign New Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="alert alert-info">
          🤖 Greedy algorithm will auto-assign to the least busy active employee.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input className="form-input" placeholder="e.g. Fix authentication bug"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Describe the task..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input className="form-input" type="number" min="0.5" step="0.5" placeholder="e.g. 4"
                value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Assigning..." : "⚡ Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
