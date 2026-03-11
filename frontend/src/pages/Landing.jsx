import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
    const heroRef = useRef(null);
    const sectionsRef = useRef([]);
    const footerRef = useRef(null);

    useEffect(() => {
        // ✅ Intersection Observer for Scroll Reveal
        const observerOptions = {
            root: null,
            rootMargin: "0px 0px -100px 0px",
            threshold: 0.1,
        };

        const revealCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                }
            });
        };

        const observer = new IntersectionObserver(revealCallback, observerOptions);

        // Observe all scroll-reveal elements
        const revealElements = document.querySelectorAll(
            ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-scale, .scroll-fade, .footer"
        );
        revealElements.forEach((el) => observer.observe(el));

        // ✅ Parallax Effect on Hero Image
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const parallaxElements = document.querySelectorAll(".parallax-image");
            parallaxElements.forEach((el) => {
                el.style.transform = `translateY(${scrollY * 0.15}px)`;
            });

            // ✅ Navbar scroll state
            const navbar = document.querySelector(".navbar");
            if (navbar) {
                if (scrollY > 50) {
                    navbar.classList.add("scrolled");
                } else {
                    navbar.classList.remove("scrolled");
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div>
            <Navbar />

            {/* HERO */}
            <section className="hero" ref={heroRef}>
                <div className="hero-left hero-animate">
                    <h1>Smart Billing & Inventory for Your Business</h1>
                    <p className="muted">
                        Manage products, customers, staff accounts and generate professional invoices in seconds.
                        Secure, fast and made for growing companies.
                    </p>

                    <div className="hero-actions">
                        <Link className="btn primary" to="/register">Get Started</Link>
                        <Link className="btn" to="/login">Login</Link>
                    </div>

                    <div className="hero-badges scroll-reveal stagger-1">
                        <span className="badge stagger-1">✔ Multi-Company Secure</span>
                        <span className="badge stagger-2">✔ Staff Access Control</span>
                        <span className="badge stagger-3">✔ Invoice + GST Ready</span>
                    </div>
                </div>

                <div className="hero-right">
                    <img
                        src="/images/landing-dashboard.png"
                        alt="Dashboard"
                        className="sec-img parallax-image float-animation"
                    />
                </div>
            </section>

            {/* SECTION 1 */}
            <section className="feature-section">
                <div className="feature-grid">
                    <div className="feature-text scroll-reveal-left">
                        <h2>Complete Business Dashboard</h2>
                        <p className="muted">
                            Track your products, manage customers, maintain stock, and monitor your business operations
                            from a clean and simple interface. Everything stays organized and easy to access.
                        </p>
                    </div>

                    <div className="feature-image scroll-scale">
                        <img
                            src="/images/landing-products.png"
                            alt="Products & Stock"
                            className="sec-img"
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 2 */}
            <section className="feature-section alt">
                <div className="feature-grid reverse">
                    <div className="feature-text scroll-reveal-right">
                        <h2>Secure Multi-Company Data</h2>
                        <p className="muted">
                            Every company gets its own secure workspace. Your products, invoices, customers and dues
                            remain private and cannot be accessed by any other company.
                        </p>
                    </div>

                    <div className="feature-image scroll-scale">
                        <img
                            src="/images/landing-secure.png"
                            alt="Security & Isolation"
                            className="sec-img"
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 3 */}
            <section className="feature-section">
                <div className="feature-grid">
                    <div className="feature-text scroll-reveal-left">
                        <h2>Staff Management & Roles</h2>
                        <p className="muted">
                            Owner/Admin can create staff accounts. Staff can work inside your system but cannot create
                            new admins. Full control stays with the business owner.
                        </p>
                    </div>

                    <div className="feature-image scroll-scale">
                        <img
                            src="/images/landing-staff.png"
                            alt="Staff Management"
                            className="sec-img"
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 4 */}
            <section className="feature-section alt">
                <div className="feature-grid reverse">
                    <div className="feature-text scroll-reveal-right">
                        <h2>Professional Invoices in Seconds</h2>
                        <p className="muted">
                            Create invoices with GST, transport details, discounts and totals. Print-ready invoice format
                            helps your business look professional and trusted.
                        </p>
                    </div>

                    <div className="feature-image scroll-scale">
                        <img
                            src="/images/login-hero.png"
                            alt="Invoice Generator"
                            className="sec-img"
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 5 (Payment) */}
            <section className="feature-section">
                <div className="feature-grid">
                    <div className="feature-text scroll-reveal-left">
                        <h2>Easy Subscription & Payments</h2>
                        <p className="muted">
                            Register your company, complete payment securely, and get your login credentials instantly.
                            Start adding staff, customers and invoices right away.
                        </p>
                    </div>

                    <div className="feature-image scroll-scale">
                        <img
                            src="/images/landing-payment.png"
                            alt="Payments"
                            className="sec-img"
                        />
                    </div>
                </div>
            </section>

            {/* PRICING TEASER */}
            <section className="pricing scroll-reveal">
                <h2>Simple, Transparent Pricing</h2>
                <p className="muted" style={{ maxWidth: "600px", margin: "10px auto 30px" }}>
                    Choose a plan that fits your business needs. No hidden fees, cancel anytime.
                </p>

                <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginBottom: "30px" }}>
                    <div className="pricing-card scroll-reveal stagger-1 glow-on-scroll" style={{ maxWidth: "350px", textAlign: "left" }}>
                        <h3>Starter</h3>
                        <div className="price">₹ 299 <span className="muted">/ month</span></div>
                        <ul style={{ marginBottom: "20px" }}>
                            <li>✔ 1 Admin User</li>
                            <li>✔ 50 Invoices/mo</li>
                            <li>✔ Basic Reports</li>
                        </ul>
                        <Link className="btn" style={{ width: "100%", textAlign: "center" }} to="/pricing">View All Plans</Link>
                    </div>

                    <div className="pricing-card scroll-reveal stagger-2 glow-on-scroll" style={{ maxWidth: "350px", textAlign: "left", border: "1px solid var(--primary)" }}>
                        <h3>Pro</h3>
                        <div className="price">₹ 499 <span className="muted">/ month</span></div>
                        <ul style={{ marginBottom: "20px" }}>
                            <li>✔ 3 Users</li>
                            <li>✔ Unlimited Invoices</li>
                            <li>✔ AI Insights & Inventory</li>
                        </ul>
                        <Link className="btn primary" style={{ width: "100%", textAlign: "center" }} to="/pricing">View All Plans</Link>
                    </div>
                </div>

                <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <Link className="btn scroll-reveal stagger-3" to="/pricing">Compare All Features &rarr;</Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer" ref={footerRef}>
                <p className="muted">© {new Date().getFullYear()} Vani Board SaaS • All Rights Reserved</p>
            </footer>
        </div>
    );
}
