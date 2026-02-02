import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">
          VaniBoard<span className="brand-dot">.</span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/features" className={`nav-item ${pathname === "/features" ? "active" : ""}`}>Features</Link>
        <Link to="/pricing" className={`nav-item ${pathname === "/pricing" ? "active" : ""}`}>Pricing</Link>

        <Link className={`nav-item ${pathname === "/login" ? "active" : ""}`} to="/login">
          Login
        </Link>

        <Link className="btn small primary" to="/register">
          Register
        </Link>
      </div>
    </nav>
  );
}
