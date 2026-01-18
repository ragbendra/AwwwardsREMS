'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Preloader from '@/ui/Preloader';
import MinimalOverlay from '@/ui/MinimalOverlay';
import { useScrollState, getScrollManager } from '@/experience/ScrollManager';
import portfolioData from '@/data/mockPortfolio.json';

const ExperienceCanvas = dynamic(
    () => import('@/components/ExperienceCanvas'),
    { ssr: false }
);

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

const HERO_MIN_LOCK_MS = 3000;

export default function ExperienceProvider() {
    const [isLoading, setIsLoading] = useState(true);
    const [focusedProperty, setFocusedProperty] = useState<PropertyData | null>(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [scrollLocked, setScrollLocked] = useState(true);

    const heroLockStartRef = useRef<number>(Date.now());
    const heroLockTimerElapsedRef = useRef<boolean>(false);
    const assetsCompleteRef = useRef<boolean>(false);

    // Get scroll state from ScrollManager
    const scrollState = useScrollState();

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateMotion = (matches: boolean) => setReducedMotion(matches);

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

    // 3-second time-based scroll lock
    useEffect(() => {
        heroLockStartRef.current = Date.now();

        const timer = setTimeout(() => {
            heroLockTimerElapsedRef.current = true;
            if (assetsCompleteRef.current) {
                setScrollLocked(false);
            }
        }, HERO_MIN_LOCK_MS);

        return () => clearTimeout(timer);
    }, []);

    // Apply scroll lock using ScrollManager
    useEffect(() => {
        const scrollManager = getScrollManager();

        if (scrollLocked) {
            scrollManager.stop();
        } else {
            scrollManager.start();
        }

        return () => {
            scrollManager.start();
        };
    }, [scrollLocked]);

    const handlePreloaderComplete = useCallback(() => {
        setIsLoading(false);
        assetsCompleteRef.current = true;

        if (heroLockTimerElapsedRef.current) {
            setScrollLocked(false);
        }
    }, []);

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

    return (
        <>
            {isLoading && (
                <Preloader onComplete={handlePreloaderComplete} />
            )}

            {!reducedMotion && (
                <ExperienceCanvas
                    onSceneChange={() => {}}
                    onPropertyFocus={handlePropertyFocus}
                />
            )}

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

            {!isLoading && !reducedMotion && (
                <MinimalOverlay
                    currentScene={scrollState.sceneIndex}
                    scrollProgress={scrollState.progress}
                    propertyData={focusedProperty}
                />
            )}
        </>
    );
}
