import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

const STATUS_OPTIONS = ["Present", "Leave", "Absent", "Half Day"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(year, month, day) {
  // month is 1-12 here; returns "YYYY-MM-DD"
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function Attendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedEmployee = searchParams.get("employee") || "";

  const today = new Date();
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState(preselectedEmployee);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); 
  const [records, setRecords] = useState([]); 
  const [balance, setBalance] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [employeeQuery, setEmployeeQuery] = useState(""); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); 
  const [noteDraft, setNoteDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/employees").then((res) => {
      setEmployees(res.data);
      const initial = res.data.find((e) => e._id === preselectedEmployee) || res.data[0];
      if (initial) {
        setEmployeeId(initial._id);
        setEmployeeQuery(`${initial.firstName} ${initial.lastName} — ${initial.employeeId}`);
      }
    });
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = employeeQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName} ${e.employeeId} ${e.email}`.toLowerCase().includes(q)
    );
  }, [employeeQuery, employees]);

  const selectEmployee = (emp) => {
    setEmployeeId(emp._id);
    setEmployeeQuery(`${emp.firstName} ${emp.lastName} — ${emp.employeeId}`);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (employeeId) setSearchParams({ employee: employeeId }, { replace: true });
  }, [employeeId]);

  const fetchMonth = async () => {
    if (!employeeId) return;
    setLoading(true);
    const { data } = await api.get("/attendance", { params: { employeeId, year, month } });
    setRecords(data);
    setLoading(false);
  };

  const fetchBalance = async () => {
    if (!employeeId) return;
    const { data } = await api.get("/attendance/balance", { params: { employeeId, year } });
    setBalance(data);
  };

  useEffect(() => {
    fetchMonth();
    fetchBalance();
    setSelectedDay(null);
  }, [employeeId, year, month]);

  const recordByDay = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      const key = toDateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      map[key] = r;
    });
    return map;
  }, [records]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0 = Sunday

  const summary = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = records.filter((r) => r.status === s).length;
    return acc;
  }, {});

  const goToMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setMonth(m);
    setYear(y);
  };

  const openDay = (day) => {
    setSelectedDay(day);
    const key = toDateKey(year, month, day);
    setNoteDraft(recordByDay[key]?.note || "");
  };

  const markDay = async (status) => {
    if (!selectedDay) return;
    setSaving(true);
    const dateStr = toDateKey(year, month, selectedDay);
    await api.post("/attendance", { employeeId, date: dateStr, status, note: noteDraft });
    await fetchMonth();
    await fetchBalance();
    setSaving(false);
  };

  const clearDay = async () => {
    const key = toDateKey(year, month, selectedDay);
    const record = recordByDay[key];
    if (!record) return;
    setSaving(true);
    await api.delete(`/attendance/${record._id}`);
    await fetchMonth();
    await fetchBalance();
    setSaving(false);
  };

  const selectedEmployee = employees.find((e) => e._id === employeeId);
  const selectedKey = selectedDay ? toDateKey(year, month, selectedDay) : null;
  const selectedRecord = selectedKey ? recordByDay[selectedKey] : null;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <header className="content-header">
          <div>
            <h1>Attendance</h1>
            <p className="content-sub">Mark daily attendance, or schedule leave ahead of time.</p>
          </div>
        </header>

        <section className="filter-bar employee-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search employee by name or ID…"
            value={employeeQuery}
            onChange={(e) => {
              setEmployeeQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && (
            <ul className="employee-suggestions">
              {filteredEmployees.length === 0 ? (
                <li className="employee-suggestion-empty">No employees match "{employeeQuery}"</li>
              ) : (
                filteredEmployees.map((emp) => (
                  <li key={emp._id}>
                    <button
                      type="button"
                      className={emp._id === employeeId ? "active" : ""}
                      onMouseDown={(e) => e.preventDefault()} // keep focus so onBlur doesn't fire before the click
                      onClick={() => selectEmployee(emp)}
                    >
                      <span className="emp-name">{emp.firstName} {emp.lastName}</span>
                      <span className="emp-email">{emp.employeeId} · {emp.department}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>

        {balance && (
          <div className="panel balance-panel">
            <div className="balance-item">
              <span className="balance-number">{balance.quota}</span>
              <span className="balance-label">Annual quota</span>
            </div>
            <div className="balance-item">
              <span className="balance-number">{balance.used}</span>
              <span className="balance-label">Used ({year})</span>
            </div>
            <div className="balance-item">
              <span className="balance-number balance-remaining">{balance.remaining}</span>
              <span className="balance-label">Remaining</span>
            </div>
            {balance.noPayDays > 0 && (
              <div className="balance-item">
                <span className="balance-number balance-nopay">{balance.noPayDays}</span>
                <span className="balance-label">No Pay days</span>
              </div>
            )}
          </div>
        )}

        {!employeeId ? (
          <p className="muted">Add an employee first to track attendance.</p>
        ) : (
          <div className="attendance-layout">
            <div className="panel">
              <div className="cal-header">
                <button type="button" className="btn-secondary" onClick={() => goToMonth(-1)}>
                  ‹
                </button>
                <h2 style={{ marginBottom: 0 }}>
                  {MONTH_NAMES[month - 1]} {year}
                </h2>
                <button type="button" className="btn-secondary" onClick={() => goToMonth(1)}>
                  ›
                </button>
              </div>

              <div className="cal-summary">
                {STATUS_OPTIONS.map((s) => (
                  <span key={s} className={`cal-summary-chip status-${s.replace(/\s/g, "").toLowerCase()}`}>
                    {s}: {summary[s]}
                  </span>
                ))}
              </div>

              {loading ? (
                <p className="muted">Loading…</p>
              ) : (
                <div className="cal-grid">
                  {WEEKDAYS.map((w) => (
                    <div key={w} className="cal-weekday">{w}</div>
                  ))}
                  {Array.from({ length: firstWeekday }).map((_, i) => (
                    <div key={`empty-${i}`} className="cal-cell cal-cell-empty" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const key = toDateKey(year, month, day);
                    const record = recordByDay[key];
                    const isNoPay = record && ["Leave", "Half Day"].includes(record.status) && !record.paid;
                    const isToday =
                      year === today.getFullYear() &&
                      month === today.getMonth() + 1 &&
                      day === today.getDate();
                    const isFuture = new Date(year, month - 1, day) > today && !isToday;
                    return (
                      <button
                        type="button"
                        key={day}
                        className={`cal-cell ${record ? `status-${record.status.replace(/\s/g, "").toLowerCase()}` : ""} ${
                          isNoPay ? "cal-cell-nopay" : ""
                        } ${selectedDay === day ? "cal-cell-selected" : ""} ${isToday ? "cal-cell-today" : ""}`}
                        onClick={() => openDay(day)}
                      >
                        <span className="cal-day-num">{day}</span>
                        {record && (
                          <span className="cal-day-status">{isNoPay ? "No Pay" : record.status}</span>
                        )}
                        {!record && isFuture && <span className="cal-day-status muted">—</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="panel cal-side">
              {!selectedDay ? (
                <p className="muted">Click a day on the calendar to mark attendance or schedule leave.</p>
              ) : (
                <>
                  <h2>
                    {MONTH_NAMES[month - 1]} {selectedDay}, {year}
                  </h2>
                  <p className="content-sub" style={{ marginBottom: 16 }}>
                    {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                  </p>

                  {selectedRecord && ["Leave", "Half Day"].includes(selectedRecord.status) && (
                    <span
                      className={`cal-summary-chip ${selectedRecord.paid ? "status-present" : "status-absent"}`}
                      style={{ marginBottom: 14, display: "inline-block" }}
                    >
                      {selectedRecord.paid ? "Paid — within leave quota" : "No Pay — quota exceeded"}
                    </span>
                  )}

                  <div className="cal-status-buttons">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`cal-status-btn status-${s.replace(/\s/g, "").toLowerCase()} ${
                          selectedRecord?.status === s ? "active" : ""
                        }`}
                        onClick={() => markDay(s)}
                        disabled={saving}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <label style={{ display: "block", marginTop: 16 }}>
                    <span className="muted" style={{ fontSize: 13 }}>Note (optional)</span>
                    <textarea
                      rows={3}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="e.g. Medical leave, half-day for appointment…"
                      style={{
                        width: "100%",
                        marginTop: 6,
                        padding: "10px 12px",
                        border: "1px solid var(--line)",
                        borderRadius: 4,
                        fontFamily: "inherit",
                      }}
                    />
                  </label>

                  {selectedRecord && (
                    <button type="button" className="btn-link danger" style={{ marginTop: 12 }} onClick={clearDay} disabled={saving}>
                      Clear this day
                    </button>
                  )}
                </>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}