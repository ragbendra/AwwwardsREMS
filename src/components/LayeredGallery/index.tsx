'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DepthLayer from './DepthLayer';
import ProgressBar from './ProgressBar';
import { GalleryImageData, RESPONSIVE_LAYERS, LAYER_CONFIG } from './galleryData';
import { useTransition } from '@/context/TransitionContext';

interface LayeredGalleryProps {
    scrollProgress: number;
    isActive: boolean;
    onSceneProgress?: (progress: number) => void;
}

function MetadataModal({
    image,
    onClose
}: {
    image: GalleryImageData | null;
    onClose: () => void;
}) {
    if (!image) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: 'var(--space-lg)',
            }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--color-graphite)',
                    border: '1px solid var(--color-accent)',
                    borderRadius: '4px',
                    padding: 'var(--space-lg)',
                    maxWidth: '320px',
                    width: '100%',
                }}
            >
                <h3
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 300,
                        color: 'var(--color-ivory)',
                        marginBottom: 'var(--space-sm)',
                    }}
                >
                    {image.title}
                </h3>
                <p
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-accent)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: 'var(--space-md)',
                    }}
                >
                    {image.location}
                </p>
                <p
                    style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-pearl)',
                        lineHeight: 1.6,
                    }}
                >
                    {image.detail}
                </p>
                <button
                    onClick={onClose}
                    style={{
                        marginTop: 'var(--space-lg)',
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'transparent',
                        border: '1px solid var(--color-graphite)',
                        borderRadius: '2px',
                        color: 'var(--color-silver)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer',
                        width: '100%',
                    }}
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
}

export default function LayeredGallery({
    scrollProgress,
    isActive,
    onSceneProgress,
}: LayeredGalleryProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [selectedImage, setSelectedImage] = useState<GalleryImageData | null>(null);
    const [showHint, setShowHint] = useState(true);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { isTransitioning, transitionPhase } = useTransition();

    // Gallery scene boundaries from scenes.ts: 0.50-0.75
    const galleryStart = 0.50;
    const galleryEnd = 0.75;
    const galleryProgress = Math.max(0, Math.min(1,
        (scrollProgress - galleryStart) / (galleryEnd - galleryStart)
    ));

    const totalHeight = typeof window !== 'undefined' ? window.innerHeight * 3 : 2000;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            if (width >= 1280) setDeviceType('desktop');
            else if (width >= 768) setDeviceType('tablet');
            else setDeviceType('mobile');
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    useEffect(() => {
        if (!isActive || reducedMotion || deviceType !== 'desktop') return;

        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isActive, reducedMotion, deviceType]);

    useEffect(() => {
        if (isActive && showHint) {
            const timeout = setTimeout(() => setShowHint(false), 3000);
            return () => clearTimeout(timeout);
        }
    }, [isActive, showHint]);

    useEffect(() => {
        onSceneProgress?.(galleryProgress);
    }, [galleryProgress, onSceneProgress]);

    const handleImageClick = useCallback((image: GalleryImageData) => {
        if (deviceType === 'mobile') {
            setSelectedImage(image);
        }
    }, [deviceType]);

    const activeLayers = RESPONSIVE_LAYERS[deviceType];
    const containerOpacity = isActive && !isTransitioning ? 1 : 0;

    if (!isActive && !isTransitioning) {
        return null;
    }

    return (
        <>
            <motion.section
                ref={containerRef}
                className="layered-gallery"
                initial={{ opacity: 0 }}
                animate={{ opacity: containerOpacity }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'var(--color-void)',
                    overflow: 'hidden',
                    pointerEvents: isActive ? 'auto' : 'none',
                    zIndex: 40,
                }}
                role="region"
                aria-label="Property Gallery - Immersive spatial experience with architectural images"
            >
                <a
                    href="#footer"
                    className="skip-link"
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'var(--color-accent)',
                        color: 'var(--color-void)',
                        borderRadius: '2px',
                        zIndex: 100,
                        transition: 'top 0.2s ease',
                    }}
                    onFocus={(e) => { e.currentTarget.style.top = 'var(--space-lg)'; }}
                    onBlur={(e) => { e.currentTarget.style.top = '-100px'; }}
                >
                    Skip Gallery
                </a>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                        opacity: isActive && galleryProgress < 0.8 ? 1 : 0,
                        y: isActive ? 0 : 30,
                    }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        position: 'absolute',
                        top: 'var(--space-xl)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        zIndex: 50,
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
                        The Collection
                    </span>
                    <h2
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'var(--text-3xl)',
                            fontWeight: 200,
                            color: 'var(--color-ivory)',
                            marginTop: 'var(--space-xs)',
                        }}
                    >
                        Property Cosmos
                    </h2>
                </motion.div>

                <AnimatePresence>
                    {isActive && showHint && !reducedMotion && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                position: 'absolute',
                                bottom: 'var(--space-xl)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                textAlign: 'center',
                                zIndex: 50,
                            }}
                        >
                            <p
                                style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-sm)',
                                    color: 'var(--color-silver)',
                                    fontStyle: 'italic',
                                }}
                            >
                                Explore the collection ↓
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        overflow: 'hidden',
                    }}
                >
                    {reducedMotion ? (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 'var(--space-lg)',
                                padding: 'calc(var(--space-xl) * 3) var(--space-lg)',
                                overflowY: 'auto',
                                height: '100%',
                            }}
                        />
                    ) : (
                        activeLayers.map((layer) => (
                            <DepthLayer
                                key={layer}
                                layer={layer}
                                scrollProgress={galleryProgress}
                                totalHeight={totalHeight}
                                mousePosition={mousePosition}
                                isReducedMotion={reducedMotion}
                                onImageClick={handleImageClick}
                            />
                        ))
                    )}
                </div>

                <div
                    className="gallery-grain"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.05,
                        pointerEvents: 'none',
                        mixBlendMode: 'overlay',
                        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                    aria-hidden="true"
                />

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
                        pointerEvents: 'none',
                    }}
                    aria-hidden="true"
                />

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    }}
                    aria-hidden="true"
                />
            </motion.section>

            <ProgressBar
                progress={galleryProgress}
                isVisible={isActive && !reducedMotion}
            />

            <AnimatePresence>
                {selectedImage && (
                    <MetadataModal
                        image={selectedImage}
                        onClose={() => setSelectedImage(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
