import React from "react";
import "./Features.css";
import { Link } from "react-router-dom";

export default function Features() {
    const featureList = [
        {
            icon: "⚡",
            title: "Instant Invoicing",
            desc: "Create professional GST/Non-GST invoices in seconds. Auto-calculate taxes, discounts, and totals with zero errors."
        },
        {
            icon: "📦",
            title: "Smart Inventory",
            desc: "Track stock levels in real-time. Get AI-powered alerts for low stock and dead inventory that isn't selling."
        },
        {
            icon: "🧠",
            title: "AI Business Insights",
            desc: "Unlock hidden growth opportunities. Visualize profit margins, best-selling trends, and customer retention data."
        },
        {
            icon: "👥",
            title: "Customer Management",
            desc: "Maintain a detailed database of customers. Track purchase history and outstanding dues with one click."
        },
        {
            icon: "📅",
            title: "Due Reminders",
            desc: "Never chase payments manually. Automated WhatsApp and email reminders ensure you get paid on time."
        },
        {
            icon: "🔐",
            title: "Role-Based Access",
            desc: "Secure your data. Assign specific roles (Admin, Staff) to control who sees what in your organization."
        }
    ];

    return (
        <div className="features-page">
            {/* HERO */}
            <section className="features-hero">
                <h1 className="features-title">Everything you need to <br /> run your business.</h1>
                <p className="features-subtitle">
                    Powerful tools designed to streamline operations, boost sales, and simplify finances.
                </p>
            </section>

            {/* GRID */}
            <section className="features-grid">
                {featureList.map((f, i) => (
                    <div key={i} className="feature-block">
                        <div className="feature-icon-wrapper">{f.icon}</div>
                        <h3 className="feature-heading">{f.title}</h3>
                        <p className="feature-desc">{f.desc}</p>
                    </div>
                ))}
            </section>

            {/* CTA */}
            <section className="features-cta">
                <div className="cta-box">
                    <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Ready to upgrade your workflow?</h2>
                    <p className="text-muted">Join thousands of businesses usage our platform to scale faster.</p>
                    <Link to="/register" className="btn-primary">
                        Get Started Now
                    </Link>
                </div>
            </section>
        </div>
    );
}
