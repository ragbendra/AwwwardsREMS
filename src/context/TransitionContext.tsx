'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { GalleryImageData } from '@/components/LayeredGallery/galleryData';

// Types for transition state
export interface TransitionOrigin {
    id: string;
    rect: DOMRect;
    src: string;
    data: GalleryImageData;
}

export type TransitionType = 'gallery-to-detail' | 'detail-to-gallery' | null;

export interface TransitionState {
    isTransitioning: boolean;
    transitionType: TransitionType;
    transitionPhase: 'idle' | 'dissolving' | 'morphing' | 'revealing' | 'complete';
    origin: TransitionOrigin | null;
    destinationId: string | null;
    savedScrollPosition: number;
}

interface TransitionContextValue extends TransitionState {
    startTransition: (image: GalleryImageData, rect: DOMRect) => void;
    completeTransition: () => void;
    startReverseTransition: () => void;
    completeReverseTransition: () => void;
    setTransitionPhase: (phase: TransitionState['transitionPhase']) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

// Custom hook for consuming the context
export function useTransition() {
    const context = useContext(TransitionContext);
    if (!context) {
        throw new Error('useTransition must be used within a TransitionProvider');
    }
    return context;
}

// Check if we're transitioning and this image is selected
export function useIsSelectedForTransition(imageId: string) {
    const context = useContext(TransitionContext);
    if (!context) return false;
    return context.isTransitioning && context.origin?.id === imageId;
}

interface TransitionProviderProps {
    children: ReactNode;
}

export function TransitionProvider({ children }: TransitionProviderProps) {
    const scrollPositionRef = useRef(0);

    const [state, setState] = useState<TransitionState>({
        isTransitioning: false,
        transitionType: null,
        transitionPhase: 'idle',
        origin: null,
        destinationId: null,
        savedScrollPosition: 0,
    });

    // Start gallery -> detail transition
    const startTransition = useCallback((image: GalleryImageData, rect: DOMRect) => {
        // Capture current scroll position for later restoration
        scrollPositionRef.current = window.scrollY;

        setState({
            isTransitioning: true,
            transitionType: 'gallery-to-detail',
            transitionPhase: 'dissolving',
            origin: {
                id: image.id,
                rect,
                src: image.src,
                data: image,
            },
            destinationId: image.id,
            savedScrollPosition: scrollPositionRef.current,
        });

        // Update URL without triggering Next.js navigation (cosmetic only)
        window.history.pushState({ propertyId: image.id }, '', `/property/${image.id}`);
    }, []);

    // Complete the forward transition (called after FLIP animation finishes)
    const completeTransition = useCallback(() => {
        setState(prev => ({
            ...prev,
            transitionPhase: 'complete',
            isTransitioning: false,
        }));
    }, []);

    // Start detail -> gallery transition (back navigation)
    const startReverseTransition = useCallback(() => {
        setState(prev => ({
            ...prev,
            isTransitioning: true,
            transitionType: 'detail-to-gallery',
            transitionPhase: 'morphing',
        }));
    }, []);

    // Complete reverse transition
    const completeReverseTransition = useCallback(() => {
        const savedPosition = scrollPositionRef.current;

        // Update URL back to main page
        window.history.pushState({}, '', '/');

        setState({
            isTransitioning: false,
            transitionType: null,
            transitionPhase: 'idle',
            origin: null,
            destinationId: null,
            savedScrollPosition: 0,
        });

        // Restore exact scroll position after state clears
        requestAnimationFrame(() => {
            window.scrollTo(0, savedPosition);
        });
    }, []);

    // Update transition phase manually (used by TransitionOverlay)
    const setTransitionPhase = useCallback((phase: TransitionState['transitionPhase']) => {
        setState(prev => ({
            ...prev,
            transitionPhase: phase,
        }));
    }, []);

    const value: TransitionContextValue = {
        ...state,
        startTransition,
        completeTransition,
        startReverseTransition,
        completeReverseTransition,
        setTransitionPhase,
    };

    return (
        <TransitionContext.Provider value={value}>
            {children}
        </TransitionContext.Provider>
    );
}

export default TransitionContext;
