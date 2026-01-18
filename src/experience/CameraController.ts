'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { getSceneAtProgress } from '@/config/scenes';

export interface CameraConfig {
    fov: number;
    near: number;
    far: number;
    initialPosition: THREE.Vector3;
    initialLookAt: THREE.Vector3;
}

export interface CameraControllerState {
    position: THREE.Vector3;
    target: THREE.Vector3;
    progress: number;
}

const defaultConfig: CameraConfig = {
    fov: 45,
    near: 0.1,
    far: 1000,
    initialPosition: new THREE.Vector3(0, 2, 10),
    initialLookAt: new THREE.Vector3(0, 0, 0),
};

export class CameraController {
    camera: THREE.PerspectiveCamera;
    target: THREE.Vector3;
    progress: number = 0;

    private path: THREE.CatmullRomCurve3;
    private lookAtPath: THREE.CatmullRomCurve3;
    private driftOffset: THREE.Vector3 = new THREE.Vector3();
    private breathOffset: number = 0;
    private isAnimating: boolean = false;

    constructor(config: Partial<CameraConfig> = {}) {
        const mergedConfig = { ...defaultConfig, ...config };

        this.camera = new THREE.PerspectiveCamera(
            mergedConfig.fov,
            window.innerWidth / window.innerHeight,
            mergedConfig.near,
            mergedConfig.far
        );

        this.camera.position.copy(mergedConfig.initialPosition);
        this.target = mergedConfig.initialLookAt.clone();
        this.camera.lookAt(this.target);

        // Camera spline path with intermediate points for smooth transitions
        this.path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 2, 10),      // Scene 0 - Preload
            new THREE.Vector3(0, 2.5, 7.5),   // Scene 1 - Hero early
            new THREE.Vector3(0, 3, 5),       // Scene 1 - Hero mid
            new THREE.Vector3(0, 4, -5),      // Scene 1 - Hero end
            new THREE.Vector3(0, 5, -20),     // Scene 2 - Portfolio start
            new THREE.Vector3(-5, 6, -35),    // Scene 2 - Portfolio mid
            new THREE.Vector3(0, 7, -50),     // Scene 2 - Portfolio end / Scene 3 start
            new THREE.Vector3(5, 8, -60),     // Scene 3 - Gallery mid
            new THREE.Vector3(0, 10, -70),    // Scene 3 - Gallery end / Scene 4 start
            new THREE.Vector3(0, 15, -80),    // Scene 4 - Analytics mid
            new THREE.Vector3(0, 50, -40),    // Scene 5 - God View
        ]);

        this.lookAtPath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),       // Preload
            new THREE.Vector3(0, 1, -5),      // Hero early
            new THREE.Vector3(0, 2, -10),     // Hero mid
            new THREE.Vector3(0, 3, -20),     // Hero end
            new THREE.Vector3(0, 4, -35),     // Portfolio start
            new THREE.Vector3(0, 5, -45),     // Portfolio mid
            new THREE.Vector3(0, 5, -55),     // Portfolio end / Gallery start
            new THREE.Vector3(0, 5, -65),     // Gallery mid
            new THREE.Vector3(0, 5, -72),     // Gallery end / Analytics start
            new THREE.Vector3(0, 5, -78),     // Analytics mid
            new THREE.Vector3(0, 0, -60),     // God View
        ]);
    }

    resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    updateFromScroll(scrollProgress: number): void {
        this.progress = Math.max(0, Math.min(1, scrollProgress));

        // Get position along path
        const pathPosition = this.path.getPointAt(this.progress);
        const lookAtPosition = this.lookAtPath.getPointAt(this.progress);

        // Add subtle drift for organic feel
        const scene = getSceneAtProgress(this.progress);
        this.updateDrift(scene.index);

        // Apply position
        this.camera.position.copy(pathPosition).add(this.driftOffset);
        this.target.copy(lookAtPosition);
        this.camera.lookAt(this.target);
    }

    private updateDrift(currentScene: number): void {
        const time = Date.now() * 0.0001;

        // Calculate drift strength with smooth fade during hero scene
        let driftStrength = 1;
        if (currentScene === 1) {
            // Fade drift in first 25% and out last 25% of hero scene
            const heroProgress = this.progress / 0.15;
            const clampedProgress = Math.max(0, Math.min(1, heroProgress));
            driftStrength = Math.min(clampedProgress, 1 - clampedProgress) * 4;
            driftStrength = Math.max(0, Math.min(1, driftStrength));
        }

        // Subtle breathing motion
        this.breathOffset = Math.sin(time * 2) * 0.05;

        // Gentle drift with strength multiplier
        this.driftOffset.set(
            Math.sin(time * 0.7) * 0.1 * driftStrength,
            (this.breathOffset + Math.cos(time * 0.5) * 0.05) * driftStrength,
            Math.sin(time * 0.3) * 0.1 * driftStrength
        );
    }

    flyTo(
        position: THREE.Vector3,
        lookAt: THREE.Vector3,
        duration: number = 2,
        onComplete?: () => void
    ): void {
        if (this.isAnimating) return;

        this.isAnimating = true;

        const startPos = this.camera.position.clone();
        const startTarget = this.target.clone();

        const animState = { t: 0 };

        gsap.to(animState, {
            t: 1,
            duration,
            ease: 'power3.inOut',
            onUpdate: () => {
                const progress = animState.t;

                const newPos = new THREE.Vector3().lerpVectors(startPos, position, progress);
                const newTarget = new THREE.Vector3().lerpVectors(startTarget, lookAt, progress);

                this.camera.position.copy(newPos);
                this.target.copy(newTarget);
                this.camera.lookAt(this.target);
            },
            onComplete: () => {
                this.isAnimating = false;
                onComplete?.();
            },
        });
    }

    getState(): CameraControllerState {
        return {
            position: this.camera.position.clone(),
            target: this.target.clone(),
            progress: this.progress,
        };
    }
}

// React hook for camera controller
export function useCameraController(config?: Partial<CameraConfig>) {
    const controllerRef = useRef<CameraController | null>(null);

    useEffect(() => {
        controllerRef.current = new CameraController(config);

        const handleResize = () => {
            controllerRef.current?.resize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return controllerRef;
}

export default CameraController;
