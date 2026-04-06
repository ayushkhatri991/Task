import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { changePassword } from "../api/auth";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await changePassword(token, form);
      toast.success("Password changed successfully! 🔐");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Token expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text">TaskFlow</span>
        </div>

        <h2 className="auth-title">Reset your password</h2>
        <p className="auth-subtitle">Enter your new password below</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input id="new-password" className="form-input" type="password" placeholder="Min 6 characters"
              value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input id="confirm-password" className="form-input" type="password" placeholder="Repeat new password"
              value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Updating..." : "Reset Password →"}
          </button>
        </form>

        <div className="auth-link">
          <Link to="/login">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
