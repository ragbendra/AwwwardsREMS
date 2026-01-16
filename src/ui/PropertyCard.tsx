'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface PropertyData {
    name: string;
    type: string;
    tagline?: string;
    narrative?: string;
    value: number;
    units: number;
    occupancy: number;
    acquiredYear?: number;
    appreciationPercent?: number;
    architect?: string;
    awards?: string[];
}

interface PropertyCardProps {
    property: PropertyData;
}

// Animated counter hook
function useCountUp(target: number, duration: number = 1500, shouldAnimate: boolean = true) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!shouldAnimate) {
            setValue(target);
            return;
        }

        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Eased progress for premium feel
            const eased = 1 - Math.pow(1 - progress, 4);
            setValue(Math.round(target * eased));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        // Delay start for staggered effect
        const timeout = setTimeout(() => {
            animationFrame = requestAnimationFrame(animate);
        }, 300);

        return () => {
            clearTimeout(timeout);
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [target, duration, shouldAnimate]);

    return value;
}

const formatValue = (value: number): string => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(0)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
};

export default function PropertyCard({ property }: PropertyCardProps) {
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Animate values when visible
    const animatedValue = useCountUp(property.value / 1000000, 1500, isVisible);
    const animatedOccupancy = useCountUp(property.occupancy, 1200, isVisible);
    const animatedUnits = useCountUp(property.units, 1000, isVisible);

    useEffect(() => {
        // Delay visibility for entrance animation
        const timeout = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <motion.div
            ref={cardRef}
            className="property-meta property-meta--visible"
            initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(12px)' }}
            transition={{
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {/* Category Label */}
            <motion.div
                className="property-meta__label"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {property.type}
            </motion.div>

            {/* Property Name */}
            <motion.h2
                className="property-meta__title"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
            >
                {property.name}
            </motion.h2>

            {/* Tagline */}
            {property.tagline && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontStyle: 'italic',
                        color: 'var(--color-silver)',
                        marginBottom: 'var(--space-md)',
                        letterSpacing: '0.01em',
                    }}
                >
                    "{property.tagline}"
                </motion.p>
            )}

            {/* Stats Grid with Count-Up Animation */}
            <motion.div
                className="property-meta__stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <AnimatedStatItem
                    value={`$${animatedValue}M`}
                    label="Value"
                    delay={0.5}
                />
                <AnimatedStatItem
                    value={animatedUnits.toString()}
                    label="Residences"
                    delay={0.6}
                />
                <AnimatedStatItem
                    value={`${animatedOccupancy}%`}
                    label="Occupied"
                    delay={0.7}
                    isHighlight={property.occupancy === 100}
                />
            </motion.div>

            {/* Investment Narrative */}
            {property.acquiredYear && property.appreciationPercent && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    style={{
                        marginTop: 'var(--space-md)',
                        paddingTop: 'var(--space-md)',
                        borderTop: '1px solid var(--color-graphite)',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-pearl)',
                            lineHeight: 1.6,
                        }}
                    >
                        Acquired {property.acquiredYear}.{' '}
                        <span style={{ color: 'var(--color-accent)' }}>
                            +{property.appreciationPercent}% appreciation
                        </span>
                    </p>
                    {property.architect && (
                        <p
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-silver)',
                                marginTop: 'var(--space-xs)',
                                letterSpacing: '0.05em',
                            }}
                        >
                            By {property.architect}
                        </p>
                    )}
                </motion.div>
            )}

            {/* Decorative Line */}
            <motion.div
                className="property-meta__line"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                    duration: 1.2,
                    delay: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                }}
            />
        </motion.div>
    );
}

function AnimatedStatItem({
    value,
    label,
    delay,
    isHighlight = false,
}: {
    value: string;
    label: string;
    delay: number;
    isHighlight?: boolean;
}) {
    return (
        <motion.div
            className="property-meta__stat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
        >
            <motion.span
                className="property-meta__stat-value"
                style={{
                    color: isHighlight ? 'var(--color-accent)' : 'var(--color-pure)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: delay + 0.1 }}
            >
                {value}
            </motion.span>
            <span className="property-meta__stat-label">{label}</span>
        </motion.div>
    );
}
