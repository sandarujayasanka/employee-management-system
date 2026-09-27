import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Only visible on small screens — the sidebar itself is off-canvas there */}
      <div className="mobile-topbar">
        <button type="button" className="hamburger-btn" onClick={() => setIsOpen(true)} aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
        <div className="sidebar-brand">
          <span className="sidebar-mark">SL</span>
          <span className="sidebar-name">StaffLedger</span>
        </div>
      </div>

      {isOpen && <div className="sidebar-backdrop" onClick={closeMenu} />}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <button type="button" className="sidebar-close" onClick={closeMenu} aria-label="Close menu">
          ✕
        </button>

        <div className="sidebar-brand">
          <span className="sidebar-mark">SL</span>
          <span className="sidebar-name">StaffLedger</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
            Overview
          </NavLink>
          <NavLink to="/employees" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
            Employees
          </NavLink>
          <NavLink to="/employees/new" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
            Add employee
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
            Attendance
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/team" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              Team
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-role">{user?.role}</span>
          </div>
          <button className="btn-link" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}