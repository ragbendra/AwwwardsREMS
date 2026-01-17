'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { getImageById, GalleryImageData } from '@/components/LayeredGallery/galleryData';

// Stagger animation timing
const STAGGER = {
    initial: 0.1,
    increment: 0.08,
};

// Easing for reveals - use as const for proper typing
const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<GalleryImageData | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Get property ID from URL
    const propertyId = params.id as string;

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Load property data
    useEffect(() => {
        const data = getImageById(propertyId);
        if (data) {
            setProperty(data);
            // Delay reveal animation to allow FLIP to complete
            setTimeout(() => setIsRevealing(true), 100);
        }
    }, [propertyId]);

    // Handle back navigation
    const handleBack = () => {
        // Use history API to go back (preserves scroll position via TransitionContext)
        window.history.back();
    };

    if (!property) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--color-void, #0a0a0a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                        color: 'var(--color-silver, #9ca3af)',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '14px',
                    }}
                >
                    Loading...
                </motion.div>
            </div>
        );
    }

    // Calculate stagger delays
    const getDelay = (index: number) =>
        reducedMotion ? 0 : STAGGER.initial + (index * STAGGER.increment);

    return (
        <main
            ref={scrollRef}
            style={{
                minHeight: '100vh',
                background: 'var(--color-void, #0a0a0a)',
                color: 'var(--color-ivory, #f5f5f5)',
                overflowX: 'hidden',
            }}
        >
            {/* Hero Image - receives FLIP animation target position */}
            <section
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '60vh',
                    overflow: 'hidden',
                }}
            >
                <Image
                    src={property.src}
                    alt={property.alt}
                    fill
                    priority
                    sizes="100vw"
                    style={{
                        objectFit: 'cover',
                    }}
                />

                {/* Gradient overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, transparent 30%, rgba(10, 10, 10, 0.8) 80%, var(--color-void, #0a0a0a) 100%)',
                    }}
                />
            </section>

            {/* Content Container */}
            <section
                style={{
                    position: 'relative',
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '0 24px 80px',
                    marginTop: '-80px',
                }}
            >
                {/* Back Button */}
                <AnimatePresence>
                    {isRevealing && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, delay: getDelay(0), ease: REVEAL_EASE }}
                            onClick={handleBack}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-accent, #c9a962)',
                                fontFamily: 'var(--font-mono, monospace)',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                cursor: 'pointer',
                                padding: '12px 0',
                                marginBottom: '32px',
                            }}
                            whileHover={{ x: -4 }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                    d="M10 12L6 8L10 4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Back to Gallery
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Title */}
                <AnimatePresence>
                    {isRevealing && (
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: getDelay(1), ease: REVEAL_EASE }}
                            style={{
                                fontFamily: 'var(--font-display, serif)',
                                fontSize: 'clamp(36px, 6vw, 64px)',
                                fontWeight: 200,
                                lineHeight: 1.1,
                                marginBottom: '12px',
                            }}
                        >
                            {property.title}
                        </motion.h1>
                    )}
                </AnimatePresence>

                {/* Location */}
                <AnimatePresence>
                    {isRevealing && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: getDelay(2), ease: REVEAL_EASE }}
                            style={{
                                fontFamily: 'var(--font-mono, monospace)',
                                fontSize: '13px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                color: 'var(--color-accent, #c9a962)',
                                marginBottom: '40px',
                            }}
                        >
                            {property.location}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* Divider Line */}
                <AnimatePresence>
                    {isRevealing && (
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: getDelay(3), ease: REVEAL_EASE }}
                            style={{
                                height: '1px',
                                background: 'linear-gradient(to right, var(--color-accent, #c9a962), transparent)',
                                marginBottom: '40px',
                                transformOrigin: 'left',
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Architect & Awards */}
                <AnimatePresence>
                    {isRevealing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: getDelay(4), ease: REVEAL_EASE }}
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '24px',
                                marginBottom: '32px',
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-mono, monospace)',
                                        fontSize: '10px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        color: 'var(--color-silver, #9ca3af)',
                                        display: 'block',
                                        marginBottom: '4px',
                                    }}
                                >
                                    Architect
                                </span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-body, sans-serif)',
                                        fontSize: '15px',
                                        color: 'var(--color-ivory, #f5f5f5)',
                                    }}
                                >
                                    {property.architect}
                                </span>
                            </div>

                            {property.awards.length > 0 && (
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-mono, monospace)',
                                            fontSize: '10px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.15em',
                                            color: 'var(--color-silver, #9ca3af)',
                                            display: 'block',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        Recognition
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-body, sans-serif)',
                                            fontSize: '14px',
                                            color: 'var(--color-pearl, #e5e5e5)',
                                        }}
                                    >
                                        {property.awards.join(' · ')}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Narrative Text */}
                <AnimatePresence>
                    {isRevealing && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: getDelay(5), ease: REVEAL_EASE }}
                            style={{
                                fontFamily: 'var(--font-body, sans-serif)',
                                fontSize: '17px',
                                lineHeight: 1.8,
                                color: 'var(--color-pearl, #e5e5e5)',
                                marginBottom: '48px',
                                maxWidth: '720px',
                            }}
                        >
                            {property.narrative}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* Stats Grid */}
                <AnimatePresence>
                    {isRevealing && property.stats.units > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: getDelay(6) }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '24px',
                                marginBottom: '60px',
                            }}
                        >
                            {[
                                { label: 'Value', value: property.stats.value },
                                { label: 'Units', value: property.stats.units.toString() },
                                { label: 'Occupancy', value: `${property.stats.occupancy}%` },
                                { label: 'Acquired', value: property.stats.yearAcquired.toString() },
                                { label: 'Appreciation', value: property.stats.appreciation },
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: getDelay(7) + (index * 0.05),
                                        ease: REVEAL_EASE
                                    }}
                                    style={{
                                        padding: '20px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '4px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-mono, monospace)',
                                            fontSize: '10px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.15em',
                                            color: 'var(--color-silver, #9ca3af)',
                                            display: 'block',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {stat.label}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-display, serif)',
                                            fontSize: '24px',
                                            fontWeight: 300,
                                            color: 'var(--color-accent, #c9a962)',
                                        }}
                                    >
                                        {stat.value}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Additional Images Gallery */}
                <AnimatePresence>
                    {isRevealing && property.additionalImages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: getDelay(8) }}
                        >
                            <h3
                                style={{
                                    fontFamily: 'var(--font-mono, monospace)',
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2em',
                                    color: 'var(--color-silver, #9ca3af)',
                                    marginBottom: '20px',
                                }}
                            >
                                Additional Views
                            </h3>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '16px',
                                }}
                            >
                                {property.additionalImages.map((src, index) => (
                                    <motion.div
                                        key={src}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: getDelay(9) + (index * 0.1),
                                            ease: REVEAL_EASE
                                        }}
                                        style={{
                                            position: 'relative',
                                            aspectRatio: '16/10',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Image
                                            src={src}
                                            alt={`${property.title} - view ${index + 2}`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            style={{
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Vignette overlay for premium feel */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)',
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
                aria-hidden="true"
            />
        </main>
    );
}
