import React, { useState, useEffect } from "react";
import { useStore } from "../store/StoreContext";

export default function Users() {
  const { users, addUser, deleteUser, auth } = useStore();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  // Theme Logic
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("login_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("login_theme", theme);
    document.body.className = theme;
  }, [theme]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await addUser({
      username: form.username,
      password: form.password,
    });

    if (!res.ok) {
      alert(res.msg);
      return;
    }

    alert("Staff user created successfully!");
    setForm({ username: "", password: "" });
  };

  return (
    <div className={`dashboard-wrapper ${theme}`}>
      {/* HEADER */}
      <div className="dash-header">
        <div className="dash-title-box">
          <h1>Users Management</h1>
          <p className="muted">Manage staff access & permissions</p>
        </div>
        
        <div className="dash-actions">
           <button 
             className="theme-btn"
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
           >
             {theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode'}
           </button>
        </div>
      </div>

      {/* ALERT BANNER */}
      {auth?.role !== "admin" && (
        <div className="glass-card navy-card" style={{ padding: "1rem", marginBottom: "2rem", borderLeft: "4px solid #ef4444", background: "rgba(239,68,68,0.1)" }}>
          <strong style={{ color: "#ef4444" }}>Permission Denied:</strong> Only Administrators can add or delete staff accounts.
        </div>
      )}

      {/* MAIN GRID */}
      <div className="stats-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
        
        {/* LEFT: ADD USER FORM */}
        <div className="glass-card navy-card form-card-height">
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--card-title)" }}>Add New Staff</h3>
            <p className="muted" style={{ fontSize: "0.85rem" }}>Create account for employees</p>
          </div>
          
          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={handleAdd} className="styled-form">
              <div className="input-group">
                <label>Staff Username</label>
                <input
                  placeholder="e.g. sales_staff_1"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  disabled={auth?.role !== "admin"}
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  disabled={auth?.role !== "admin"}
                />
              </div>

              <div className="input-group">
                <label>Role</label>
                <div className="disabled-select">Staff (Default)</div>
                <small className="muted" style={{ display: "block", marginTop: "5px", fontSize: "0.8rem" }}>
                  * Admin role cannot be assigned manually.
                </small>
              </div>

              <button
                className="submit-btn"
                disabled={auth?.role !== "admin"}
                style={{ marginTop: "1rem", opacity: auth?.role !== "admin" ? 0.6 : 1 }}
              >
                {auth?.role === "admin" ? "Create Account" : "Admin Only"}
              </button>
            </form>

            <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
              Logged in as: <strong style={{ color: "var(--primary)" }}>{auth?.username}</strong> 
              <span className="role-badge admin" style={{ marginLeft: "10px", fontSize: "0.7rem" }}>{auth?.role?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: USER LIST */}
        <div className="glass-card navy-card" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", height: "fit-content" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div>
               <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--card-title)" }}>All Active Users</h3>
               <p className="muted" style={{ fontSize: "0.9rem" }}>Total Accounts: {users?.length || 0}</p>
             </div>
             <div className="status-dot active" style={{width: "10px", height: "10px"}}></div>
          </div>

          <div className="custom-table-wrapper" style={{ flex: 1, overflowY: "auto" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role Access</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Check if users exist before mapping */}
                {users && users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id || Math.random()}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          
                          {/* ✅ FIX 1: Username Check */}
                          <div className="user-avatar">
                            {u.username ? u.username.charAt(0).toUpperCase() : "U"}
                          </div>

                          <div style={{display: 'flex', flexDirection: 'column'}}>
                             <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                               {u.username || "Unknown User"}
                             </span>
                             
                             {/* ✅ FIX 2: _id Check (Yehi error de raha tha) */}
                             <span className="muted" style={{fontSize: "0.75rem"}}>
                               ID: {u._id ? u._id.slice(-4) : "----"}
                             </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role ? u.role.toUpperCase() : "STAFF"}
                        </span>
                      </td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem'}}>
                          <span className="status-dot active"></span> Active
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {u.role === "admin" ? (
                          <span className="muted" style={{ fontSize: "0.85rem", fontStyle: "italic", opacity: 0.6 }}>Protected</span>
                        ) : (
                          <button
                            className="action-btn-danger"
                            disabled={auth?.role !== "admin"}
                            onClick={() => {
                              if (window.confirm(`Delete user "${u.username}"?`)) {
                                deleteUser(u._id);
                              }
                            }}
                          >
                            Revoke Access
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                   <tr>
                     <td colSpan="4" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                       No users found.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}