import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../api/users";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import UserModal from "../components/UserModal";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then((res) => setUsers(res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="User Management" />
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">👥 Users</h1>
              <p className="page-subtitle">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
            </div>
            <button id="create-user-btn" className="btn btn-primary" onClick={() => { setEditUser(null); setShowModal(true); }}>
              ➕ Create User
            </button>
          </div>

          <div className="form-group" style={{ maxWidth: "320px", marginBottom: "1.5rem" }}>
            <input className="form-input" placeholder="🔍  Search by name or email..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="spinner-page"><div className="spinner" /><span>Loading users...</span></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                        No users found
                      </td>
                    </tr>
                  ) : filtered.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div className="sidebar-user-avatar" style={{ width: 30, height: 30, fontSize: "0.75rem" }}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                      <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                      <td><span className={`badge ${user.active ? "badge-active" : "badge-inactive"}`}>{user.active ? "Active" : "Offline"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setEditUser(user); setShowModal(true); }}>
                            ✏️ Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id, user.name)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <UserModal
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSuccess={fetchUsers}
          editUser={editUser}
        />
      )}
    </div>
  );
}
