import React, { useState, useEffect } from "react";

/**
 * SplashScreen Component
 * 3-second animated logo reveal for brand identity
 */
export default function SplashScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Start exit animation after 2.5 seconds
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 2500);

        // Complete splash after 3 seconds
        const completeTimer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 3000);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className={`splash-screen ${isExiting ? "splash-exit" : ""}`}>
            {/* Background Particles */}
            <div className="splash-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            {/* Animated Logo Container */}
            <div className="splash-logo-container">
                {/* Logo Mark - Animated V */}
                <div className="splash-logo-mark">
                    <svg viewBox="0 0 60 60" className="logo-svg">
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#ffffff" />
                            </linearGradient>
                        </defs>
                        {/* V Shape */}
                        <path
                            className="logo-v-path"
                            d="M10 15 L30 45 L50 15"
                            fill="none"
                            stroke="url(#logoGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Dot */}
                        <circle
                            className="logo-dot"
                            cx="30"
                            cy="48"
                            r="4"
                            fill="url(#logoGradient)"
                        />
                    </svg>
                </div>

                {/* Logo Text */}
                <div className="splash-logo-text">
                    <span className="logo-letter" style={{ animationDelay: "0.6s" }}>V</span>
                    <span className="logo-letter" style={{ animationDelay: "0.7s" }}>a</span>
                    <span className="logo-letter" style={{ animationDelay: "0.8s" }}>n</span>
                    <span className="logo-letter" style={{ animationDelay: "0.9s" }}>i</span>
                    <span className="logo-space"></span>
                    <span className="logo-letter" style={{ animationDelay: "1.0s" }}>B</span>
                    <span className="logo-letter" style={{ animationDelay: "1.1s" }}>o</span>
                    <span className="logo-letter" style={{ animationDelay: "1.2s" }}>a</span>
                    <span className="logo-letter" style={{ animationDelay: "1.3s" }}>r</span>
                    <span className="logo-letter" style={{ animationDelay: "1.4s" }}>d</span>
                    <span className="logo-dot-text" style={{ animationDelay: "1.5s" }}>.</span>
                </div>

                {/* Tagline */}
                <div className="splash-tagline">
                    Smart Billing & Inventory
                </div>
            </div>

            {/* Loading Bar */}
            <div className="splash-loading-bar">
                <div className="splash-loading-progress"></div>
            </div>
        </div>
    );
}
