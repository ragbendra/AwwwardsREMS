'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';

interface GallerySectionProps {
    scrollProgress: number;
}

// Enhanced gallery images with rich metadata
const galleryImages = [
    {
        src: '/images/modern_building_glass_facade.png',
        alt: 'Modern Glass Building',
        title: 'The Obsidian Tower',
        caption: 'Manhattan, NY',
        metadata: {
            location: '4 blocks from Central Park',
            temporal: 'Golden hour, south-facing',
            architectural: 'Floor-to-ceiling glass by Foster + Partners',
            context: 'Featured in Architectural Digest 2022',
        }
    },
    {
        src: '/images/penthouse_interior.png',
        alt: 'Penthouse Interior',
        title: 'Penthouse Suite',
        caption: 'Slate Residences',
        metadata: {
            location: 'SoHo historic district',
            temporal: '4,800 hours of direct sunlight annually',
            architectural: 'Italian marble, hand-cut artisan details',
            context: 'Zero vacancy since launch',
        }
    },
    {
        src: '/images/rooftop_terrace.png',
        alt: 'Rooftop Terrace',
        title: 'Sky Lounge',
        caption: 'Waterfront Collection',
        metadata: {
            location: 'Hudson River views',
            temporal: 'Sunset-facing, west exposure',
            architectural: 'Private marina access',
            context: 'Best Waterfront Development 2023',
        }
    },
    {
        src: '/images/luxury_apartment_interior.png',
        alt: 'Luxury Interior',
        title: 'Designer Living',
        caption: 'Horizon Gardens',
        metadata: {
            location: 'Williamsburg waterfront',
            temporal: 'Morning light, east exposure',
            architectural: 'LEED Platinum certified',
            context: 'Sustainable design by BIG Architects',
        }
    },
    {
        src: '/images/modern_office_lobby.png',
        alt: 'Modern Lobby',
        title: 'Executive Lobby',
        caption: 'Apex Business Center',
        metadata: {
            location: 'Midtown Manhattan',
            temporal: 'Atrium with natural daylight',
            architectural: '38-floor tower by SOM',
            context: 'Premium corporate tenants',
        }
    },
    {
        src: '/images/architectural_detail.png',
        alt: 'Architectural Detail',
        title: 'Glass & Gold',
        caption: 'The Obsidian Tower',
        metadata: {
            location: 'Tribeca landmark',
            temporal: 'Dusk reflection',
            architectural: 'Carrara marble imported from Italy',
            context: '46% appreciation since acquisition',
        }
    },
];


export default function GallerySection({ scrollProgress }: GallerySectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [shuffleKey, setShuffleKey] = useState(0);

    // Gallery entrance animation based on scroll
    const galleryProgress = Math.max(0, (scrollProgress - 0.7) / 0.25);

    // Shuffle images on scroll (triggered periodically)
    useEffect(() => {
        const handleScroll = () => {
            const scrollDelta = Math.floor(scrollProgress * 10);
            setShuffleKey(scrollDelta);
        };

        handleScroll();
    }, [scrollProgress]);

    // Auto-rotate images when not hovered
    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % galleryImages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isHovered]);

    const currentImage = galleryImages[activeImage];

    return (
        <motion.section
            ref={containerRef}
            className="gallery-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: galleryProgress > 0.1 ? 1 : 0 }}
            transition={{ duration: 1 }}
            aria-label="Property Gallery"
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-xl)',
                pointerEvents: galleryProgress > 0.1 ? 'auto' : 'none',
            }}
        >
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{
                    opacity: galleryProgress > 0.2 ? 1 : 0,
                    y: galleryProgress > 0.2 ? 0 : 40,
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    textAlign: 'center',
                    marginBottom: 'var(--space-xl)',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: 'var(--color-accent)',
                    }}
                >
                    Gallery
                </span>
                <h2
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 200,
                        color: 'var(--color-ivory)',
                        marginTop: 'var(--space-sm)',
                    }}
                >
                    Portfolio Highlights
                </h2>
                <p
                    style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-silver)',
                        marginTop: 'var(--space-xs)',
                        fontStyle: 'italic',
                    }}
                >
                    Hover for spatial intelligence
                </p>
            </motion.div>

            {/* Main Gallery Grid */}
            <motion.div
                key={shuffleKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-md)',
                    maxWidth: '900px',
                    width: '100%',
                }}
            >
                {galleryImages.map((image, index) => {
                    const isActive = index === activeImage;
                    const isItemHovered = hoveredIndex === index;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{
                                opacity: galleryProgress > 0.3 ? 1 : 0,
                                y: galleryProgress > 0.3 ? 0 : 30,
                                scale: isItemHovered ? 1.05 : 1,
                                zIndex: isItemHovered ? 10 : 1,
                            }}
                            transition={{
                                duration: 0.6,
                                delay: index * 0.08,
                                scale: { duration: 0.3 },
                            }}
                            onClick={() => setActiveImage(index)}
                            onMouseEnter={() => {
                                setIsHovered(true);
                                setHoveredIndex(index);
                            }}
                            onMouseLeave={() => {
                                setIsHovered(false);
                                setHoveredIndex(null);
                            }}
                            style={{
                                position: 'relative',
                                aspectRatio: '4/3',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: isActive
                                    ? '2px solid var(--color-accent)'
                                    : '1px solid var(--color-graphite)',
                                boxShadow: isItemHovered
                                    ? '0 20px 40px rgba(0,0,0,0.5)'
                                    : '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                        >
                            {/* Image with gradient fallback */}
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: `linear-gradient(135deg, 
                                        hsl(${index * 30 + 200}, 30%, 15%) 0%, 
                                        hsl(${index * 30 + 220}, 40%, 8%) 100%)`,
                                }}
                            />

                            {/* Actual image */}
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                sizes="(max-width: 768px) 100vw, 300px"
                                style={{
                                    objectFit: 'cover',
                                    transition: 'transform 0.5s ease',
                                    transform: isItemHovered ? 'scale(1.1)' : 'scale(1)',
                                }}
                                onError={(e) => {
                                    // Hide broken image
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />

                            {/* Gradient Overlay */}
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
                                    opacity: isItemHovered ? 1 : 0.7,
                                    transition: 'opacity 0.3s ease',
                                }}
                            />

                            {/* Caption */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                style={{
                                    position: 'absolute',
                                    bottom: 'var(--space-sm)',
                                    left: 'var(--space-sm)',
                                    right: 'var(--space-sm)',
                                }}
                            >
                                <h3
                                    style={{
                                        fontFamily: 'var(--font-body)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 500,
                                        color: 'var(--color-ivory)',
                                    }}
                                >
                                    {image.title}
                                </h3>
                                <p
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '10px',
                                        color: 'var(--color-accent)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    {image.caption}
                                </p>
                            </motion.div>

                            {/* Hover Metadata Overlay */}
                            <AnimatePresence>
                                {isItemHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            position: 'absolute',
                                            top: 'var(--space-sm)',
                                            right: 'var(--space-sm)',
                                            background: 'rgba(0, 0, 0, 0.9)',
                                            backdropFilter: 'blur(8px)',
                                            padding: 'var(--space-sm)',
                                            borderRadius: '2px',
                                            border: '1px solid rgba(201, 169, 98, 0.3)',
                                            maxWidth: '180px',
                                        }}
                                    >
                                        <MetadataLine icon="📍" text={image.metadata.location} />
                                        <MetadataLine icon="☀️" text={image.metadata.temporal} />
                                        <MetadataLine icon="⭐" text={image.metadata.context} highlight />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Hover shine effect */}
                            <motion.div
                                initial={{ x: '-100%', opacity: 0 }}
                                animate={{
                                    x: isItemHovered ? '200%' : '-100%',
                                    opacity: isItemHovered ? 0.3 : 0,
                                }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '50%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                    pointerEvents: 'none',
                                }}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Navigation Dots */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: galleryProgress > 0.4 ? 1 : 0 }}
                style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    marginTop: 'var(--space-lg)',
                    alignItems: 'center',
                }}
            >
                {galleryImages.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            width: index === activeImage ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            background: index === activeImage
                                ? 'var(--color-accent)'
                                : 'var(--color-graphite)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        aria-label={`View image ${index + 1}`}
                    />
                ))}
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-silver)',
                        marginLeft: 'var(--space-sm)',
                    }}
                >
                    {activeImage + 1} / {galleryImages.length}
                </span>
            </motion.div>

            {/* Ambient glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: `radial-gradient(ellipse at 50% 70%, rgba(201, 169, 98, 0.08), transparent 60%)`,
                }}
            />
        </motion.section>
    );
}

// Metadata line component
function MetadataLine({ icon, text, highlight = false }: { icon: string; text: string; highlight?: boolean }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '4px',
                marginBottom: '4px',
            }}
        >
            <span style={{ fontSize: '10px' }}>{icon}</span>
            <span
                style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    color: highlight ? 'var(--color-accent)' : 'var(--color-pearl)',
                    lineHeight: 1.3,
                }}
            >
                {text}
            </span>
        </div>
    );
}
