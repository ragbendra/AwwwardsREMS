'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Image from 'next/image';
import { GalleryImageData, LAYER_CONFIG } from './galleryData';

interface GalleryImageProps {
    image: GalleryImageData;
    isReducedMotion: boolean;
    onImageClick?: (image: GalleryImageData) => void;
}

export default function GalleryImage({
    image,
    isReducedMotion,
    onImageClick
}: GalleryImageProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    const layerConfig = LAYER_CONFIG[image.layer];

    // Image dimensions based on layer
    const width = Math.round(280 * layerConfig.scale);
    const height = Math.round(200 * layerConfig.scale);

    // Handle drag end - keep the new position
    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        setDragOffset(prev => ({
            x: prev.x + info.offset.x,
            y: prev.y + info.offset.y,
        }));
    };

    return (
        <motion.div
            ref={imageRef}
            className="gallery-image"
            drag
            dragMomentum={false}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            whileDrag={{
                scale: 1.1,
                zIndex: 100,
                cursor: 'grabbing',
            }}
            style={{
                position: 'absolute',
                left: `${image.position.x}%`,
                top: `${image.position.y}%`,
                x: dragOffset.x,
                y: dragOffset.y,
                width: `${width}px`,
                height: `${height}px`,
                rotate: isReducedMotion ? 0 : image.rotation,
                filter: layerConfig.blur > 0 ? `blur(${layerConfig.blur}px)` : 'none',
                opacity: layerConfig.opacity,
                zIndex: isDragging ? 100 : image.layer * 10,
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            initial={isReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={isReducedMotion ? {} : {
                opacity: layerConfig.opacity,
                scale: isHovered && !isDragging ? 1.05 : image.scale,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onHoverStart={() => !isDragging && setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            aria-label={`${image.title} - ${image.location}. Drag to reposition.`}
        >
            {/* Skeleton placeholder */}
            {!isLoaded && !hasError && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(135deg, 
                            hsl(${image.layer * 30 + 200}, 20%, 12%) 0%, 
                            hsl(${image.layer * 30 + 220}, 30%, 8%) 100%)`,
                        borderRadius: '4px',
                    }}
                >
                    {/* Shimmer effect */}
                    <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                        }}
                    />
                </div>
            )}

            {/* Actual Image */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: isDragging
                        ? '2px solid var(--color-accent)'
                        : isHovered
                            ? '2px solid var(--color-accent)'
                            : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isDragging
                        ? '0 30px 80px rgba(0,0,0,0.7)'
                        : isHovered
                            ? '0 20px 60px rgba(0,0,0,0.6)'
                            : '0 8px 32px rgba(0,0,0,0.4)',
                    transition: 'border 0.3s ease, box-shadow 0.3s ease',
                }}
            >
                {/* Gradient fallback */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(135deg, 
                            hsl(${image.layer * 30 + 200}, 25%, 15%) 0%, 
                            hsl(${image.layer * 30 + 220}, 35%, 8%) 100%)`,
                    }}
                />

                {!hasError && (
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes={`${width}px`}
                        style={{
                            objectFit: 'cover',
                            opacity: isLoaded ? 1 : 0,
                            transition: 'opacity 0.5s ease, transform 0.4s ease',
                            transform: isHovered && !isDragging ? 'scale(1.05)' : 'scale(1)',
                            pointerEvents: 'none',
                        }}
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setHasError(true)}
                        draggable={false}
                    />
                )}

                {/* Gradient overlay for text readability */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                        opacity: isHovered || isDragging ? 1 : 0.5,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                    }}
                />

                {/* Lighting simulation (foreground brightness) */}
                {image.layer >= 4 && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Caption - always visible */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        right: '8px',
                        pointerEvents: 'none',
                    }}
                >
                    <h4
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: 'var(--color-ivory)',
                            marginBottom: '2px',
                        }}
                    >
                        {image.title}
                    </h4>
                    <p
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9px',
                            color: 'var(--color-accent)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {image.location}
                    </p>
                </div>

                {/* Drag indicator */}
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: 'rgba(201, 169, 98, 0.9)',
                            padding: '4px 8px',
                            borderRadius: '2px',
                            pointerEvents: 'none',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '9px',
                                color: 'var(--color-void)',
                                textTransform: 'uppercase',
                            }}
                        >
                            ✋ Dragging
                        </span>
                    </motion.div>
                )}

                {/* Hover metadata overlay (desktop) */}
                <AnimatePresence>
                    {isHovered && !isDragging && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(0, 0, 0, 0.9)',
                                backdropFilter: 'blur(8px)',
                                padding: '8px 10px',
                                borderRadius: '2px',
                                border: '1px solid rgba(201, 169, 98, 0.3)',
                                maxWidth: '160px',
                                pointerEvents: 'none',
                            }}
                        >
                            <p
                                style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '10px',
                                    color: 'var(--color-pearl)',
                                    lineHeight: 1.4,
                                }}
                            >
                                {image.detail}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shine effect on hover */}
                <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{
                        x: isHovered && !isDragging ? '200%' : '-100%',
                        opacity: isHovered && !isDragging ? 0.2 : 0,
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '40%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        pointerEvents: 'none',
                    }}
                />
            </div>

            {/* Focus ring for keyboard navigation */}
            <style jsx>{`
                .gallery-image:focus {
                    outline: none;
                }
                .gallery-image:focus-visible {
                    outline: 2px solid var(--color-accent);
                    outline-offset: 4px;
                }
            `}</style>
        </motion.div>
    );
}
