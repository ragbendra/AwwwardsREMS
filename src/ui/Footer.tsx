'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import portfolioData from '@/data/mockPortfolio.json';

export default function Footer() {
    const footerRef = useRef<HTMLElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [currentYear] = useState(new Date().getFullYear());

    // Mouse tracking for ambient light
    const mouseX = useMotionValue(50);
    const mouseY = useMotionValue(50);

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

    const navLinks = [
        { label: 'Properties', href: '#properties' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
        { label: 'Privacy', href: '#privacy' },
    ];

    const resources = [
        { label: 'Market Intelligence Report', href: '#report' },
        { label: 'Past Performance', href: '#performance' },
        { label: 'Investor FAQ', href: '#faq' },
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
                {/* Brand Column - The Invitation */}
                <motion.div
                    className="footer__brand"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <h2 className="footer__logo">MERIDIAN</h2>
                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-lg)',
                            fontWeight: 300,
                            color: 'var(--color-ivory)',
                            marginTop: 'var(--space-md)',
                            marginBottom: 'var(--space-sm)',
                        }}
                    >
                        Ready to own tomorrow?
                    </p>
                    <p className="footer__tagline">
                        Schedule a private portfolio presentation.
                    </p>

                    {/* Proof Points */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        style={{
                            marginTop: 'var(--space-lg)',
                            padding: 'var(--space-md)',
                            background: 'rgba(201, 169, 98, 0.08)',
                            border: '1px solid rgba(201, 169, 98, 0.2)',
                            borderRadius: '2px',
                        }}
                    >
                        <p
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-accent)',
                            }}
                        >
                            {portfolioData.portfolio.investorCount} investors trust Meridian
                        </p>
                        <p
                            style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-silver)',
                                marginTop: 'var(--space-xs)',
                            }}
                        >
                            with ${(portfolioData.portfolio.totalValue / 1000000000).toFixed(1)}B in assets
                        </p>
                    </motion.div>
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

                {/* Resources Column */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.55 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                    }}
                >
                    <h3
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: 'var(--color-silver)',
                            marginBottom: 'var(--space-sm)',
                        }}
                    >
                        Resources
                    </h3>
                    {resources.map((resource, index) => (
                        <motion.a
                            key={resource.label}
                            href={resource.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                            style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-pearl)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-sm)',
                            }}
                            whileHover={{ color: 'var(--color-accent)', x: 4 }}
                        >
                            <span>📄</span>
                            {resource.label}
                        </motion.a>
                    ))}
                </motion.div>

                {/* CTA Column */}
                <motion.div
                    className="footer__connect"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <div className="footer__cta">
                        <motion.a
                            href="#contact"
                            className="footer__cta-button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-sm)',
                                padding: 'var(--space-md) var(--space-xl)',
                                background: 'var(--color-accent)',
                                color: 'var(--color-void)',
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-base)',
                                fontWeight: 500,
                                textDecoration: 'none',
                                borderRadius: '2px',
                            }}
                        >
                            <span>Schedule Private Presentation</span>
                            <motion.span
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </motion.a>
                        <p
                            style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-silver)',
                                marginTop: 'var(--space-sm)',
                                textAlign: 'center',
                            }}
                        >
                            Includes exclusive off-market preview
                        </p>
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
                <p
                    style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontStyle: 'italic',
                        color: 'var(--color-silver)',
                        marginTop: 'var(--space-md)',
                    }}
                >
                    "Built for those who see buildings as stories, not structures."
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
