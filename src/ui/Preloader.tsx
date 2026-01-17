'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAssetLoadingManager, AssetLoadingState } from '@/experience/AssetLoadingManager';

interface PreloaderProps {
    onComplete?: () => void;
}

/**
 * Preloader — Minimalist asset-driven loading bar
 * No fake copy, no percentages, linear bar motion only.
 * Completes when AssetLoadingManager reports isComplete.
 */
export default function Preloader({ onComplete }: PreloaderProps) {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const manager = getAssetLoadingManager();

        // Subscribe to progress
        const unsubProgress = manager.onProgress((state: AssetLoadingState) => {
            // Linear progress, no easing
            setProgress(state.progress);
        });

        // Subscribe to complete
        const unsubComplete = manager.onComplete(() => {
            setIsComplete(true);
            // Fade out then notify
            setTimeout(() => {
                setIsHidden(true);
                onComplete?.();
            }, 800);
        });

        // If no assets are being tracked, force complete after a brief delay
        // This handles scenes that don't load external assets
        const timeout = setTimeout(() => {
            const state = manager.getState();
            if (state.totalAssets === 0 && !state.isComplete) {
                manager.forceComplete();
            }
        }, 100);

        return () => {
            unsubProgress();
            unsubComplete();
            clearTimeout(timeout);
        };
    }, [onComplete]);

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

                {/* Progress bar — linear motion only */}
                <div className="preloader__progress" style={{ width: '200px', margin: '0 auto' }}>
                    <motion.div
                        className="preloader__bar"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
