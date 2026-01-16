'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GalleryImage from './GalleryImage';
import { GalleryImageData, LAYER_CONFIG, getImagesByLayer } from './galleryData';

interface DepthLayerProps {
    layer: 1 | 2 | 3 | 4 | 5;
    scrollProgress: number;
    totalHeight: number;
    mousePosition: { x: number; y: number };
    isReducedMotion: boolean;
    onImageClick?: (image: GalleryImageData) => void;
}

export default function DepthLayer({
    layer,
    scrollProgress,
    totalHeight,
    mousePosition,
    isReducedMotion,
    onImageClick,
}: DepthLayerProps) {
    const layerRef = useRef<HTMLDivElement>(null);
    const images = getImagesByLayer(layer);
    const config = LAYER_CONFIG[layer];

    // Calculate Y translation based on scroll and layer speed
    const baseTranslation = scrollProgress * totalHeight;
    const layerTranslation = isReducedMotion ? 0 : baseTranslation * config.speed;

    // Cursor parallax: farther layers move less, closer layers move more
    // This creates the depth illusion with mouse movement
    const cursorParallaxFactor = config.speed * 30; // Max 30px movement for fastest layer
    const mouseX = isReducedMotion ? 0 : mousePosition.x * cursorParallaxFactor;
    const mouseY = isReducedMotion ? 0 : mousePosition.y * cursorParallaxFactor * 0.5;

    // Color grading: background cooler, foreground warmer
    const colorFilter = layer <= 2
        ? 'saturate(0.9) brightness(0.95)' // Background: cooler, darker
        : layer >= 4
            ? 'saturate(1.05) brightness(1.05)' // Foreground: warmer, brighter
            : 'none'; // Mid layers: neutral

    return (
        <motion.div
            ref={layerRef}
            className={`depth-layer depth-layer--${layer}`}
            style={{
                position: 'absolute',
                inset: 0,
                transform: `translateY(${-layerTranslation}px) translateX(${mouseX}px) translateY(${mouseY}px)`,
                filter: colorFilter,
                willChange: isReducedMotion ? 'auto' : 'transform',
                pointerEvents: 'auto',
                transition: isReducedMotion ? 'none' : 'transform 0.15s ease-out',
            }}
            aria-label={`${config.name} - ${images.length} images`}
        >
            {images.map((image) => (
                <GalleryImage
                    key={image.id}
                    image={image}
                    isReducedMotion={isReducedMotion}
                    onImageClick={onImageClick}
                />
            ))}
        </motion.div>
    );
}
