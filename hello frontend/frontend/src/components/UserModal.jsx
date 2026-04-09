import { useState } from "react";
import { createUser, updateUser } from "../api/users";
import toast from "react-hot-toast";

export default function UserModal({ onClose, onSuccess, editUser }) {
  const [form, setForm] = useState({
    name: editUser?.name || "",
    email: editUser?.email || "",
    password: "",
    role: editUser?.role || "employee",
    skills: editUser?.skills?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!editUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = typeof form.skills === "string" 
        ? form.skills.split(",").map(s => s.trim()).filter(s => s !== "")
        : form.skills;

      const userData = { ...form, skills: skillsArray };

      if (isEdit) {
        await updateUser(editUser._id, userData);
        toast.success("User updated successfully ✅");
      } else {
        await createUser(userData);
        toast.success("User created successfully 🎉");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Edit User" : "➕ Create User"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="John Doe"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="john@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Skills (comma separated)</label>
            <input className="form-input" placeholder="e.g. React, Node, CSS"
              value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
