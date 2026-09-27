import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/employees/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <header className="content-header">
          <div>
            <h1>Overview</h1>
            <p className="content-sub">A snapshot of your workforce today.</p>
          </div>
          <Link to="/employees/new" className="btn-primary">
            + Add employee
          </Link>
        </header>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <section className="stat-row">
              <div className="stat-card">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total employees</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.active}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.onLeave}</span>
                <span className="stat-label">On leave</span>
              </div>
            </section>

            <section className="panel">
              <h2>Headcount by department</h2>
              <div className="dept-list">
                {stats.byDepartment.length === 0 && (
                  <p className="muted">No employees yet — add your first one to see this fill in.</p>
                )}
                {stats.byDepartment.map((d) => (
                  <div className="dept-row" key={d._id}>
                    <span className="dept-name">{d._id}</span>
                    <div className="dept-bar-track">
                      <div
                        className="dept-bar-fill"
                        style={{ width: `${(d.count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="dept-count">{d.count}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
