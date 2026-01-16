'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Preloader from '@/ui/Preloader';
import MinimalOverlay from '@/ui/MinimalOverlay';
import portfolioData from '@/data/mockPortfolio.json';

// Dynamic import for ExperienceCanvas to avoid SSR issues with Three.js
const ExperienceCanvas = dynamic(
    () => import('@/components/ExperienceCanvas'),
    { ssr: false }
);

type PropertyData = {
    name: string;
    type: string;
    value: number;
    units: number;
    occupancy: number;
};

export default function ExperienceProvider() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentScene, setCurrentScene] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [focusedProperty, setFocusedProperty] = useState<PropertyData | null>(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const handlePreloaderComplete = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleSceneChange = useCallback((sceneIndex: number, progress: number) => {
        setCurrentScene(sceneIndex);
        setScrollProgress(progress);
    }, []);

    const handlePropertyFocus = useCallback((property: typeof portfolioData.properties[0] | null) => {
        if (property) {
            setFocusedProperty({
                name: property.name,
                type: property.type,
                value: property.value,
                units: property.units,
                occupancy: property.occupancy,
            });
        } else {
            setFocusedProperty(null);
        }
    }, []);

    // Update scroll progress from scroll events
    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* Preloader */}
            {isLoading && (
                <Preloader
                    onComplete={handlePreloaderComplete}
                    duration={reducedMotion ? 500 : 2500}
                />
            )}

            {/* 3D Experience Canvas */}
            {!reducedMotion && (
                <ExperienceCanvas
                    onSceneChange={handleSceneChange}
                    onPropertyFocus={handlePropertyFocus}
                />
            )}

            {/* Fallback for reduced motion */}
            {reducedMotion && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'var(--color-abyss)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 'var(--space-lg)',
                    }}
                >
                    <h1
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'var(--text-4xl)',
                            fontWeight: 200,
                            color: 'var(--color-ivory)',
                        }}
                    >
                        Meridian Capital Portfolio
                    </h1>
                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-base)',
                            color: 'var(--color-silver)',
                        }}
                    >
                        $847M in managed assets
                    </p>
                </div>
            )}

            {/* UI Overlay */}
            {!isLoading && !reducedMotion && (
                <MinimalOverlay
                    currentScene={currentScene}
                    scrollProgress={scrollProgress}
                    propertyData={focusedProperty}
                />
            )}
        </>
    );
}
