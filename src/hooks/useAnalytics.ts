'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useScrollState } from '@/experience/ScrollManager';
import { getSceneName } from '@/config/scenes';

interface AnalyticsEvent {
    event: string;
    properties?: Record<string, unknown>;
}

/**
 * Send analytics event (stub - integrate with your analytics provider)
 */
function sendAnalyticsEvent(event: AnalyticsEvent): void {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event.event, event.properties);
    }

    // TODO: Integrate with your analytics provider
    // Example: gtag('event', event.event, event.properties);
    // Example: analytics.track(event.event, event.properties);
}

/**
 * Hook to track scroll depth milestones
 * Fires events at 25%, 50%, 75%, and 100%
 */
export function useScrollDepthTracking(): void {
    const { progress, sceneIndex } = useScrollState();
    const milestones = useRef<Set<number>>(new Set());
    const lastScene = useRef<number>(-1);

    useEffect(() => {
        // Track depth milestones
        const depthMilestones = [25, 50, 75, 100];

        for (const milestone of depthMilestones) {
            const threshold = milestone / 100;
            if (progress >= threshold && !milestones.current.has(milestone)) {
                milestones.current.add(milestone);
                sendAnalyticsEvent({
                    event: 'scroll_depth',
                    properties: {
                        depth_percent: milestone,
                        scroll_progress: progress,
                    },
                });
            }
        }

        // Track scene views
        if (sceneIndex !== lastScene.current) {
            const sceneName = getSceneName(sceneIndex);
            sendAnalyticsEvent({
                event: 'scene_view',
                properties: {
                    scene_index: sceneIndex,
                    scene_name: sceneName,
                    scroll_progress: progress,
                },
            });
            lastScene.current = sceneIndex;
        }
    }, [progress, sceneIndex]);
}

/**
 * Hook to track interaction events
 * Returns a track function to call for custom events
 */
export function useInteractionTracking(): (eventName: string, properties?: Record<string, unknown>) => void {
    const track = useCallback((eventName: string, properties?: Record<string, unknown>): void => {
        sendAnalyticsEvent({
            event: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
            },
        });
    }, []);

    return track;
}

/**
 * Hook to track performance metrics
 * Monitors frame times and logs warnings for slow frames
 */
export function usePerformanceMonitor(): void {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let frameCount = 0;
        let slowFrames = 0;
        let lastTime = performance.now();
        let animationId: number;

        const monitorFrame = (currentTime: number): void => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            frameCount++;

            // Track slow frames (>20ms = <50fps)
            if (deltaTime > 20 && frameCount > 10) {
                slowFrames++;
            }

            // Log performance summary every 300 frames (~5 seconds at 60fps)
            if (frameCount % 300 === 0) {
                const slowFramePercent = (slowFrames / 300) * 100;
                if (slowFramePercent > 10) {
                    console.warn(
                        `[Performance] ${slowFramePercent.toFixed(1)}% slow frames in last 5s. Consider reducing visual quality.`
                    );

                    sendAnalyticsEvent({
                        event: 'performance_warning',
                        properties: {
                            slow_frame_percent: slowFramePercent,
                            frame_count: 300,
                        },
                    });
                }
                slowFrames = 0;
            }

            animationId = requestAnimationFrame(monitorFrame);
        };

        animationId = requestAnimationFrame(monitorFrame);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);
}

export default { useScrollDepthTracking, useInteractionTracking, usePerformanceMonitor };
