import React, { useState } from "react";
import { useStore } from "../store/StoreContext";

export default function Users() {
  const { users, addUser, deleteUser, auth } = useStore();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleAdd = async (e) => {
    e.preventDefault();

    // ✅ Only staff create (role backend handle karega)
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
    <div>
      <div className="page-title">
        <h1>Users Management</h1>
        <p className="muted">Create only staff accounts (Admin Only)</p>
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Add New Staff</h2>

          <form className="form" onSubmit={handleAdd}>
            <input
              placeholder="Staff Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />

            <input
              placeholder="Staff Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            {/* ✅ Role fixed to staff (No admin option) */}
            <select value="staff" disabled>
              <option value="staff">Staff</option>
            </select>

            <button
              className="btn primary"
              disabled={auth?.role !== "admin"} // Staff cannot create users
            >
              {auth?.role === "admin" ? "Create Staff" : "Admin Permission Required"}
            </button>
          </form>

          <p className="muted" style={{ marginTop: 10 }}>
            Logged in as: <b>{auth?.username}</b> ({auth?.role})
          </p>
        </div>

        <div className="card">
          <h2>All Users</h2>

          <div className="table">
            <div className="thead">
              <div>Username</div>
              <div>Role</div>
              <div>Action</div>
            </div>

            {users.map((u) => (
              <div className="trow" key={u._id}>
                <div>{u.username}</div>
                <div style={{ fontWeight: 800 }}>{u.role.toUpperCase()}</div>

                <div>
                  {/* ✅ Admin delete block */}
                  {u.role === "admin" ? (
                    <span className="muted">Protected</span>
                  ) : (
                    <button
                      className="btn danger"
                      disabled={auth?.role !== "admin"}
                      onClick={() => {
                        if (window.confirm(`Delete user "${u.username}"?`)) {
                          deleteUser(u._id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* optional */}
          {users.length === 0 && <p className="muted">No users found.</p>}
        </div>
      </div>
    </div>
  );
}
