import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success("Reset link sent to your email 📧");
    } catch (err) {
      toast.error(err.response?.data?.message || "User not found");
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

        <h2 className="auth-title">Forgot password?</h2>
        <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link</p>

        {sent ? (
          <>
            <div className="alert alert-success" style={{ marginTop: "1rem" }}>
              ✅ Check your inbox! A password reset link has been sent to <strong>{email}</strong>.
            </div>
            <div className="auth-link" style={{ marginTop: "1.5rem" }}>
              Already have a reset token? <Link to="/auth/change-password">Enter it manually here</Link>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input id="forgot-email" className="form-input" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link →"}
            </button>
          </form>
        )}

        <div className="auth-link">
          <Link to="/login">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
