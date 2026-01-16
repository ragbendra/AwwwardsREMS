'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface NavbarProps {
    isVisible: boolean;
    currentTime: string;
    scrollProgress: number;
}

const navItems = [
    { label: 'Portfolio', id: 'portfolio' },
    { label: 'Properties', id: 'properties' },
    { label: 'Analytics', id: 'analytics' },
    { label: 'Contact', id: 'contact' },
];

export default function Navbar({ isVisible, currentTime, scrollProgress }: NavbarProps) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Magnetic cursor effect values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animations for magnetic effect
    const springConfig = { damping: 25, stiffness: 300 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    // Progress bar animation
    const progressWidth = useTransform(
        useMotionValue(scrollProgress),
        [0, 1],
        ['0%', '100%']
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, itemId: string) => {
        if (hoveredItem !== itemId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;

        mouseX.set(deltaX);
        mouseY.set(deltaY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setHoveredItem(null);
    };

    const scrollToSection = (id: string) => {
        // Calculate target scroll position based on section
        const sectionMap: Record<string, number> = {
            portfolio: 0.1,
            properties: 0.3,
            analytics: 0.7,
            contact: 0.95,
        };

        const targetProgress = sectionMap[id] || 0;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const targetY = scrollHeight * targetProgress;

        window.scrollTo({
            top: targetY,
            behavior: 'smooth',
        });

        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <motion.nav
                className="navbar"
                initial={{ y: -100, opacity: 0 }}
                animate={{
                    y: isVisible ? 0 : -100,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                }}
                role="navigation"
                aria-label="Main navigation"
            >
                {/* Logo */}
                <motion.a
                    href="#"
                    className="navbar__logo"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    <span className="navbar__logo-text">MERIDIAN</span>
                    <span className="navbar__logo-accent" />
                </motion.a>

                {/* Desktop Navigation */}
                <div className="navbar__items" role="menubar">
                    {navItems.map((item) => (
                        <motion.div
                            key={item.id}
                            className="navbar__item-wrapper"
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseMove={(e) => handleMouseMove(e, item.id)}
                            onMouseLeave={handleMouseLeave}
                            style={{
                                x: hoveredItem === item.id ? x : 0,
                                y: hoveredItem === item.id ? y : 0,
                            }}
                        >
                            <motion.button
                                className="navbar__item"
                                onClick={() => scrollToSection(item.id)}
                                role="menuitem"
                                whileHover={{ color: 'var(--color-accent)' }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className="navbar__item-text">{item.label}</span>
                                <motion.span
                                    className="navbar__item-underline"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: hoveredItem === item.id ? 1 : 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Time Display */}
                <div className="navbar__time">
                    <span className="navbar__time-label">NYC</span>
                    <span className="navbar__time-value">{currentTime}</span>
                </div>

                {/* Mobile Menu Toggle */}
                <motion.button
                    className="navbar__mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={isMobileMenuOpen}
                    whileTap={{ scale: 0.9 }}
                >
                    <motion.span
                        className="navbar__mobile-line"
                        animate={{
                            rotate: isMobileMenuOpen ? 45 : 0,
                            y: isMobileMenuOpen ? 6 : 0,
                        }}
                    />
                    <motion.span
                        className="navbar__mobile-line"
                        animate={{
                            opacity: isMobileMenuOpen ? 0 : 1,
                            x: isMobileMenuOpen ? -10 : 0,
                        }}
                    />
                    <motion.span
                        className="navbar__mobile-line"
                        animate={{
                            rotate: isMobileMenuOpen ? -45 : 0,
                            y: isMobileMenuOpen ? -6 : 0,
                        }}
                    />
                </motion.button>

                {/* Progress Bar */}
                <motion.div
                    className="navbar__progress"
                    style={{ width: `${scrollProgress * 100}%` }}
                />
            </motion.nav>

            {/* Mobile Menu */}
            <motion.div
                className="navbar__mobile-menu"
                initial={{ opacity: 0, y: -20 }}
                animate={{
                    opacity: isMobileMenuOpen ? 1 : 0,
                    y: isMobileMenuOpen ? 0 : -20,
                    pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                {navItems.map((item, index) => (
                    <motion.button
                        key={item.id}
                        className="navbar__mobile-item"
                        onClick={() => scrollToSection(item.id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: isMobileMenuOpen ? 1 : 0,
                            y: isMobileMenuOpen ? 0 : 20,
                        }}
                        transition={{
                            duration: 0.4,
                            delay: isMobileMenuOpen ? index * 0.1 : 0,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        <span className="navbar__mobile-item-index">0{index + 1}</span>
                        <span className="navbar__mobile-item-text">{item.label}</span>
                    </motion.button>
                ))}
            </motion.div>
        </>
    );
}
