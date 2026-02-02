import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Theme Logic
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("login_theme") || "light";
    });

    useEffect(() => {
        localStorage.setItem("login_theme", theme);
    }, [theme]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        setSuccess(false);
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setMsg(data.msg || "Reset link sent to your email!");
            } else {
                setMsg(data.msg || "Something went wrong");
            }
        } catch (err) {
            setMsg("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`login-container ${theme}`}>
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>

            <div className="login-glass-card" style={{ maxWidth: "500px" }}>
                <div className="login-right-panel" style={{ width: "100%" }}>
                    <div className="top-nav">
                        <button className="nav-link" onClick={() => navigate("/login")}>
                            ← Back to Login
                        </button>
                        <button
                            className="theme-toggle"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
                        </button>
                    </div>

                    <div className="form-wrapper">
                        <div className="form-header">
                            <h1>Forgot Password</h1>
                            <p>Enter your email and we'll send you a reset link.</p>
                        </div>

                        {msg && (
                            <div className={success ? "success-message-box" : "error-message-box"}>
                                {success ? "✅" : "⚠️"} {msg}
                            </div>
                        )}

                        {!success ? (
                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>

                                <button className="submit-btn" type="submit" disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: "center", marginTop: "20px" }}>
                                <p className="muted">Check your email for the reset link.</p>
                                <button
                                    className="submit-btn"
                                    style={{ marginTop: "16px" }}
                                    onClick={() => navigate("/login")}
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}

                        <div className="form-footer">
                            <span className="text-muted">Remember your password?</span>
                            <span className="link-text" onClick={() => navigate("/login")}>
                                Sign In
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
