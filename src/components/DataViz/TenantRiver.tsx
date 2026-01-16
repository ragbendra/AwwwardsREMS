'use client';

import { motion } from 'framer-motion';

interface TenantRiverProps {
    tenantCount: number;
    renewalRate: number; // 0-100
    avgLeaseLength: number; // in years
}

/**
 * Flowing River - Tenant stability visualization
 * Width = tenant count, Flow speed = renewal rate
 */
export default function TenantRiver({
    tenantCount,
    renewalRate,
    avgLeaseLength
}: TenantRiverProps) {
    // Normalize values
    const riverWidth = Math.min(tenantCount / 30, 5); // Scale width
    const flowSpeed = (100 - renewalRate) / 30 + 2; // Faster = less stable

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-lg)',
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--color-silver)',
                    marginBottom: 'var(--space-xs)',
                }}>
                    Tenant Stability
                </div>
                <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 300,
                    color: 'var(--color-accent)',
                }}>
                    {renewalRate}% Renewal Rate
                </div>
            </div>

            {/* River Visualization */}
            <div style={{
                width: '100%',
                height: '60px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '30px',
                background: 'var(--color-graphite)',
            }}>
                {/* Flowing water effect */}
                <motion.div
                    animate={{
                        x: ['-100%', '0%'],
                    }}
                    transition={{
                        duration: flowSpeed,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(90deg, 
                            transparent, 
                            rgba(90, 124, 159, 0.6) 25%, 
                            rgba(90, 124, 159, 0.8) 50%, 
                            rgba(90, 124, 159, 0.6) 75%, 
                            transparent
                        )`,
                        width: '200%',
                    }}
                />

                {/* Tenant particles */}
                {Array.from({ length: Math.min(tenantCount / 20, 15) }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            x: ['-20px', '120%'],
                        }}
                        transition={{
                            duration: flowSpeed * 0.8,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: 'linear',
                        }}
                        style={{
                            position: 'absolute',
                            top: `${20 + Math.random() * 60}%`,
                            left: 0,
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--color-accent)',
                            opacity: 0.7,
                        }}
                    />
                ))}
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-xl)',
                marginTop: 'var(--space-sm)',
            }}>
                <StatItem label="Total Tenants" value={tenantCount.toLocaleString()} />
                <StatItem label="Avg Lease" value={`${avgLeaseLength} years`} />
                <StatItem
                    label="Stability"
                    value={renewalRate > 90 ? 'Excellent' : renewalRate > 75 ? 'Strong' : 'Moderate'}
                    highlight
                />
            </div>
        </motion.div>
    );
}

function StatItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-lg)',
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
