'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ValueCounterProps {
    targetValue: number; // Total value in dollars
    duration?: number; // Animation duration in ms
    showContext?: boolean;
}

/**
 * City Skyline - Animated counter showing portfolio value
 * Numbers count up from $0 with particle trail effect
 */
export default function ValueCounter({
    targetValue,
    duration = 2500,
    showContext = true
}: ValueCounterProps) {
    const [currentValue, setCurrentValue] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [milestoneReached, setMilestoneReached] = useState<number | null>(null);

    // Milestones for visual feedback
    const milestones = [100000000, 500000000, 1000000000]; // $100M, $500M, $1B

    useEffect(() => {
        const startTime = Date.now();
        setIsAnimating(true);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Eased progress for premium feel
            const eased = 1 - Math.pow(1 - progress, 4);
            const value = Math.round(targetValue * eased);

            setCurrentValue(value);

            // Check for milestones
            milestones.forEach(milestone => {
                if (value >= milestone && currentValue < milestone) {
                    setMilestoneReached(milestone);
                    setTimeout(() => setMilestoneReached(null), 500);
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
            }
        };

        const timeout = setTimeout(() => {
            requestAnimationFrame(animate);
        }, 500);

        return () => clearTimeout(timeout);
    }, [targetValue, duration]);

    // Format value to billions/millions
    const formatValue = (value: number): string => {
        if (value >= 1000000000) {
            return `$${(value / 1000000000).toFixed(2)}B`;
        } else if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(0)}M`;
        }
        return `$${value.toLocaleString()}`;
    };

    // Calculate equivalent apartments (avg Manhattan apartment = $1.5M)
    const equivalentApartments = Math.round(targetValue / 200000);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
                textAlign: 'center',
                position: 'relative',
            }}
        >
            {/* Label */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--color-silver)',
                    marginBottom: 'var(--space-sm)',
                }}
            >
                Total Portfolio Value
            </motion.div>

            {/* Main Value */}
            <motion.div
                animate={{
                    scale: milestoneReached ? [1, 1.02, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-hero)',
                    fontWeight: 100,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-ivory)',
                    position: 'relative',
                }}
            >
                {formatValue(currentValue)}

                {/* Particle trail effect */}
                {isAnimating && (
                    <motion.div
                        animate={{
                            opacity: [0.8, 0],
                            y: [-5, -30],
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 0.1,
                        }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '-10px',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: 'var(--color-accent)',
                        }}
                    />
                )}
            </motion.div>

            {/* Context line */}
            {showContext && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: duration / 1000 + 0.3 }}
                    style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-accent)',
                        marginTop: 'var(--space-md)',
                    }}
                >
                    = {equivalentApartments.toLocaleString()} Manhattan apartments
                </motion.div>
            )}

            {/* Milestone flash effect */}
            {milestoneReached && (
                <motion.div
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: 'absolute',
                        inset: '-20px',
                        background: 'radial-gradient(circle, rgba(201, 169, 98, 0.3), transparent)',
                        pointerEvents: 'none',
                    }}
                />
            )}
        </motion.div>
    );
}
