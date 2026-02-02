import React, { useState } from "react";
import "./Contact.css";
import Navbar from "../components/Navbar";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Thank you for reaching out! We will get back to you shortly.");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <>
            <Navbar />
            <div className="contact-page">
                <header className="contact-header">
                    <h1 className="contact-title">Get in Touch</h1>
                    <p className="text-muted">Have questions? We'd love to hear from you.</p>
                </header>

                <div className="contact-container">
                    {/* Contact Info */}
                    <div className="contact-info">
                        <div className="info-item">
                            <div className="info-label">Email</div>
                            <div className="info-value">support@vaniboard.com</div>
                        </div>

                        <div className="info-item">
                            <div className="info-label">Phone</div>
                            <div className="info-value">+91 98765 43210</div>
                        </div>

                        <div className="info-item">
                            <div className="info-label">Office</div>
                            <div className="info-value">
                                Tech Park, Sector 5<br />
                                Chandigarh, India
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-wrapper">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea
                                    name="message"
                                    className="form-textarea"
                                    placeholder="How can we help you?"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-btn">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
