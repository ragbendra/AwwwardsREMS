'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function Footer() {
    const footerRef = useRef<HTMLElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [currentYear] = useState(new Date().getFullYear());

    // Mouse tracking for ambient light
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 100, damping: 30 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    // Track mouse for ambient gradient
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!footerRef.current) return;

            const rect = footerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            mouseX.set(x);
            mouseY.set(y);
            setMousePosition({ x, y });
        };

        const footer = footerRef.current;
        footer?.addEventListener('mousemove', handleMouseMove);

        return () => footer?.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    const links = [
        { label: 'LinkedIn', href: '#linkedin' },
        { label: 'Twitter', href: '#twitter' },
        { label: 'Instagram', href: '#instagram' },
    ];

    const navLinks = [
        { label: 'Properties', href: '#properties' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
        { label: 'Privacy', href: '#privacy' },
    ];

    return (
        <motion.footer
            ref={footerRef}
            className="footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            role="contentinfo"
        >
            {/* Ambient Moving Gradient */}
            <motion.div
                className="footer__ambient"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(201, 169, 98, 0.12), transparent 50%)`,
                }}
            />

            {/* Horizontal Line Animation */}
            <motion.div
                className="footer__line-top"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Main Footer Content */}
            <div className="footer__content">
                {/* Brand Column */}
                <motion.div
                    className="footer__brand"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <h2 className="footer__logo">MERIDIAN</h2>
                    <p className="footer__tagline">
                        Premium Real Estate Portfolio Management
                    </p>
                    <div className="footer__location">
                        <span className="footer__location-label">Headquarters</span>
                        <span className="footer__location-value">New York, NY</span>
                    </div>
                </motion.div>

                {/* Navigation Column */}
                <motion.div
                    className="footer__nav"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <h3 className="footer__nav-title">Navigation</h3>
                    <nav aria-label="Footer navigation">
                        <ul className="footer__nav-list">
                            {navLinks.map((link, index) => (
                                <motion.li
                                    key={link.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                                >
                                    <a href={link.href} className="footer__nav-link">
                                        <span className="footer__nav-link-text">{link.label}</span>
                                        <motion.span
                                            className="footer__nav-link-arrow"
                                            initial={{ x: 0 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            →
                                        </motion.span>
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </nav>
                </motion.div>

                {/* Connect Column */}
                <motion.div
                    className="footer__connect"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <h3 className="footer__connect-title">Connect</h3>
                    <div className="footer__social">
                        {links.map((link, index) => (
                            <motion.a
                                key={link.label}
                                href={link.href}
                                className="footer__social-link"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                                whileHover={{
                                    scale: 1.05,
                                    color: 'var(--color-accent)',
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {link.label}
                            </motion.a>
                        ))}
                    </div>

                    <div className="footer__cta">
                        <motion.a
                            href="#contact"
                            className="footer__cta-button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>Get in Touch</span>
                            <motion.span
                                className="footer__cta-arrow"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </motion.a>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Bar */}
            <motion.div
                className="footer__bottom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
            >
                <p className="footer__copyright">
                    © {currentYear} Meridian Capital. All rights reserved.
                </p>
                <p className="footer__credit">
                    <span>Designed for</span>
                    <span className="footer__credit-highlight"> Immersive Experience</span>
                </p>
            </motion.div>

            {/* Floating Particles */}
            <div className="footer__particles" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="footer__particle"
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                        style={{
                            left: `${15 + i * 18}%`,
                        }}
                    />
                ))}
            </div>
        </motion.footer>
    );
}
