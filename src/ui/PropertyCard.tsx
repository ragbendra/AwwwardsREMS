'use client';

import { motion } from 'framer-motion';

interface PropertyData {
    name: string;
    type: string;
    value: number;
    units: number;
    occupancy: number;
}

interface PropertyCardProps {
    property: PropertyData;
}

const formatValue = (value: number): string => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(0)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
};

export default function PropertyCard({ property }: PropertyCardProps) {
    return (
        <motion.div
            className="property-meta property-meta--visible"
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {/* Category Label */}
            <motion.div
                className="property-meta__label"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {property.type}
            </motion.div>

            {/* Property Name */}
            <motion.h2
                className="property-meta__title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                {property.name}
            </motion.h2>

            {/* Stats Grid */}
            <motion.div
                className="property-meta__stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <StatItem
                    value={formatValue(property.value)}
                    label="Value"
                    delay={0.5}
                />
                <StatItem
                    value={property.units.toString()}
                    label="Units"
                    delay={0.6}
                />
                <StatItem
                    value={`${property.occupancy}%`}
                    label="Occupied"
                    delay={0.7}
                />
            </motion.div>

            {/* Decorative Line */}
            <motion.div
                className="property-meta__line"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                    duration: 1,
                    delay: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                }}
            />
        </motion.div>
    );
}

function StatItem({
    value,
    label,
    delay,
}: {
    value: string;
    label: string;
    delay: number;
}) {
    return (
        <motion.div
            className="property-meta__stat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <motion.span
                className="property-meta__stat-value"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.1 }}
            >
                {value}
            </motion.span>
            <span className="property-meta__stat-label">{label}</span>
        </motion.div>
    );
}
