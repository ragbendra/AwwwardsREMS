'use client';

/**
 * Centralized Scene Configuration
 * Single source of truth for scene breakpoints and transitions.
 * Import this in ScrollManager.ts and CameraController.ts.
 */

export interface SceneConfig {
    readonly index: number;
    readonly start: number;
    readonly end: number;
    readonly name: string;
}

/**
 * Scene breakpoints as percentages of total scroll (0-1).
 * Hero shortened for faster entry, Portfolio expanded for exploration.
 */
export const SCENE_CONFIG: readonly SceneConfig[] = [
    { index: 0, start: 0.00, end: 0.00, name: 'Preload' },
    { index: 1, start: 0.00, end: 0.15, name: 'Hero' },
    { index: 2, start: 0.15, end: 0.50, name: 'Portfolio' },
    { index: 3, start: 0.50, end: 0.75, name: 'Gallery' },
    { index: 4, start: 0.75, end: 0.90, name: 'Analytics' },
    { index: 5, start: 0.90, end: 1.00, name: 'GodView' },
] as const;

export type SceneIndex = typeof SCENE_CONFIG[number]['index'];
export type SceneName = typeof SCENE_CONFIG[number]['name'];

/**
 * Get the scene configuration at a given scroll progress.
 * @param progress - Scroll progress from 0 to 1
 * @returns The matching scene config, or the last scene if none match
 */
export function getSceneAtProgress(progress: number): SceneConfig {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    return (
        SCENE_CONFIG.find(s => clampedProgress >= s.start && clampedProgress < s.end) ||
        SCENE_CONFIG[SCENE_CONFIG.length - 1]
    );
}

/**
 * Get scene configuration by index.
 * @param index - Scene index
 * @returns The matching scene config or undefined
 */
export function getSceneByIndex(index: number): SceneConfig | undefined {
    return SCENE_CONFIG.find(s => s.index === index);
}

/**
 * Get scene name by index.
 * @param index - Scene index
 * @returns The scene name or 'Unknown'
 */
export function getSceneName(index: number): string {
    return getSceneByIndex(index)?.name || 'Unknown';
}

/**
 * Calculate progress within a scene (0-1).
 * @param progress - Overall scroll progress
 * @param scene - Scene config
 * @returns Progress within the scene
 */
export function getSceneProgress(progress: number, scene: SceneConfig): number {
    const range = scene.end - scene.start;
    if (range <= 0) return 0;
    const sceneProgress = (progress - scene.start) / range;
    return Math.max(0, Math.min(1, sceneProgress));
}

export default { SCENE_CONFIG, getSceneAtProgress, getSceneByIndex, getSceneName, getSceneProgress };
