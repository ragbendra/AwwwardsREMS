'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import portfolioData from '@/data/mockPortfolio.json';

interface PropertyData {
    id: string;
    name: string;
    type: string;
    tagline?: string;
    value: number;
    units: number;
    occupancy: number;
    appreciationPercent?: number;
    architect?: string;
}

interface CompareViewProps {
    isOpen: boolean;
    onClose: () => void;
    initialPropertyId?: string;
}

/**
 * Comparative Reality - Split-screen property comparison
 * The signature innovation for Awwwards
 */
export default function CompareView({ isOpen, onClose, initialPropertyId }: CompareViewProps) {
    const [leftProperty, setLeftProperty] = useState<PropertyData | null>(
        initialPropertyId
            ? portfolioData.properties.find(p => p.id === initialPropertyId) || null
            : null
    );
    const [rightProperty, setRightProperty] = useState<PropertyData | null>(null);
    const [dividerPosition, setDividerPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);

    // Get available properties for selection
    const availableProperties = useMemo(() => {
        return portfolioData.properties.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            tagline: p.tagline,
            value: p.value,
            units: p.units,
            occupancy: p.occupancy,
            appreciationPercent: p.appreciationPercent,
            architect: p.architect,
        }));
    }, []);

    // Calculate comparison metrics
    const comparisons = useMemo(() => {
        if (!leftProperty || !rightProperty) return null;

        const valueDiff = rightProperty.value - leftProperty.value;
        const occupancyDiff = rightProperty.occupancy - leftProperty.occupancy;
        const unitsDiff = rightProperty.units - leftProperty.units;
        const appreciationDiff = (rightProperty.appreciationPercent || 0) - (leftProperty.appreciationPercent || 0);

        return {
            value: {
                diff: valueDiff,
                label: valueDiff >= 0
                    ? `+$${(Math.abs(valueDiff) / 1000000).toFixed(0)}M more valuable`
                    : `-$${(Math.abs(valueDiff) / 1000000).toFixed(0)}M less valuable`,
                positive: valueDiff >= 0,
            },
            occupancy: {
                diff: occupancyDiff,
                label: `${occupancyDiff >= 0 ? '+' : ''}${occupancyDiff.toFixed(1)}% occupancy`,
                positive: occupancyDiff >= 0,
            },
            units: {
                diff: unitsDiff,
                label: `${unitsDiff >= 0 ? '+' : ''}${unitsDiff} units`,
                positive: unitsDiff >= 0,
            },
            appreciation: {
                diff: appreciationDiff,
                label: `${appreciationDiff >= 0 ? '+' : ''}${appreciationDiff}% appreciation`,
                positive: appreciationDiff >= 0,
            },
        };
    }, [leftProperty, rightProperty]);

    // Handle divider drag
    const handleDividerDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const newPosition = (clientX / window.innerWidth) * 100;
        setDividerPosition(Math.max(20, Math.min(80, newPosition)));
    }, [isDragging]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: 'var(--color-void)',
            }}
            onMouseMove={handleDividerDrag}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
        >
            {/* Header */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: 'var(--space-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 110,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
            }}>
                <div>
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 200,
                        color: 'var(--color-ivory)',
                    }}>
                        Comparative Reality
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-silver)',
                    }}>
                        Compare properties side by side
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid var(--color-graphite)',
                        borderRadius: '2px',
                        padding: 'var(--space-sm) var(--space-md)',
                        color: 'var(--color-ivory)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                    }}
                >
                    Exit Compare ✕
                </motion.button>
            </div>

            {/* Split View */}
            <div style={{
                display: 'flex',
                height: '100%',
                position: 'relative',
            }}>
                {/* Left Panel */}
                <motion.div
                    style={{
                        width: `${dividerPosition}%`,
                        height: '100%',
                        overflow: 'hidden',
                    }}
                >
                    <PropertyPanel
                        property={leftProperty}
                        onSelect={(p) => setLeftProperty(p)}
                        availableProperties={availableProperties}
                        side="left"
                        excludeId={rightProperty?.id}
                    />
                </motion.div>

                {/* Draggable Divider */}
                <motion.div
                    onMouseDown={() => setIsDragging(true)}
                    style={{
                        position: 'absolute',
                        left: `${dividerPosition}%`,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: 'var(--color-accent)',
                        cursor: 'ew-resize',
                        zIndex: 105,
                        transform: 'translateX(-50%)',
                    }}
                    whileHover={{ width: '8px' }}
                >
                    {/* Comparison Metrics */}
                    <AnimatePresence>
                        {comparisons && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'rgba(0, 0, 0, 0.95)',
                                    border: '1px solid var(--color-accent)',
                                    borderRadius: '4px',
                                    padding: 'var(--space-md)',
                                    minWidth: '200px',
                                    zIndex: 110,
                                }}
                            >
                                <ComparisonMetric {...comparisons.value} />
                                <ComparisonMetric {...comparisons.occupancy} />
                                <ComparisonMetric {...comparisons.units} />
                                <ComparisonMetric {...comparisons.appreciation} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Right Panel */}
                <motion.div
                    style={{
                        width: `${100 - dividerPosition}%`,
                        height: '100%',
                        overflow: 'hidden',
                    }}
                >
                    <PropertyPanel
                        property={rightProperty}
                        onSelect={(p) => setRightProperty(p)}
                        availableProperties={availableProperties}
                        side="right"
                        excludeId={leftProperty?.id}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}

// Property Panel Component
function PropertyPanel({
    property,
    onSelect,
    availableProperties,
    side,
    excludeId,
}: {
    property: PropertyData | null;
    onSelect: (p: PropertyData) => void;
    availableProperties: PropertyData[];
    side: 'left' | 'right';
    excludeId?: string;
}) {
    const filteredProperties = availableProperties.filter(p => p.id !== excludeId);

    if (!property) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 'var(--space-xl)',
                background: side === 'left'
                    ? 'linear-gradient(135deg, rgba(26, 26, 29, 0.9), rgba(10, 10, 11, 0.95))'
                    : 'linear-gradient(225deg, rgba(26, 26, 29, 0.9), rgba(10, 10, 11, 0.95))',
            }}>
                <h3 style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-silver)',
                    marginBottom: 'var(--space-lg)',
                }}>
                    Select Property {side === 'left' ? 'A' : 'B'}
                </h3>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-sm)',
                    width: '100%',
                    maxWidth: '300px',
                }}>
                    {filteredProperties.map((p) => (
                        <motion.button
                            key={p.id}
                            whileHover={{ scale: 1.02, x: side === 'left' ? 5 : -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(p)}
                            style={{
                                background: 'rgba(201, 169, 98, 0.1)',
                                border: '1px solid var(--color-graphite)',
                                borderRadius: '2px',
                                padding: 'var(--space-md)',
                                textAlign: 'left',
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-base)',
                                color: 'var(--color-ivory)',
                                marginBottom: 'var(--space-xs)',
                            }}>
                                {p.name}
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-accent)',
                            }}>
                                ${(p.value / 1000000).toFixed(0)}M • {p.occupancy}% occupied
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            height: '100%',
            padding: 'var(--space-xl)',
            paddingTop: 'calc(var(--space-xl) * 3)',
            background: side === 'left'
                ? 'linear-gradient(135deg, rgba(26, 26, 29, 0.9), rgba(10, 10, 11, 0.95))'
                : 'linear-gradient(225deg, rgba(26, 26, 29, 0.9), rgba(10, 10, 11, 0.95))',
        }}>
            {/* Property Type */}
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--color-accent)',
                marginBottom: 'var(--space-sm)',
            }}>
                {property.type}
            </div>

            {/* Property Name */}
            <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 200,
                color: 'var(--color-ivory)',
                marginBottom: 'var(--space-md)',
            }}>
                {property.name}
            </h3>

            {/* Tagline */}
            {property.tagline && (
                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontStyle: 'italic',
                    color: 'var(--color-silver)',
                    marginBottom: 'var(--space-lg)',
                }}>
                    "{property.tagline}"
                </p>
            )}

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-md)',
            }}>
                <StatBox label="Value" value={`$${(property.value / 1000000).toFixed(0)}M`} />
                <StatBox label="Units" value={property.units.toString()} />
                <StatBox label="Occupancy" value={`${property.occupancy}%`} highlight={property.occupancy === 100} />
                <StatBox label="Appreciation" value={`+${property.appreciationPercent || 0}%`} />
            </div>

            {/* Change Property Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(null as any)}
                style={{
                    marginTop: 'var(--space-xl)',
                    background: 'transparent',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '2px',
                    padding: 'var(--space-sm) var(--space-md)',
                    color: 'var(--color-silver)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                }}
            >
                Change Property
            </motion.button>
        </div>
    );
}

function StatBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div style={{
            background: 'rgba(26, 26, 29, 0.6)',
            border: `1px solid ${highlight ? 'var(--color-accent)' : 'var(--color-graphite)'}`,
            borderRadius: '2px',
            padding: 'var(--space-md)',
        }}>
            <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 300,
                color: highlight ? 'var(--color-accent)' : 'var(--color-ivory)',
            }}>
                {value}
            </div>
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-ash)',
            }}>
                {label}
            </div>
        </div>
    );
}

function ComparisonMetric({ label, positive }: { diff: number; label: string; positive: boolean }) {
    return (
        <div style={{
            padding: 'var(--space-xs) 0',
            borderBottom: '1px solid var(--color-graphite)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
        }}>
            <span style={{ color: positive ? '#4a7c59' : '#c9a962' }}>
                {positive ? '▲' : '▼'}
            </span>
            <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-pearl)',
            }}>
                {label}
            </span>
        </div>
    );
}
