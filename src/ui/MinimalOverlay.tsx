'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import PropertyCard from './PropertyCard';
import GallerySection from './GallerySection';
import Footer from './Footer';
import AudioController from './AudioController';
import { CompareView } from '@/components/CompareMode';
import portfolioData from '@/data/mockPortfolio.json';

interface PropertyData {
    name: string;
    type: string;
    tagline?: string;
    narrative?: string;
    value: number;
    units: number;
    occupancy: number;
    acquiredYear?: number;
    appreciationPercent?: number;
    architect?: string;
    awards?: string[];
    id?: string;
}

interface MinimalOverlayProps {
    currentScene: number;
    scrollProgress: number;
    propertyData: PropertyData | null;
}

// Hero headlines with staggered reveal
const heroHeadlines = [
    { text: "MERIDIAN CAPITAL", delay: 0 },
    { text: `$${(portfolioData.portfolio.totalValue / 1000000000).toFixed(1)}B IN ARCHITECTURAL INTELLIGENCE`, delay: 0.8 },
    { text: `${portfolioData.portfolio.occupancyRate}% AVERAGE OCCUPANCY`, delay: 1.6 },
    { text: "YOUR NEXT LANDMARK AWAITS", delay: 2.4 },
];

export default function MinimalOverlay({
    currentScene,
    scrollProgress,
    propertyData
}: MinimalOverlayProps) {
    const [currentTime, setCurrentTime] = useState('');
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);
    const [isCompareMode, setIsCompareMode] = useState(false);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

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

    // Cycle through hero headlines in scene 1
    useEffect(() => {
        if (currentScene !== 1) {
            setHeroIndex(0);
            return;
        }

        const intervals = heroHeadlines.map((_, index) => {
            return setTimeout(() => {
                setHeroIndex(index);
            }, (heroHeadlines[index].delay || 0) * 1000);
        });

        return () => intervals.forEach(clearTimeout);
    }, [currentScene]);

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

    // Dynamic CTA based on scroll depth
    const getCTAConfig = useMemo(() => {
        if (scrollProgress < 0.2) {
            return { text: "Explore the Portfolio", icon: "→" };
        } else if (scrollProgress < 0.7) {
            return { text: "Save to Shortlist", icon: "♡" };
        } else if (scrollProgress < 0.9) {
            return { text: "Request Details", icon: "📋" };
        }
        return { text: "Schedule Presentation", icon: "📅" };
    }, [scrollProgress]);

    // Show hero headlines in scene 1
    const showHero = currentScene === 1 && scrollProgress < 0.15;

    return (
        <>
            {/* Navigation */}
            <Navbar
                isVisible={isNavVisible}
                currentTime={currentTime}
                scrollProgress={scrollProgress}
            />

            {/* Hero Headlines - Scene 1 */}
            <AnimatePresence>
                {showHero && (
                    <motion.div
                        className="hero-headlines"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            zIndex: 20,
                            pointerEvents: 'none',
                        }}
                    >
                        {heroHeadlines.slice(0, heroIndex + 1).map((headline, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.1,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                                style={{
                                    fontFamily: index === 0 ? 'var(--font-display)' : 'var(--font-body)',
                                    fontSize: index === 0 ? 'var(--text-hero)' : 'var(--text-lg)',
                                    fontWeight: index === 0 ? 100 : 300,
                                    letterSpacing: index === 0 ? '-0.02em' : '0.05em',
                                    color: index === 0 ? 'var(--color-ivory)' :
                                        index === heroHeadlines.length - 1 ? 'var(--color-accent)' : 'var(--color-silver)',
                                    marginBottom: index === 0 ? 'var(--space-lg)' : 'var(--space-sm)',
                                    textTransform: index === 0 ? 'none' : 'uppercase',
                                }}
                            >
                                {headline.text}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Portfolio Overview Intro - Scene 2 */}
            <AnimatePresence>
                {currentScene === 2 && scrollProgress > 0.2 && scrollProgress < 0.35 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'fixed',
                            top: '30%',
                            left: 'var(--space-xl)',
                            maxWidth: '500px',
                            zIndex: 20,
                            pointerEvents: 'none',
                        }}
                    >
                        <p
                            style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-lg)',
                                fontWeight: 300,
                                color: 'var(--color-ivory)',
                                lineHeight: 1.7,
                            }}
                        >
                            Five properties. Five neighborhoods. One philosophy:
                        </p>
                        <p
                            style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-base)',
                                fontStyle: 'italic',
                                color: 'var(--color-accent)',
                                marginTop: 'var(--space-sm)',
                            }}
                        >
                            Build where culture meets capital.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

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

            {/* Premium Scroll Indicator */}
            <AnimatePresence>
                {currentScene < 2 && scrollProgress < 0.15 && (
                    <motion.div
                        className="scroll-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="scroll-indicator__line">
                            <div className="scroll-indicator__dot" />
                        </div>
                        <span className="scroll-indicator__text">Begin exploration</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating CTA - Context Aware */}
            <AnimatePresence>
                {scrollProgress > 0.15 && scrollProgress < 0.85 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'fixed',
                            bottom: 'var(--space-xl)',
                            right: 'var(--space-xl)',
                            zIndex: 50,
                        }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                background: 'rgba(201, 169, 98, 0.15)',
                                border: '1px solid var(--color-accent)',
                                borderRadius: '2px',
                                padding: 'var(--space-sm) var(--space-lg)',
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-accent)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-sm)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <span>{getCTAConfig.text}</span>
                            <span>{getCTAConfig.icon}</span>
                        </motion.button>
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

            {/* Compare Button - Shows when property is focused */}
            <AnimatePresence>
                {propertyData && currentScene >= 2 && currentScene <= 3 && (
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => setIsCompareMode(true)}
                        style={{
                            position: 'fixed',
                            bottom: 'calc(var(--space-xl) + 60px)',
                            right: 'var(--space-xl)',
                            background: 'rgba(201, 169, 98, 0.2)',
                            border: '1px solid var(--color-accent)',
                            borderRadius: '2px',
                            padding: 'var(--space-sm) var(--space-md)',
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-accent)',
                            cursor: 'pointer',
                            zIndex: 50,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <span>⚖️</span>
                        <span>Compare Properties</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Comparative Reality - Signature Feature */}
            <AnimatePresence>
                {isCompareMode && (
                    <CompareView
                        isOpen={isCompareMode}
                        onClose={() => setIsCompareMode(false)}
                        initialPropertyId={propertyData?.id}
                    />
                )}
            </AnimatePresence>

            {/* Grain Overlay */}
            <div className="grain-overlay" aria-hidden="true" />

            {/* Vignette Overlay */}
            <div className="vignette-overlay" aria-hidden="true" />
        </>
    );
}
