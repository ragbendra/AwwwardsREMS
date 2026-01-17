'use client';

import * as THREE from 'three';

export interface AssetLoadingState {
    totalAssets: number;
    loadedAssets: number;
    progress: number;
    isLoadComplete: boolean;
    isShaderCompileComplete: boolean;
    isComplete: boolean;
}

type ProgressCallback = (state: AssetLoadingState) => void;
type CompleteCallback = () => void;

/**
 * AssetLoadingManager — Real asset tracking with shader warm-up
 * Uses THREE.LoadingManager to track actual geometry/texture loads.
 * Performs renderer.compile() warm-up before marking complete.
 */
class AssetLoadingManager {
    private loadingManager: THREE.LoadingManager;
    private state: AssetLoadingState = {
        totalAssets: 0,
        loadedAssets: 0,
        progress: 0,
        isLoadComplete: false,
        isShaderCompileComplete: false,
        isComplete: false,
    };

    private progressCallbacks: Set<ProgressCallback> = new Set();
    private completeCallbacks: Set<CompleteCallback> = new Set();
    private renderer: THREE.WebGLRenderer | null = null;
    private scene: THREE.Scene | null = null;
    private camera: THREE.Camera | null = null;

    constructor() {
        this.loadingManager = new THREE.LoadingManager(
            // onLoad
            () => this.handleLoadComplete(),
            // onProgress
            (url, loaded, total) => this.handleProgress(url, loaded, total),
            // onError
            (url) => console.error(`Asset failed to load: ${url}`)
        );
    }

    /**
     * Get the THREE.LoadingManager instance for use with loaders
     */
    getLoadingManager(): THREE.LoadingManager {
        return this.loadingManager;
    }

    /**
     * Register renderer, scene, camera for shader warm-up
     */
    registerRenderer(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera
    ): void {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
    }

    /**
     * Manually register an asset to track (for non-loader assets)
     */
    registerAsset(): void {
        this.state.totalAssets++;
        this.notifyProgress();
    }

    /**
     * Mark a manually registered asset as loaded
     */
    markAssetLoaded(): void {
        this.state.loadedAssets++;
        this.updateProgress();
    }

    private handleProgress(_url: string, loaded: number, total: number): void {
        this.state.loadedAssets = loaded;
        this.state.totalAssets = total;
        this.updateProgress();
    }

    private updateProgress(): void {
        // Progress = loaded / total (no interpolation, no easing)
        this.state.progress = this.state.totalAssets > 0
            ? this.state.loadedAssets / this.state.totalAssets
            : 0;
        this.notifyProgress();
    }

    private handleLoadComplete(): void {
        this.state.isLoadComplete = true;
        this.state.progress = 1;
        this.notifyProgress();

        // Perform shader warm-up
        this.performShaderWarmUp();
    }

    private performShaderWarmUp(): void {
        if (!this.renderer || !this.scene || !this.camera) {
            // No renderer registered, mark complete anyway
            this.state.isShaderCompileComplete = true;
            this.state.isComplete = true;
            this.notifyComplete();
            return;
        }

        // Use requestAnimationFrame to defer shader compilation
        requestAnimationFrame(() => {
            try {
                // Compile all shaders in the scene
                this.renderer!.compile(this.scene!, this.camera!);

                // Perform one offscreen render tick to ensure GPU readiness
                this.renderer!.render(this.scene!, this.camera!);
            } catch (e) {
                console.warn('Shader warm-up failed:', e);
            }

            this.state.isShaderCompileComplete = true;
            this.state.isComplete = true;
            this.notifyComplete();
        });
    }

    /**
     * Subscribe to progress updates
     */
    onProgress(callback: ProgressCallback): () => void {
        this.progressCallbacks.add(callback);
        // Immediately call with current state
        callback(this.state);
        return () => this.progressCallbacks.delete(callback);
    }

    /**
     * Subscribe to complete event
     */
    onComplete(callback: CompleteCallback): () => void {
        this.completeCallbacks.add(callback);
        // If already complete, call immediately
        if (this.state.isComplete) {
            callback();
        }
        return () => this.completeCallbacks.delete(callback);
    }

    private notifyProgress(): void {
        const stateCopy = { ...this.state };
        this.progressCallbacks.forEach(cb => cb(stateCopy));
    }

    private notifyComplete(): void {
        this.completeCallbacks.forEach(cb => cb());
    }

    /**
     * Get current state
     */
    getState(): AssetLoadingState {
        return { ...this.state };
    }

    /**
     * Force complete (for scenes with no assets)
     */
    forceComplete(): void {
        if (this.state.isComplete) return;
        this.state.totalAssets = 1;
        this.state.loadedAssets = 1;
        this.state.progress = 1;
        this.state.isLoadComplete = true;
        this.notifyProgress();
        this.performShaderWarmUp();
    }
}

// Singleton instance
let instance: AssetLoadingManager | null = null;

export function getAssetLoadingManager(): AssetLoadingManager {
    if (!instance) {
        instance = new AssetLoadingManager();
    }
    return instance;
}

export default AssetLoadingManager;
