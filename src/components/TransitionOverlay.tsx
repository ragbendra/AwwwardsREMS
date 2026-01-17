'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTransition } from '@/context/TransitionContext';

// FLIP animation timing constants - tuned for smooth cinematic feel
const TIMING = {
    morphDuration: 0.7,
    morphEase: [0.22, 1, 0.36, 1] as const, // Custom easing for smooth deceleration
    bgFadeDuration: 0.5,
};

export default function TransitionOverlay() {
    const {
        isTransitioning,
        transitionType,
        transitionPhase,
        origin,
        setTransitionPhase,
        completeTransition,
    } = useTransition();

    const [isMounted, setIsMounted] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const hasStartedRef = useRef(false);

    // Ensure we're on client side for portal
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Track when animation starts to prevent re-triggering
    useEffect(() => {
        if (transitionPhase === 'dissolving' && !hasStartedRef.current) {
            hasStartedRef.current = true;
            // Move to morphing phase immediately
            requestAnimationFrame(() => {
                setTransitionPhase('morphing');
            });
        } else if (transitionPhase === 'idle') {
            hasStartedRef.current = false;
        }
    }, [transitionPhase, setTransitionPhase]);

    // Handle animation completion
    const handleMorphComplete = () => {
        if (transitionType === 'gallery-to-detail' && transitionPhase === 'morphing') {
            setTransitionPhase('revealing');
            // Allow overlay content to start appearing, then complete
            setTimeout(() => {
                completeTransition();
            }, 200);
        }
    };

    // Don't render if not in forward transition or no origin
    if (!isMounted || !origin) {
        return null;
    }

    // Only render for forward transitions during active phases
    const shouldRender = transitionType === 'gallery-to-detail' &&
        (transitionPhase === 'dissolving' || transitionPhase === 'morphing' || transitionPhase === 'revealing');

    if (!shouldRender) {
        return null;
    }

    // Calculate destination rect (hero position - 60vh)
    const heroRect = {
        top: 0,
        left: 0,
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight * 0.6 : 600,
    };

    // Starting values from captured rect
    const startRect = origin.rect;

    const overlay = (
        <AnimatePresence>
            <motion.div
                ref={overlayRef}
                className="transition-overlay"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    pointerEvents: 'none',
                    background: 'transparent',
                }}
            >
                {/* Background fade to scene color - appears behind morphing image */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: TIMING.bgFadeDuration, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'var(--color-void, #0a0a0a)',
                        zIndex: 9998,
                    }}
                />

                {/* Floating image clone - FLIP animation */}
                <motion.div
                    className="transition-image-clone"
                    initial={{
                        position: 'fixed',
                        top: startRect.top,
                        left: startRect.left,
                        width: startRect.width,
                        height: startRect.height,
                        borderRadius: 4,
                        zIndex: 10000,
                    }}
                    animate={{
                        top: heroRect.top,
                        left: heroRect.left,
                        width: heroRect.width,
                        height: heroRect.height,
                        borderRadius: 0,
                    }}
                    transition={{
                        duration: TIMING.morphDuration,
                        ease: TIMING.morphEase,
                    }}
                    onAnimationComplete={handleMorphComplete}
                    style={{
                        overflow: 'hidden',
                        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6)',
                    }}
                >
                    <Image
                        src={origin.src}
                        alt={origin.data.alt}
                        fill
                        sizes="100vw"
                        priority
                        style={{
                            objectFit: 'cover',
                        }}
                    />

                    {/* Gradient overlay that fades in during morph */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.8) 80%, var(--color-void, #0a0a0a) 100%)',
                        }}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    // Render via portal to ensure it's above everything
    return createPortal(overlay, document.body);
}
