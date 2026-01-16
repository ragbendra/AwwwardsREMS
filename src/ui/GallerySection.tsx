'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';

interface GallerySectionProps {
    scrollProgress: number;
}

// Gallery images configuration
const galleryImages = [
    {
        src: '/images/modern_building_glass_facade.png',
        alt: 'Modern Glass Building',
        title: 'The Obsidian Tower',
        caption: 'Manhattan, NY',
    },
    {
        src: '/images/penthouse_interior.png',
        alt: 'Penthouse Interior',
        title: 'Penthouse Suite',
        caption: 'Slate Residences',
    },
    {
        src: '/images/rooftop_terrace.png',
        alt: 'Rooftop Terrace',
        title: 'Sky Lounge',
        caption: 'Waterfront Collection',
    },
    {
        src: '/images/luxury_apartment_interior.png',
        alt: 'Luxury Interior',
        title: 'Designer Living',
        caption: 'Horizon Gardens',
    },
    {
        src: '/images/modern_office_lobby.png',
        alt: 'Modern Lobby',
        title: 'Executive Lobby',
        caption: 'Apex Business Center',
    },
    {
        src: '/images/architectural_detail.png',
        alt: 'Architectural Detail',
        title: 'Glass & Gold',
        caption: 'The Obsidian Tower',
    },
];


export default function GallerySection({ scrollProgress }: GallerySectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Gallery entrance animation based on scroll
    const galleryProgress = Math.max(0, (scrollProgress - 0.7) / 0.25);

    // Parallax values for each image layer
    const parallaxY1 = useSpring((1 - galleryProgress) * 100, { stiffness: 100, damping: 30 });
    const parallaxY2 = useSpring((1 - galleryProgress) * 150, { stiffness: 80, damping: 25 });
    const parallaxY3 = useSpring((1 - galleryProgress) * 200, { stiffness: 60, damping: 20 });

    // Auto-rotate images
    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % galleryImages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <motion.section
            ref={containerRef}
            className="gallery-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: galleryProgress > 0.1 ? 1 : 0 }}
            transition={{ duration: 1 }}
            aria-label="Property Gallery"
        >
            {/* Section Header */}
            <motion.div
                className="gallery-section__header"
                initial={{ opacity: 0, y: 40 }}
                animate={{
                    opacity: galleryProgress > 0.2 ? 1 : 0,
                    y: galleryProgress > 0.2 ? 0 : 40,
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <span className="gallery-section__label">Gallery</span>
                <h2 className="gallery-section__title">Portfolio Highlights</h2>
            </motion.div>

            {/* Layered Gallery Grid */}
            <div
                className="gallery-section__grid"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {galleryImages.map((image, index) => {
                    const isActive = index === activeImage;
                    const parallaxY = index === 0 ? parallaxY1 : index === 1 ? parallaxY2 : parallaxY3;
                    const zIndex = isActive ? 10 : galleryImages.length - index;
                    const rotateBase = (index - 1) * 3;

                    return (
                        <motion.div
                            key={index}
                            className={`gallery-section__item ${isActive ? 'gallery-section__item--active' : ''}`}
                            style={{
                                zIndex,
                                y: parallaxY,
                            }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                                opacity: galleryProgress > 0.3 ? 1 : 0,
                                scale: isActive ? 1 : 0.92,
                                rotate: isActive ? 0 : rotateBase,
                                x: isActive ? 0 : (index - 1) * 40,
                            }}
                            transition={{
                                duration: 0.8,
                                delay: index * 0.1,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            onClick={() => setActiveImage(index)}
                            role="button"
                            tabIndex={0}
                            aria-label={`View ${image.title}`}
                        >
                            {/* Image Container with Parallax */}
                            <motion.div
                                className="gallery-section__image-wrapper"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="gallery-section__image"
                                    style={{ objectFit: 'cover' }}
                                    priority={index === 0}
                                />

                                {/* Gradient Overlay */}
                                <div className="gallery-section__overlay" />

                                {/* Caption */}
                                <motion.div
                                    className="gallery-section__caption"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: isActive ? 1 : 0,
                                        y: isActive ? 0 : 20,
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h3 className="gallery-section__caption-title">{image.title}</h3>
                                    <p className="gallery-section__caption-text">{image.caption}</p>
                                </motion.div>
                            </motion.div>

                            {/* Hover Shine Effect */}
                            <motion.div
                                className="gallery-section__shine"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* Gallery Navigation Dots */}
            <motion.div
                className="gallery-section__nav"
                initial={{ opacity: 0 }}
                animate={{ opacity: galleryProgress > 0.4 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            >
                {galleryImages.map((_, index) => (
                    <button
                        key={index}
                        className={`gallery-section__dot ${index === activeImage ? 'gallery-section__dot--active' : ''
                            }`}
                        onClick={() => setActiveImage(index)}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </motion.div>

            {/* Ambient Light Effect */}
            <motion.div
                className="gallery-section__ambient"
                animate={{
                    background: `radial-gradient(ellipse at ${50 + activeImage * 10}% 50%, rgba(201, 169, 98, 0.08), transparent 60%)`,
                }}
                transition={{ duration: 2 }}
            />
        </motion.section>
    );
}
