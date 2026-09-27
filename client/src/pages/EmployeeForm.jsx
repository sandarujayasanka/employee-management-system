import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Support"];

const emptyForm = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "Engineering",
  position: "",
  salary: "",
  leaveQuota: 14,
  dateJoined: new Date().toISOString().slice(0, 10),
  status: "Active",
  address: "",
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/employees/${id}`).then((res) => {
      const emp = res.data;
      setForm({
        ...emp,
        dateJoined: emp.dateJoined?.slice(0, 10),
      });
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, salary: Number(form.salary), leaveQuota: Number(form.leaveQuota) };
      if (isEdit) {
        await api.put(`/employees/${id}`, payload);
      } else {
        await api.post("/employees", payload);
      }
      navigate("/employees");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <header className="content-header">
          <div>
            <h1>{isEdit ? "Edit employee" : "Add employee"}</h1>
            <p className="content-sub">
              {isEdit ? "Update this person's record." : "Add a new person to the register."}
            </p>
          </div>
        </header>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="panel form-grid">
            <label>
              Employee ID
              <input name="employeeId" required value={form.employeeId} onChange={handleChange} placeholder="EMP-1042" />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="On Leave">On leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </label>

            <label>
              First name
              <input name="firstName" required value={form.firstName} onChange={handleChange} />
            </label>
            <label>
              Last name
              <input name="lastName" required value={form.lastName} onChange={handleChange} />
            </label>

            <label>
              Email
              <input type="email" name="email" required value={form.email} onChange={handleChange} />
            </label>
            <label>
              Phone
              <input name="phone" required value={form.phone} onChange={handleChange} />
            </label>

            <label>
              Department
              <select name="department" value={form.department} onChange={handleChange}>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Position
              <input name="position" required value={form.position} onChange={handleChange} placeholder="Software Engineer" />
            </label>

            <label>
              Salary (monthly)
              <input type="number" name="salary" min="0" required value={form.salary} onChange={handleChange} />
            </label>
            <label>
              Annual leave quota (days)
              <input type="number" name="leaveQuota" min="0" step="0.5" required value={form.leaveQuota} onChange={handleChange} />
            </label>

            <label>
              Date joined
              <input type="date" name="dateJoined" required value={form.dateJoined} onChange={handleChange} />
            </label>

            <label className="span-2">
              Address
              <textarea name="address" rows={2} value={form.address} onChange={handleChange} />
            </label>

            {error && <p className="form-error span-2">{error}</p>}

            <div className="form-actions span-2">
              <button type="button" className="btn-secondary" onClick={() => navigate("/employees")}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save changes" : "Add employee"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}