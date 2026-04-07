import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

// Admin Pages
import AdminDashboardPage from "./pages/AdminDashboardPage";
import TasksPage from "./pages/TasksPage";
import PriorityQueuePage from "./pages/PriorityQueuePage";
import UsersPage from "./pages/UsersPage";

// Employee Pages
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import MyTasksPage from "./pages/MyTasksPage";

const ProtectedRoute = ({ children, role }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} replace />;
  }
  return children;
};

export default function App() {
  const { user, token } = useAuth();

  const defaultRoute = () => {
    if (!token || !user) return "/login";
    return user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/change-password/:token?" element={<ChangePasswordPage />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/tasks" element={<ProtectedRoute role="admin"><TasksPage /></ProtectedRoute>} />
      <Route path="/admin/queue" element={<ProtectedRoute role="admin"><PriorityQueuePage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><UsersPage /></ProtectedRoute>} />

      {/* Employee */}
      <Route path="/employee/dashboard" element={<ProtectedRoute role="employee"><EmployeeDashboardPage /></ProtectedRoute>} />
      <Route path="/employee/tasks" element={<ProtectedRoute role="employee"><MyTasksPage /></ProtectedRoute>} />

      {/* Default */}
      <Route path="*" element={<Navigate to={defaultRoute()} replace />} />
    </Routes>
  );
}
