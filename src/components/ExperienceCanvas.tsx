'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ExperienceScene, PropertyMesh } from '@/scenes/ExperienceScene';
import { CameraController } from '@/experience/CameraController';
import { Renderer } from '@/experience/Renderer';
import { getAssetLoadingManager } from '@/experience/AssetLoadingManager';
import { getScrollManager } from '@/experience/ScrollManager';
import portfolioData from '@/data/mockPortfolio.json';

type PropertyDataType = typeof portfolioData.properties[0];

interface ExperienceCanvasProps {
    onSceneChange?: (sceneIndex: number, progress: number) => void;
    onPropertyFocus?: (property: PropertyDataType | null) => void;
}

export default function ExperienceCanvas({
    onSceneChange,
    onPropertyFocus
}: ExperienceCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const experienceRef = useRef<{
        scene: ExperienceScene;
        camera: CameraController;
        renderer: Renderer;
        raf: number | null;
    } | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Create experience components
        const experienceScene = new ExperienceScene();
        const cameraController = new CameraController();
        const renderer = new Renderer(
            canvasRef.current,
            experienceScene.scene,
            cameraController.camera
        );

        // Get scroll manager singleton
        const scrollManager = getScrollManager();

        // Store references
        experienceRef.current = {
            scene: experienceScene,
            camera: cameraController,
            renderer: renderer,
            raf: null,
        };

        // Register renderer with AssetLoadingManager
        const assetManager = getAssetLoadingManager();
        assetManager.registerRenderer(
            renderer.renderer,
            experienceScene.scene,
            cameraController.camera
        );

        // Track state
        let currentScene = 0;
        let lastFocusedProperty: PropertyMesh | null = null;

        // Subscribe to scroll manager
        const unsubscribe = scrollManager.subscribe((state) => {
            // Update camera from scroll state
            cameraController.updateFromScroll(state.progress);

            // Notify scene changes
            if (state.sceneIndex !== currentScene) {
                currentScene = state.sceneIndex;
                onSceneChange?.(currentScene, state.progress);
            }

            // Check for property focus (Scene 2: Portfolio)
            if (currentScene === 2) {
                const cameraZ = cameraController.camera.position.z;
                const focusedProperty = experienceScene.getPropertyAtDistance(cameraZ, 12);

                if (focusedProperty !== lastFocusedProperty) {
                    lastFocusedProperty = focusedProperty;
                    onPropertyFocus?.(focusedProperty?.userData.propertyData || null);
                }
            } else if (lastFocusedProperty) {
                // Clear property focus when leaving Portfolio scene
                lastFocusedProperty = null;
                onPropertyFocus?.(null);
            }
        });

        // Animation loop (render only, no scroll handling)
        const animate = (time: number) => {
            const exp = experienceRef.current;
            if (!exp) return;

            // Update scene
            exp.scene.update(time * 0.001, exp.camera.progress);

            // Render
            exp.renderer.render();

            // Continue loop
            exp.raf = requestAnimationFrame(animate);
        };

        // Start animation
        experienceRef.current.raf = requestAnimationFrame(animate);

        // Set loaded state
        requestAnimationFrame(() => {
            setIsLoaded(true);
        });

        // Handle resize
        const handleResize = () => {
            const exp = experienceRef.current;
            if (!exp) return;

            const width = window.innerWidth;
            const height = window.innerHeight;

            exp.camera.resize(width, height);
            exp.renderer.resize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            const exp = experienceRef.current;
            if (exp) {
                if (exp.raf) cancelAnimationFrame(exp.raf);
                exp.scene.dispose();
                exp.renderer.dispose();
            }
            unsubscribe();
            window.removeEventListener('resize', handleResize);
        };
    }, [onSceneChange, onPropertyFocus]);

    return (
        <div
            ref={containerRef}
            id="experience-root"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 1.5s ease',
                }}
            />
        </div>
    );
}
