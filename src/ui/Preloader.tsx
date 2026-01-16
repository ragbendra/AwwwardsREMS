'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
    onComplete?: () => void;
    duration?: number;
}

// Narrative loading states that tell a story
const loadingStates = [
    { text: "Analyzing market signals", detail: "847 data points" },
    { text: "Mapping architectural ecosystems", detail: "5 neighborhoods" },
    { text: "Calibrating spatial intelligence", detail: "23 properties" },
    { text: "Preparing your portfolio", detail: "Almost ready" },
];

const manifesto = "Where architecture becomes investment.";

export default function Preloader({ onComplete, duration = 3500 }: PreloaderProps) {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [currentStateIndex, setCurrentStateIndex] = useState(0);
    const [manifestoVisible, setManifestoVisible] = useState(false);

    // Calculate which loading state to show based on progress
    const currentState = useMemo(() => {
        const index = Math.min(
            Math.floor(progress * loadingStates.length),
            loadingStates.length - 1
        );
        return loadingStates[index];
    }, [progress]);

    useEffect(() => {
        const startTime = Date.now();
        const targetDuration = duration;

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min(elapsed / targetDuration, 1);

            setProgress(newProgress);

            // Update state index for animations
            const newIndex = Math.min(
                Math.floor(newProgress * loadingStates.length),
                loadingStates.length - 1
            );
            if (newIndex !== currentStateIndex) {
                setCurrentStateIndex(newIndex);
            }

            if (newProgress < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                setManifestoVisible(true);
                setTimeout(() => {
                    setIsComplete(true);
                    setTimeout(() => {
                        setIsHidden(true);
                        onComplete?.();
                    }, 800);
                }, 600);
            }
        };

        requestAnimationFrame(updateProgress);
    }, [duration, onComplete, currentStateIndex]);

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
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                {/* Brand mark */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 200,
                        letterSpacing: '0.3em',
                        color: 'var(--color-ivory)',
                        marginBottom: 'var(--space-xl)',
                    }}
                >
                    MERIDIAN
                </motion.div>

                {/* Narrative Loading State */}
                <motion.div
                    key={currentStateIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        marginBottom: 'var(--space-lg)',
                        minHeight: '48px',
                    }}
                >
                    <div
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-ivory)',
                            letterSpacing: '0.02em',
                            marginBottom: 'var(--space-xs)',
                        }}
                    >
                        {currentState.text}
                    </div>
                    <div
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-accent)',
                            letterSpacing: '0.1em',
                        }}
                    >
                        {currentState.detail}
                    </div>
                </motion.div>

                {/* Progress bar */}
                <div className="preloader__progress" style={{ width: '200px', margin: '0 auto' }}>
                    <motion.div
                        className="preloader__bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                    />
                </div>

                {/* Manifesto reveal */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{
                        opacity: manifestoVisible ? 1 : 0,
                        y: manifestoVisible ? 0 : 15
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        marginTop: 'var(--space-xl)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontStyle: 'italic',
                        color: 'var(--color-silver)',
                        letterSpacing: '0.02em',
                    }}
                >
                    {manifesto}
                </motion.div>

                {/* Percentage */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isComplete ? 0 : 0.4 }}
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-silver)',
                        marginTop: 'var(--space-lg)',
                    }}
                >
                    {Math.round(progress * 100)}%
                </motion.div>
            </div>
        </motion.div>
    );
}
