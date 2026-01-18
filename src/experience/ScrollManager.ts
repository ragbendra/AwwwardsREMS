'use client';

import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import Lenis from 'lenis';
import { SCENE_CONFIG, getSceneAtProgress, getSceneProgress } from '@/config/scenes';

export interface ScrollState {
    progress: number;          // 0-1 overall progress
    velocity: number;          // Current scroll velocity
    direction: 'up' | 'down' | 'idle';
    sceneIndex: number;        // Current scene (0-5)
    sceneProgress: number;     // Progress within current scene (0-1)
}

export type ScrollCallback = (state: ScrollState) => void;

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

    constructor() {
        if (typeof window === 'undefined') return;

        this.initLenis();
        this.startAnimation();
    }

    private initLenis(): void {
        this.lenis = new Lenis({
            duration: 1.4,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0,
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

        // Get scene from centralized config
        const scene = getSceneAtProgress(progress);
        const sceneProgress = getSceneProgress(progress, scene);

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
        const scene = SCENE_CONFIG.find(s => s.index === sceneIndex);
        if (!scene) return;

        const targetScroll = scene.start * (document.documentElement.scrollHeight - window.innerHeight);
        this.lenis?.scrollTo(targetScroll, { duration: 2 });
    }

    getState(): ScrollState {
        return this.state;
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
    const managerRef = useRef<ScrollManager | null>(null);

    if (!managerRef.current) {
        managerRef.current = getScrollManager();
    }
    const manager = managerRef.current;

    const subscribe = useCallback((onStoreChange: () => void) => {
        return manager.subscribe(() => onStoreChange());
    }, [manager]);

    const getSnapshot = useCallback(() => manager.getState(), [manager]);

    const getServerSnapshot = useCallback(() => ({
        progress: 0,
        velocity: 0,
        direction: 'idle' as const,
        sceneIndex: 0,
        sceneProgress: 0,
    }), []);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
