'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface OccupancyGridProps {
    occupancyRate: number; // 0-100
    totalUnits?: number;
    showDetails?: boolean;
}

/**
 * Living Building - Occupancy visualization as a 10x10 window grid
 * Lit windows = occupied, dark windows = vacant
 */
export default function OccupancyGrid({
    occupancyRate,
    totalUnits = 100,
    showDetails = true
}: OccupancyGridProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredWindow, setHoveredWindow] = useState<number | null>(null);

    // Calculate occupied vs vacant
    const occupiedCount = Math.round((occupancyRate / 100) * 100);
    const vacantCount = 100 - occupiedCount;

    useEffect(() => {
        const timeout = setTimeout(() => setIsVisible(true), 200);
        return () => clearTimeout(timeout);
    }, []);

    // Create 100 windows (10x10 grid)
    const windows = Array.from({ length: 100 }, (_, index) => {
        const isOccupied = index < occupiedCount;
        return { index, isOccupied };
    });

    // Shuffle for visual interest (occupied and vacant mixed)
    const shuffledWindows = [...windows].sort(() => Math.random() - 0.5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-md)',
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        color: 'var(--color-silver)',
                        marginBottom: 'var(--space-xs)',
                    }}
                >
                    Portfolio Occupancy
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-4xl)',
                        fontWeight: 200,
                        color: 'var(--color-accent)',
                    }}
                >
                    {occupancyRate}%
                </motion.div>
            </div>

            {/* Window Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(10, 1fr)',
                    gap: '3px',
                    padding: 'var(--space-md)',
                    background: 'var(--color-graphite)',
                    borderRadius: '4px',
                    position: 'relative',
                }}
            >
                {shuffledWindows.map((window, i) => (
                    <motion.div
                        key={window.index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            delay: 0.5 + i * 0.01,
                            duration: 0.3,
                        }}
                        onMouseEnter={() => setHoveredWindow(window.index)}
                        onMouseLeave={() => setHoveredWindow(null)}
                        style={{
                            width: '12px',
                            height: '16px',
                            borderRadius: '1px',
                            background: window.isOccupied
                                ? 'var(--color-accent)'
                                : 'var(--color-obsidian)',
                            boxShadow: window.isOccupied
                                ? '0 0 8px rgba(201, 169, 98, 0.4)'
                                : 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            transform: hoveredWindow === window.index ? 'scale(1.3)' : 'scale(1)',
                        }}
                    >
                        {/* Pulse animation for occupied windows */}
                        {window.isOccupied && (
                            <motion.div
                                animate={{
                                    opacity: [0.4, 0.8, 0.4],
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'inherit',
                                    borderRadius: 'inherit',
                                }}
                            />
                        )}
                    </motion.div>
                ))}

                {/* Hover tooltip for vacant windows */}
                {hoveredWindow !== null && !shuffledWindows[hoveredWindow]?.isOccupied && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginBottom: 'var(--space-sm)',
                            padding: 'var(--space-xs) var(--space-sm)',
                            background: 'var(--color-void)',
                            border: '1px solid var(--color-accent)',
                            borderRadius: '2px',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                        }}
                    >
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-accent)',
                        }}>
                            {vacantCount} units available • 9+ applications pending
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Legend */}
            {showDetails && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    style={{
                        display: 'flex',
                        gap: 'var(--space-lg)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-silver)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            background: 'var(--color-accent)',
                            borderRadius: '1px',
                        }} />
                        <span>{occupiedCount} Occupied</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            background: 'var(--color-obsidian)',
                            borderRadius: '1px',
                        }} />
                        <span>{vacantCount} Available</span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
