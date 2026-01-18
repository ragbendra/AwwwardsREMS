'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollState } from '@/experience/ScrollManager';

/**
 * SceneTransitionWipe - Smooth visual transitions between major scenes.
 * Renders a horizontal wipe effect when scene changes.
 */
export default function SceneTransitionWipe(): React.ReactNode {
    const { sceneIndex } = useScrollState();
    const [showWipe, setShowWipe] = useState(false);
    const [wipeDirection, setWipeDirection] = useState<'left' | 'right'>('right');
    const prevSceneRef = useRef(sceneIndex);

    useEffect(() => {
        if (sceneIndex !== prevSceneRef.current) {
            // Determine wipe direction based on scroll
            setWipeDirection(sceneIndex > prevSceneRef.current ? 'right' : 'left');
            setShowWipe(true);

            // Hide wipe after animation
            const timer = setTimeout(() => {
                setShowWipe(false);
            }, 800);

            prevSceneRef.current = sceneIndex;
            return () => clearTimeout(timer);
        }
    }, [sceneIndex]);

    return (
        <AnimatePresence>
            {showWipe && (
                <motion.div
                    className="scene-transition-wipe"
                    role="presentation"
                    aria-hidden="true"
                    initial={{
                        x: wipeDirection === 'right' ? '-100%' : '100%',
                    }}
                    animate={{
                        x: ['0%', wipeDirection === 'right' ? '100%' : '-100%'],
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    transition={{
                        duration: 0.8,
                        ease: [0.76, 0, 0.24, 1], // Custom cubic-bezier for smooth wipe
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent 0%, var(--color-void) 20%, var(--color-void) 80%, transparent 100%)',
                        pointerEvents: 'none',
                        zIndex: 100,
                    }}
                />
            )}
        </AnimatePresence>
    );
}
