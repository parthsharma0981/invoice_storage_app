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
        <a href="#features" className="nav-item">Features</a>
        <a href="#pricing" className="nav-item">Pricing</a>

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
