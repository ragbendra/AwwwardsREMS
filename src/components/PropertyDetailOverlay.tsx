'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTransition } from '@/context/TransitionContext';
import { galleryImages, GalleryImageData } from '@/components/LayeredGallery/galleryData';

// Timing constants for smooth transitions
const TIMING = {
    enterDuration: 0.8,
    exitDuration: 0.6,
    staggerDelay: 0.08,
    ease: [0.16, 1, 0.3, 1] as const,
};

// Portfolio system info
const PORTFOLIO_COUNT = galleryImages.length;

export default function PropertyDetailOverlay() {
    const {
        isTransitioning,
        transitionType,
        transitionPhase,
        origin,
        destinationId,
        completeTransition,
        startReverseTransition,
        completeReverseTransition,
    } = useTransition();

    const [isMounted, setIsMounted] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Get the property data
    const property = destinationId ? galleryImages.find(img => img.id === destinationId) : null;

    // Ensure we're on client side for portal
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Show content when transition is complete or revealing
    useEffect(() => {
        if (transitionPhase === 'revealing' || transitionPhase === 'complete') {
            setShowContent(true);
        } else if (transitionPhase === 'idle' && transitionType === null) {
            setShowContent(false);
        }
    }, [transitionPhase, transitionType]);

    // Handle back navigation
    const handleBack = () => {
        startReverseTransition();

        // Animate out then complete
        setTimeout(() => {
            completeReverseTransition();
        }, TIMING.exitDuration * 1000 + 100);
    };

    // Focus management for accessibility
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (showContent) {
            // Store previously focused element
            previousActiveElement.current = document.activeElement as HTMLElement;

            // Focus the close button when overlay opens
            setTimeout(() => closeButtonRef.current?.focus(), 100);

            // Handle ESC key to close
            const handleKeyDown = (e: KeyboardEvent): void => {
                if (e.key === 'Escape') {
                    handleBack();
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                // Return focus to previous element on cleanup
                previousActiveElement.current?.focus();
            };
        }
    }, [showContent]);

    // Don't render if no destination or not mounted
    if (!isMounted || !property) {
        return null;
    }

    // Only show when we're in a forward transition completing, or when content is visible
    const shouldRender = showContent ||
        (transitionType === 'gallery-to-detail' && (transitionPhase === 'revealing' || transitionPhase === 'complete'));

    if (!shouldRender) {
        return null;
    }

    const overlay = (
        <AnimatePresence mode="wait">
            {showContent && (
                <motion.div
                    ref={contentRef}
                    className="property-detail-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: TIMING.ease }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9000,
                        background: 'var(--color-void, #0a0a0a)',
                        overflow: 'hidden', // No scrolling
                    }}
                >
                    {/* Full-screen Hero Image */}
                    <motion.div
                        className="property-hero"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, ease: TIMING.ease }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Image
                            src={property.src}
                            alt={property.alt}
                            fill
                            sizes="100vw"
                            priority
                            style={{
                                objectFit: 'cover',
                            }}
                        />

                        {/* Gradient overlay for text readability */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: `
                                    linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, transparent 30%),
                                    linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.4) 30%, transparent 60%),
                                    linear-gradient(to right, rgba(10,10,10,0.5) 0%, transparent 40%)
                                `,
                                pointerEvents: 'none',
                            }}
                        />
                    </motion.div>

                    {/* Back Button - Top Left */}
                    <motion.button
                        ref={closeButtonRef}
                        onClick={handleBack}
                        aria-label="Close property detail and return to gallery"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5, ease: TIMING.ease }}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            left: '2rem',
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '2rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-body, Inter)',
                            fontSize: '0.8rem',
                            fontWeight: 400,
                            letterSpacing: '0.08em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease',
                            zIndex: 50,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        }}
                    >
                        <span style={{ fontSize: '1rem' }}>←</span>
                        GALLERY
                    </motion.button>

                    {/* Architectural & Capital Context - Top Right */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6, ease: TIMING.ease }}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '2rem',
                            textAlign: 'right',
                            maxWidth: '340px',
                            zIndex: 50,
                        }}
                    >
                        <p style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono)',
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.5)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            marginBottom: '0.4rem',
                        }}>
                            {property.architect}
                        </p>
                        <p style={{
                            fontFamily: 'var(--font-body, Inter)',
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: 1.5,
                            fontWeight: 300,
                        }}>
                            {property.investmentThesis}
                        </p>
                    </motion.div>

                    {/* Property Identity Layer - Bottom Left */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.6, ease: TIMING.ease }}
                        style={{
                            position: 'absolute',
                            bottom: '5rem',
                            left: '2rem',
                            maxWidth: '500px',
                            zIndex: 50,
                        }}
                    >
                        {/* Property Name */}
                        <h1 style={{
                            fontFamily: 'var(--font-display, Outfit)',
                            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                            fontWeight: 200,
                            color: 'white',
                            marginBottom: '0.3rem',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                        }}>
                            {property.title}
                        </h1>

                        {/* Location */}
                        <p style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono)',
                            fontSize: '0.85rem',
                            color: 'var(--color-accent, #C4A052)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            marginBottom: '1rem',
                        }}>
                            {property.location}
                        </p>

                        {/* Architectural Intent Line */}
                        <p style={{
                            fontFamily: 'var(--font-body, Inter)',
                            fontSize: '0.9rem',
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: 300,
                            fontStyle: 'italic',
                            maxWidth: '380px',
                        }}>
                            {property.architecturalIntent}
                        </p>
                    </motion.div>

                    {/* Core Metrics Strip - Bottom Right */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.6, ease: TIMING.ease }}
                        style={{
                            position: 'absolute',
                            bottom: '5rem',
                            right: '2rem',
                            display: 'flex',
                            gap: '2.5rem',
                            zIndex: 50,
                        }}
                    >
                        {/* Asset Value - Gold accent */}
                        <MetricItem
                            label="Value"
                            value={property.stats?.value || '—'}
                            isAccent={true}
                        />

                        {/* Occupancy */}
                        <MetricItem
                            label="Occupancy"
                            value={`${property.stats?.occupancy || 0}%`}
                        />

                        {/* Units */}
                        <MetricItem
                            label="Units"
                            value={property.stats?.units?.toString() || '—'}
                        />

                        {/* Year Acquired */}
                        <MetricItem
                            label="Acquired"
                            value={property.stats?.yearAcquired?.toString() || '—'}
                        />
                    </motion.div>

                    {/* System Reminder - Bottom Center */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5, ease: TIMING.ease }}
                        style={{
                            position: 'absolute',
                            bottom: '1.5rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 50,
                        }}
                    >
                        <p style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono)',
                            fontSize: '0.65rem',
                            color: 'rgba(255,255,255,0.35)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                        }}>
                            Part of the Meridian Portfolio · {PORTFOLIO_COUNT} properties
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(overlay, document.body);
}

// Metric Item Component
function MetricItem({
    label,
    value,
    isAccent = false
}: {
    label: string;
    value: string;
    isAccent?: boolean;
}) {
    return (
        <div style={{ textAlign: 'right' }}>
            <p style={{
                fontFamily: 'var(--font-mono, JetBrains Mono)',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.25rem',
            }}>
                {label}
            </p>
            <p style={{
                fontFamily: 'var(--font-display, Outfit)',
                fontSize: '1.5rem',
                fontWeight: 300,
                color: isAccent ? 'var(--color-accent, #C4A052)' : 'white',
                letterSpacing: '-0.02em',
            }}>
                {value}
            </p>
        </div>
    );
}
