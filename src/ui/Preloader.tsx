'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
    onComplete?: () => void;
    duration?: number;
}

export default function Preloader({ onComplete, duration = 2500 }: PreloaderProps) {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const startTime = Date.now();
        const targetDuration = duration;

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min(elapsed / targetDuration, 1);

            setProgress(newProgress);

            if (newProgress < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                setIsComplete(true);
                setTimeout(() => {
                    setIsHidden(true);
                    onComplete?.();
                }, 800);
            }
        };

        requestAnimationFrame(updateProgress);
    }, [duration, onComplete]);

    if (isHidden) return null;

    return (
        <motion.div
            className="preloader"
            initial={{ opacity: 1 }}
            animate={{ opacity: isComplete ? 0 : 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Grain texture overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    opacity: 0.04,
                    pointerEvents: 'none',
                }}
            />

            {/* Center content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Brand mark */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 200,
                        letterSpacing: '0.3em',
                        color: 'var(--color-ivory)',
                        marginBottom: 'var(--space-xl)',
                        textAlign: 'center',
                    }}
                >
                    MERIDIAN
                </motion.div>

                {/* Progress bar */}
                <div className="preloader__progress">
                    <motion.div
                        className="preloader__bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                    />
                </div>

                {/* Loading text */}
                <motion.div
                    className="preloader__text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                        opacity: isComplete ? 0 : 0.6,
                        y: isComplete ? -10 : 0
                    }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        marginTop: 'var(--space-lg)',
                        textAlign: 'center',
                    }}
                >
                    {isComplete ? 'ENTERING' : 'LOADING EXPERIENCE'}
                </motion.div>

                {/* Percentage */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isComplete ? 0 : 0.4 }}
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-silver)',
                        marginTop: 'var(--space-sm)',
                        textAlign: 'center',
                    }}
                >
                    {Math.round(progress * 100)}%
                </motion.div>
            </div>
        </motion.div>
    );
}
