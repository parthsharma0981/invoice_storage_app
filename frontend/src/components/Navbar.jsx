import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  // Global Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("login_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("login_theme", theme);
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Trigger splash animation on logo click
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (window.triggerSplashAnimation) {
      window.triggerSplashAnimation();
    }
  };

  return (
    <nav className={`navbar ${theme}`}>
      <div className="nav-left">
        <a href="/" className="brand" onClick={handleLogoClick} title="Click to see logo animation">
          VaniBoard<span className="brand-dot">.</span>
        </a>
      </div>

      <div className="nav-links">
        <Link to="/features" className={`nav-item ${pathname === "/features" ? "active" : ""}`}>Features</Link>
        <Link to="/pricing" className={`nav-item ${pathname === "/pricing" ? "active" : ""}`}>Pricing</Link>

        <Link className={`nav-item ${pathname === "/login" ? "active" : ""}`} to="/login">
          Login
        </Link>

        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <Link className="btn small primary" to="/register">
          Register
        </Link>
      </div>
    </nav>
  );
}
