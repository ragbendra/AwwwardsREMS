'use client';

import * as THREE from 'three';
import { gsap } from 'gsap';

export interface SceneConfig {
    id: string;
    name: string;
    startProgress: number;
    endProgress: number;
    setup: (scene: THREE.Scene, resources: SceneResources) => void;
    update: (time: number, progress: number, delta: number) => void;
    cleanup: () => void;
}

export interface SceneResources {
    textures: Map<string, THREE.Texture>;
    geometries: Map<string, THREE.BufferGeometry>;
    materials: Map<string, THREE.Material>;
}

export class SceneManager {
    private scene: THREE.Scene;
    private scenes: Map<string, SceneConfig> = new Map();
    private activeSceneId: string | null = null;
    private resources: SceneResources;
    private transitionProgress: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.resources = {
            textures: new Map(),
            geometries: new Map(),
            materials: new Map(),
        };
    }

    registerScene(config: SceneConfig): void {
        this.scenes.set(config.id, config);
    }

    getActiveScene(): SceneConfig | null {
        if (!this.activeSceneId) return null;
        return this.scenes.get(this.activeSceneId) || null;
    }

    getSceneAtProgress(progress: number): SceneConfig | null {
        for (const [, config] of this.scenes) {
            if (progress >= config.startProgress && progress < config.endProgress) {
                return config;
            }
        }
        return null;
    }

    transitionTo(sceneId: string, duration: number = 1.5): Promise<void> {
        return new Promise((resolve) => {
            const newScene = this.scenes.get(sceneId);
            if (!newScene) {
                resolve();
                return;
            }

            // Cleanup current scene
            if (this.activeSceneId) {
                const currentScene = this.scenes.get(this.activeSceneId);
                currentScene?.cleanup();
            }

            // Transition animation
            gsap.to(this, {
                transitionProgress: 1,
                duration,
                ease: 'power2.inOut',
                onComplete: () => {
                    this.activeSceneId = sceneId;
                    newScene.setup(this.scene, this.resources);
                    this.transitionProgress = 0;
                    resolve();
                },
            });
        });
    }

    update(time: number, progress: number, delta: number): void {
        // Find and update the current scene based on progress
        const currentScene = this.getSceneAtProgress(progress);

        if (currentScene && currentScene.id !== this.activeSceneId) {
            // Scene changed, but don't do full transition - just update active
            this.activeSceneId = currentScene.id;
        }

        // Update the active scene
        currentScene?.update(time, progress, delta);
    }

    addResource(type: 'texture' | 'geometry' | 'material', key: string, resource: THREE.Texture | THREE.BufferGeometry | THREE.Material): void {
        switch (type) {
            case 'texture':
                this.resources.textures.set(key, resource as THREE.Texture);
                break;
            case 'geometry':
                this.resources.geometries.set(key, resource as THREE.BufferGeometry);
                break;
            case 'material':
                this.resources.materials.set(key, resource as THREE.Material);
                break;
        }
    }

    getResource<T>(type: 'texture' | 'geometry' | 'material', key: string): T | undefined {
        switch (type) {
            case 'texture':
                return this.resources.textures.get(key) as T;
            case 'geometry':
                return this.resources.geometries.get(key) as T;
            case 'material':
                return this.resources.materials.get(key) as T;
        }
    }

    dispose(): void {
        // Cleanup all scenes
        this.scenes.forEach(scene => scene.cleanup());

        // Dispose resources
        this.resources.textures.forEach(t => t.dispose());
        this.resources.geometries.forEach(g => g.dispose());
        this.resources.materials.forEach(m => m.dispose());

        this.resources.textures.clear();
        this.resources.geometries.clear();
        this.resources.materials.clear();
        this.scenes.clear();
    }
}

export default SceneManager;
