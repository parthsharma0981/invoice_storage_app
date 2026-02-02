import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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

    // Redirect if no token
    useEffect(() => {
        if (!token) {
            setMsg("Invalid reset link. Please request a new one.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        setSuccess(false);

        if (password !== confirmPassword) {
            setMsg("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setMsg("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setMsg(data.msg || "Password reset successfully!");
            } else {
                setMsg(data.msg || "Reset failed. Token may be expired.");
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
                            <h1>Reset Password</h1>
                            <p>Enter your new password below.</p>
                        </div>

                        {msg && (
                            <div className={success ? "success-message-box" : "error-message-box"}>
                                {success ? "✅" : "⚠️"} {msg}
                            </div>
                        )}

                        {!success && token ? (
                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="input-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button className="submit-btn" type="submit" disabled={loading}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                        ) : success ? (
                            <div style={{ textAlign: "center", marginTop: "20px" }}>
                                <p className="muted">Your password has been reset.</p>
                                <button
                                    className="submit-btn"
                                    style={{ marginTop: "16px" }}
                                    onClick={() => navigate("/login")}
                                >
                                    Login Now
                                </button>
                            </div>
                        ) : null}

                        <div className="form-footer">
                            <span className="text-muted">Need a new link?</span>
                            <span className="link-text" onClick={() => navigate("/forgot-password")}>
                                Request Again
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
