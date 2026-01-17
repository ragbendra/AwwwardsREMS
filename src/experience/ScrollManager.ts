'use client';

import { useEffect, useRef, useCallback, useState, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import Lenis from 'lenis';

export interface ScrollState {
    progress: number;          // 0-1 overall progress
    velocity: number;          // Current scroll velocity
    direction: 'up' | 'down' | 'idle';
    sceneIndex: number;        // Current scene (0-5)
    sceneProgress: number;     // Progress within current scene (0-1)
}

export type ScrollCallback = (state: ScrollState) => void;

// Scene breakpoints as percentages of total scroll
// Hero range widened to 0.00-0.25 for scroll transition robustness
const SCENE_BREAKPOINTS = [
    { start: 0, end: 0.00, index: 0 },     // Preload (instant)
    { start: 0.00, end: 0.25, index: 1 },  // Hero (widened)
    { start: 0.25, end: 0.5, index: 2 },   // Portfolio
    { start: 0.5, end: 0.7, index: 3 },    // Focus
    { start: 0.7, end: 0.9, index: 4 },    // Analytics
    { start: 0.9, end: 1.0, index: 5 },    // God View
];

export class ScrollManager {
    private lenis: Lenis | null = null;
    private callbacks: Set<ScrollCallback> = new Set();
    private state: ScrollState = {
        progress: 0,
        velocity: 0,
        direction: 'idle',
        sceneIndex: 0,
        sceneProgress: 0,
    };
    private raf: number | null = null;
    private scrollHeight: number = 0;

    constructor() {
        if (typeof window === 'undefined') return;

        // Calculate virtual scroll height (5x viewport for smooth experience)
        this.scrollHeight = window.innerHeight * 6;

        this.initLenis();
        this.startAnimation();
    }

    private initLenis(): void {
        this.lenis = new Lenis({
            duration: 1.8,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
            touchMultiplier: 1.5,
        });

        this.lenis.on('scroll', this.handleScroll.bind(this));
    }

    private handleScroll({ scroll, velocity, direction }: {
        scroll: number;
        velocity: number;
        direction: number;
    }): void {
        // Calculate progress (0-1)
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? scroll / maxScroll : 0;

        // Determine scene
        const scene = SCENE_BREAKPOINTS.find(
            s => progress >= s.start && progress < s.end
        ) || SCENE_BREAKPOINTS[SCENE_BREAKPOINTS.length - 1];

        // Calculate within-scene progress
        const sceneProgress = (progress - scene.start) / (scene.end - scene.start);

        // Update state
        this.state = {
            progress: Math.max(0, Math.min(1, progress)),
            velocity: velocity,
            direction: direction > 0 ? 'down' : direction < 0 ? 'up' : 'idle',
            sceneIndex: scene.index,
            sceneProgress: Math.max(0, Math.min(1, sceneProgress)),
        };

        // Notify all callbacks
        this.callbacks.forEach(cb => cb(this.state));
    }

    private startAnimation(): void {
        const animate = (time: number) => {
            this.lenis?.raf(time);
            this.raf = requestAnimationFrame(animate);
        };

        this.raf = requestAnimationFrame(animate);
    }

    subscribe(callback: ScrollCallback): () => void {
        this.callbacks.add(callback);
        // Immediately call with current state
        callback(this.state);

        return () => {
            this.callbacks.delete(callback);
        };
    }

    scrollTo(target: number | string | HTMLElement, options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
    }): void {
        this.lenis?.scrollTo(target, {
            offset: options?.offset || 0,
            duration: options?.duration || 1.5,
            immediate: options?.immediate || false,
        });
    }

    scrollToScene(sceneIndex: number): void {
        const scene = SCENE_BREAKPOINTS.find(s => s.index === sceneIndex);
        if (!scene) return;

        const targetScroll = scene.start * (document.documentElement.scrollHeight - window.innerHeight);
        this.lenis?.scrollTo(targetScroll, { duration: 2 });
    }

    getState(): ScrollState {
        return { ...this.state };
    }

    stop(): void {
        this.lenis?.stop();
    }

    start(): void {
        this.lenis?.start();
    }

    destroy(): void {
        if (this.raf) {
            cancelAnimationFrame(this.raf);
        }
        this.lenis?.destroy();
        this.callbacks.clear();
    }
}

// Singleton instance
let scrollManagerInstance: ScrollManager | null = null;

export function getScrollManager(): ScrollManager {
    if (typeof window === 'undefined') {
        // Return dummy for SSR
        return {
            subscribe: () => () => { },
            getState: () => ({ progress: 0, velocity: 0, direction: 'idle' as const, sceneIndex: 0, sceneProgress: 0 }),
            scrollTo: () => { },
            scrollToScene: () => { },
            stop: () => { },
            start: () => { },
            destroy: () => { },
        } as unknown as ScrollManager;
    }

    if (!scrollManagerInstance) {
        scrollManagerInstance = new ScrollManager();
    }

    return scrollManagerInstance;
}

// React hook for scroll state
export function useScrollState(): ScrollState {
    const manager = getScrollManager();

    return useSyncExternalStore(
        useCallback((onStoreChange: () => void) => {
            return manager.subscribe(() => onStoreChange());
        }, [manager]),
        () => manager.getState(),
        () => ({ progress: 0, velocity: 0, direction: 'idle', sceneIndex: 0, sceneProgress: 0 }) // Server snapshot
    );
}

// Hook for scroll-triggered animations
export function useScrollProgress(
    callback: (progress: number, state: ScrollState) => void,
    deps: React.DependencyList = []
): void {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const manager = getScrollManager();

        const unsubscribe = manager.subscribe((state) => {
            callbackRef.current(state.progress, state);
        });

        return () => {
            unsubscribe();
        };
    }, deps);
}

export default ScrollManager;
