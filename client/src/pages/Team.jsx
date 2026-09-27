import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", email: "", password: "", role: "manager" };

export default function Team() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await api.get("/auth/users");
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/auth/users", form);
      setForm(emptyForm);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this team member's access?")) return;
    await api.delete(`/auth/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <header className="content-header">
          <div>
            <h1>Team</h1>
            <p className="content-sub">Who can sign in to StaffLedger.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add team member"}
          </button>
        </header>

        {showForm && (
          <form onSubmit={handleSubmit} className="panel form-grid" style={{ marginBottom: 24 }}>
            <label>
              Full name
              <input name="name" required value={form.name} onChange={handleChange} placeholder="Nimal Perera" />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="nimal@company.com"
              />
            </label>
            <label>
              Temporary password
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="manager">HR manager</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {error && <p className="form-error span-2">{error}</p>}

            <div className="form-actions span-2">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-scroll">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="emp-name">
                      {u.name} {u._id === currentUser._id && <span className="muted">(you)</span>}
                    </td>
                    <td>{u.email}</td>
                    <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="row-actions">
                      {u._id !== currentUser._id && (
                        <button className="btn-link danger" onClick={() => handleRemove(u._id)}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}