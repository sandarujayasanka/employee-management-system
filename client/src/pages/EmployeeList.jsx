import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Support"];

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (department) params.department = department;
    if (status) params.status = status;
    const { data } = await api.get("/employees", { params });
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, department, status]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this employee record? This can't be undone.")) return;
    setDeletingId(id);
    await api.delete(`/employees/${id}`);
    setEmployees((prev) => prev.filter((e) => e._id !== id));
    setDeletingId(null);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <header className="content-header">
          <div>
            <h1>Employees</h1>
            <p className="content-sub">{employees.length} record{employees.length !== 1 ? "s" : ""}</p>
          </div>
          <Link to="/employees/new" className="btn-primary">
            + Add employee
          </Link>
        </header>

        <section className="filter-bar">
          <input
            type="text"
            placeholder="Search by name, email or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On leave</option>
            <option value="Terminated">Terminated</option>
          </select>
        </section>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <p>No employees match these filters.</p>
            <Link to="/employees/new" className="btn-secondary">
              Add your first employee
            </Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td className="mono">{emp.employeeId}</td>
                    <td>
                      <div className="emp-name">{emp.firstName} {emp.lastName}</div>
                      <div className="emp-email">{emp.email}</div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>
                      <span className={`badge badge-${emp.status.replace(/\s/g, "").toLowerCase()}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>{new Date(emp.dateJoined).toLocaleDateString()}</td>
                    <td className="row-actions">
                      <Link to={`/attendance?employee=${emp._id}`} className="btn-link">
                        Attendance
                      </Link>
                      <Link to={`/employees/${emp._id}/edit`} className="btn-link">
                        Edit
                      </Link>
                      <button
                        className="btn-link danger"
                        onClick={() => handleDelete(emp._id)}
                        disabled={deletingId === emp._id}
                      >
                        {deletingId === emp._id ? "Removing…" : "Remove"}
                      </button>
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