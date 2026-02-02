import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Pricing.css";

export default function Pricing() {
    const [billingCycle, setBillingCycle] = useState("monthly");
    const navigate = useNavigate();

    const plans = [
        {
            name: "Starter",
            price: billingCycle === "monthly" ? "299" : "2999",
            description: "Perfect for freelancers starting out.",
            features: [
                "1 Admin User",
                "Up to 50 Invoices/mo",
                "Basic Reports",
                "Email Support",
                "Limited Customer storage"
            ],
            notIncluded: [
                "Inventory Mgmt",
                "Advanced Insights",
                "Priority Support",
                "Multi-user Access"
            ],
            buttonText: "Start for Free",
            isPopular: false,
        },
        {
            name: "Pro",
            price: billingCycle === "monthly" ? "499" : "4999",
            description: "For growing businesses needing efficiency.",
            features: [
                "3 Users (1 Admin + 2 Staff)",
                "Unlimited Invoices",
                "Smart Inventory (AI)",
                "Advanced Profit Insights",
                "WhatsApp Reminders",
                "Priority Support"
            ],
            notIncluded: [
                "White-label Branding",
                "Dedicated Account Manager"
            ],
            buttonText: "Get Started",
            isPopular: true,
        },
        {
            name: "Enterprise",
            price: billingCycle === "monthly" ? "999" : "9999",
            description: "Maximum power for large scale operations.",
            features: [
                "Unlimited Users",
                "Multi-Branch Support",
                "Custom Branding",
                "API Access",
                "Dedicated Manager",
                "24/7 Phone Support"
            ],
            notIncluded: [],
            buttonText: "Contact Sales",
            isPopular: false,
        },
    ];

    const handlePlanSelect = (planName) => {
        // You can pass the selected plan as state if needed, but for now just redirect
        navigate("/register", { state: { selectedPlan: planName, billingCycle } });
    };

    return (
        <div className="pricing-page">
            {/* HEADER */}
            <header className="pricing-header">
                <h1 className="pricing-title">Simple, Transparent Pricing</h1>
                <p className="pricing-subtitle">
                    Whether you're a solopreneur or a scaling enterprise, we have a plan for you.
                </p>

                {/* TOGGLE */}
                <div className="pricing-toggle">
                    <button
                        className={`toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
                        onClick={() => setBillingCycle("monthly")}
                    >
                        Monthly
                    </button>
                    <button
                        className={`toggle-btn ${billingCycle === "yearly" ? "active" : ""}`}
                        onClick={() => setBillingCycle("yearly")}
                    >
                        Yearly (Save 20%)
                    </button>
                </div>
            </header>

            {/* PLANS GRID */}
            <div className="pricing-grid">
                {plans.map((plan, index) => (
                    <div key={index} className={`pricing-card ${plan.isPopular ? "popular" : ""}`}>
                        {plan.isPopular && <div className="popular-badge">Most Popular</div>}

                        <h3 className="plan-name">{plan.name}</h3>
                        <p className="text-muted" style={{ marginBottom: "1rem" }}>{plan.description}</p>

                        <div className="plan-price">
                            ₹{plan.price}
                            <span className="plan-period">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                        </div>

                        <ul className="plan-features">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="feature-item">
                                    <span className="check-icon">✔</span> {feature}
                                </li>
                            ))}
                            {plan.notIncluded.map((feature, i) => (
                                <li key={i} className="feature-item" style={{ opacity: 0.5 }}>
                                    <span className="cross-icon">✘</span> {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`plan-btn ${plan.isPopular ? "primary" : ""}`}
                            onClick={() => handlePlanSelect(plan.name)}
                        >
                            {plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>

            {/* FAQ */}
            <div className="faq-section">
                <h2 className="faq-title">Frequently Asked Questions</h2>

                <div className="faq-item">
                    <details>
                        <summary className="faq-question">Can I switch plans later?</summary>
                        <div className="faq-answer">
                            Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in the next billing cycle.
                        </div>
                    </details>
                </div>

                <div className="faq-item">
                    <details>
                        <summary className="faq-question">Is there a free trial?</summary>
                        <div className="faq-answer">
                            Absolutely! All paid plans come with a 14-day free trial, no credit card required.
                        </div>
                    </details>
                </div>

                <div className="faq-item">
                    <details>
                        <summary className="faq-question">What payment methods do you accept?</summary>
                        <div className="faq-answer">
                            We accept all major credit cards, UPI, and Net Banking securely via Razorpay.
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
}
