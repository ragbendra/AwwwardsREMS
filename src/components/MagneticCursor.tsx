'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface MagneticElement {
    element: HTMLElement;
    rect: DOMRect;
}

/**
 * MagneticCursor - Premium cursor with magnetic attraction to interactive elements.
 * Returns null on mobile/touch devices.
 * Adds 'custom-cursor-active' class to body when mounted.
 */
export default function MagneticCursor(): React.ReactNode {
    const [isMobile, setIsMobile] = useState(true); // Default to mobile for SSR
    const [cursorState, setCursorState] = useState<'default' | 'hover' | 'drag'>('default');
    const cursorRef = useRef<HTMLDivElement>(null);
    const magneticElementsRef = useRef<MagneticElement[]>([]);

    // Motion values for smooth cursor movement
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);

    // Spring physics for smooth following
    const springConfig = { stiffness: 500, damping: 50, mass: 0.5 };
    const springX = useSpring(cursorX, springConfig);
    const springY = useSpring(cursorY, springConfig);

    // Check for mobile/touch devices
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isTouchDevice =
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        setIsMobile(isTouchDevice);

        if (!isTouchDevice) {
            // Add body class to hide default cursor
            document.body.classList.add('custom-cursor-active');
        }

        return () => {
            document.body.classList.remove('custom-cursor-active');
        };
    }, []);

    // Find magnetic elements on mount
    useEffect(() => {
        if (isMobile || typeof window === 'undefined') return;

        const updateMagneticElements = (): void => {
            const elements = document.querySelectorAll<HTMLElement>(
                'button, a, [data-magnetic], .property-card, .cta-button'
            );
            magneticElementsRef.current = Array.from(elements).map(el => ({
                element: el,
                rect: el.getBoundingClientRect(),
            }));
        };

        updateMagneticElements();
        // Update on scroll/resize
        window.addEventListener('scroll', updateMagneticElements, { passive: true });
        window.addEventListener('resize', updateMagneticElements, { passive: true });

        return () => {
            window.removeEventListener('scroll', updateMagneticElements);
            window.removeEventListener('resize', updateMagneticElements);
        };
    }, [isMobile]);

    // Handle mouse movement with magnetic attraction
    const handleMouseMove = useCallback((e: MouseEvent): void => {
        const { clientX, clientY } = e;

        let targetX = clientX;
        let targetY = clientY;
        let isOverMagnetic = false;

        // Check for magnetic elements
        for (const { element, rect } of magneticElementsRef.current) {
            // Update rect for accurate detection
            const currentRect = element.getBoundingClientRect();
            const centerX = currentRect.left + currentRect.width / 2;
            const centerY = currentRect.top + currentRect.height / 2;

            // Distance from cursor to element center
            const distX = clientX - centerX;
            const distY = clientY - centerY;
            const distance = Math.sqrt(distX * distX + distY * distY);

            // Magnetic attraction radius (larger than element)
            const magneticRadius = Math.max(currentRect.width, currentRect.height) * 1.2;

            if (distance < magneticRadius) {
                // Apply magnetic pull (stronger when closer)
                const pull = 1 - distance / magneticRadius;
                const maxPull = 15; // Maximum pixel offset
                targetX = clientX + (centerX - clientX) * pull * 0.3;
                targetY = clientY + (centerY - clientY) * pull * 0.3;
                isOverMagnetic = true;
                break;
            }
        }

        cursorX.set(targetX);
        cursorY.set(targetY);
        setCursorState(isOverMagnetic ? 'hover' : 'default');
    }, [cursorX, cursorY]);

    // Add/remove mouse listener
    useEffect(() => {
        if (isMobile || typeof window === 'undefined') return;

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isMobile, handleMouseMove]);

    // Don't render on mobile
    if (isMobile) return null;

    return (
        <>
            {/* Main cursor dot */}
            <motion.div
                ref={cursorRef}
                className="magnetic-cursor"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    x: springX,
                    y: springY,
                    width: cursorState === 'hover' ? 48 : 16,
                    height: cursorState === 'hover' ? 48 : 16,
                    marginLeft: cursorState === 'hover' ? -24 : -8,
                    marginTop: cursorState === 'hover' ? -24 : -8,
                    backgroundColor: 'transparent',
                    border: `1px solid ${cursorState === 'hover' ? 'var(--color-accent)' : 'var(--color-ivory)'}`,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 10000,
                    mixBlendMode: 'difference',
                }}
                animate={{
                    scale: cursorState === 'hover' ? 1.2 : 1,
                    opacity: 1,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                }}
            />

            {/* Inner dot */}
            <motion.div
                className="magnetic-cursor-dot"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    x: cursorX,
                    y: cursorY,
                    width: 4,
                    height: 4,
                    marginLeft: -2,
                    marginTop: -2,
                    backgroundColor: cursorState === 'hover' ? 'var(--color-accent)' : 'var(--color-ivory)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 10001,
                }}
            />
        </>
    );
}
