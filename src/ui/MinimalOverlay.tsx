'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import PropertyCard from './PropertyCard';
import GallerySection from './GallerySection';
import Footer from './Footer';
import AudioController from './AudioController';

interface PropertyData {
    name: string;
    type: string;
    value: number;
    units: number;
    occupancy: number;
}

interface MinimalOverlayProps {
    currentScene: number;
    scrollProgress: number;
    propertyData: PropertyData | null;
}

export default function MinimalOverlay({
    currentScene,
    scrollProgress,
    propertyData
}: MinimalOverlayProps) {
    const [currentTime, setCurrentTime] = useState('');
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

        // Use a small timeout to avoid the synchronous setState within effect lint error
        const timeoutId = setTimeout(() => {
            setReducedMotion(mediaQuery.matches);
        }, 0);

        mediaQuery.addEventListener('change', handleChange);
        return () => {
            clearTimeout(timeoutId);
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    // Update clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                })
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Scroll-triggered nav visibility
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > lastScrollY;
            const pastThreshold = currentScrollY > 100;

            if (scrollingDown && pastThreshold) {
                setIsNavVisible(false);
            } else {
                setIsNavVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const getSceneLabel = () => {
        switch (currentScene) {
            case 0: return 'INITIALIZING';
            case 1: return 'MERIDIAN CAPITAL';
            case 2: return 'PORTFOLIO OVERVIEW';
            case 3: return 'PROPERTY FOCUS';
            case 4: return 'ANALYTICS';
            case 5: return 'OVERVIEW';
            default: return '';
        }
    };

    return (
        <>
            {/* Navigation */}
            <Navbar
                isVisible={isNavVisible}
                currentTime={currentTime}
                scrollProgress={scrollProgress}
            />

            {/* Scene Progress Indicator */}
            <motion.div
                className="scene-progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                {[0, 1, 2, 3, 4, 5].map((scene) => (
                    <div key={scene}>
                        <div
                            className={`scene-progress__dot ${currentScene === scene ? 'scene-progress__dot--active' : ''
                                }`}
                        />
                        {scene < 5 && <div className="scene-progress__line" />}
                    </div>
                ))}
            </motion.div>

            {/* Scene Label */}
            <motion.div
                className="scene-label"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.5, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                <span className="scene-label__text">{getSceneLabel()}</span>
            </motion.div>

            {/* Property Meta Panel */}
            <AnimatePresence mode="wait">
                {propertyData && (
                    <PropertyCard property={propertyData} />
                )}
            </AnimatePresence>

            {/* Scroll Indicator (only show in first scenes) */}
            <AnimatePresence>
                {currentScene < 2 && scrollProgress < 0.15 && (
                    <motion.div
                        className="scroll-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="scroll-indicator__line">
                            <div className="scroll-indicator__dot" />
                        </div>
                        <span className="scroll-indicator__text">Scroll</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gallery Section - Shows during analytics/overview */}
            {currentScene >= 4 && (
                <GallerySection scrollProgress={scrollProgress} />
            )}

            {/* Footer - Shows at end */}
            {currentScene >= 5 && scrollProgress > 0.85 && (
                <Footer />
            )}

            {/* Audio Controller */}
            <AudioController scrollProgress={scrollProgress} currentScene={currentScene} />

            {/* Grain Overlay */}
            <div className="grain-overlay" aria-hidden="true" />

            {/* Vignette Overlay */}
            <div className="vignette-overlay" aria-hidden="true" />
        </>
    );
}
