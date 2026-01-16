'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { ExperienceScene, PropertyMesh } from '@/scenes/ExperienceScene';
import { CameraController } from '@/experience/CameraController';
import { Renderer } from '@/experience/Renderer';
import portfolioData from '@/data/mockPortfolio.json';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Property data type from mock data
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
        lenis: Lenis | null;
        raf: number | null;
    } | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize Three.js experience
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

        // Initialize Lenis for smooth scrolling
        const lenis = new Lenis({
            duration: 1.8,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
        });

        // Store references
        experienceRef.current = {
            scene: experienceScene,
            camera: cameraController,
            renderer: renderer,
            lenis: lenis,
            raf: null,
        };

        // Set up scroll-driven camera
        let currentProgress = 0;
        let targetProgress = 0;
        let currentScene = 0;
        let lastFocusedProperty: PropertyMesh | null = null;

        // Handle scroll
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            targetProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Animation loop
        const animate = (time: number) => {
            const exp = experienceRef.current;
            if (!exp) return;

            // Update Lenis
            exp.lenis?.raf(time);

            // Smooth scroll progress interpolation
            currentProgress += (targetProgress - currentProgress) * 0.05;

            // Update camera based on scroll
            exp.camera.updateFromScroll(currentProgress);

            // Get current scene
            const newScene = exp.camera.getCurrentScene();
            if (newScene !== currentScene) {
                currentScene = newScene;
                onSceneChange?.(currentScene, currentProgress);
            }

            // Check for property focus (Scene 2-3)
            if (currentScene >= 2 && currentScene <= 3) {
                const cameraZ = exp.camera.camera.position.z;
                const focusedProperty = exp.scene.getPropertyAtDistance(cameraZ, 12);

                if (focusedProperty !== lastFocusedProperty) {
                    lastFocusedProperty = focusedProperty;
                    onPropertyFocus?.(focusedProperty?.userData.propertyData || null);
                }
            } else if (lastFocusedProperty) {
                lastFocusedProperty = null;
                onPropertyFocus?.(null);
            }

            // Update scene
            exp.scene.update(time * 0.001, currentProgress);

            // Render
            exp.renderer.render();

            // Continue loop
            exp.raf = requestAnimationFrame(animate);
        };

        // Start animation
        experienceRef.current.raf = requestAnimationFrame(animate);

        // Defer loaded state to avoid sync setState in effect error
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
                exp.lenis?.destroy();
                exp.scene.dispose();
                exp.renderer.dispose();
            }
            window.removeEventListener('scroll', handleScroll);
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
