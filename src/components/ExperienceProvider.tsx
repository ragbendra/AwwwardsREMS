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

// Extended property data type to support new fields
type PropertyData = {
    id?: string;
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
        const updateMotion = (matches: boolean) => setReducedMotion(matches);

        // Defer initial setup to avoid sync setState in effect error
        const timeoutId = setTimeout(() => {
            updateMotion(mediaQuery.matches);
        }, 0);

        const handler = (e: MediaQueryListEvent) => updateMotion(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => {
            clearTimeout(timeoutId);
            mediaQuery.removeEventListener('change', handler);
        };
    }, []);

    const handlePreloaderComplete = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleSceneChange = useCallback((sceneIndex: number, progress: number) => {
        setCurrentScene(sceneIndex);
        setScrollProgress(progress);
    }, []);

    // Enhanced property focus handler to include new data fields
    const handlePropertyFocus = useCallback((property: typeof portfolioData.properties[0] | null) => {
        if (property) {
            setFocusedProperty({
                id: property.id,
                name: property.name,
                type: property.type,
                tagline: property.tagline,
                narrative: property.narrative,
                value: property.value,
                units: property.units,
                occupancy: property.occupancy,
                acquiredYear: property.acquiredYear,
                appreciationPercent: property.appreciationPercent,
                architect: property.architect,
                awards: property.awards,
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
                    duration={reducedMotion ? 500 : 3500}
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
                        textAlign: 'center',
                        padding: 'var(--space-xl)',
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
                        Meridian Capital
                    </h1>
                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-lg)',
                            color: 'var(--color-accent)',
                            fontWeight: 300,
                        }}
                    >
                        ${(portfolioData.portfolio.totalValue / 1000000000).toFixed(1)}B in Architectural Intelligence
                    </p>
                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-base)',
                            color: 'var(--color-silver)',
                        }}
                    >
                        {portfolioData.portfolio.occupancyRate}% Average Occupancy
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
