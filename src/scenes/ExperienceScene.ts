'use client';

import * as THREE from 'three';
import portfolioData from '@/data/mockPortfolio.json';
import {
    createMaterials,
    createMonolith,
    createGroundPlane,
    createFogVolume,
    createLighting,
    createDataParticles,
    createTextPlane,
} from './ScenePrimitives';

export interface PropertyMesh extends THREE.Group {
    userData: {
        propertyId: string;
        propertyName: string;
        propertyData: typeof portfolioData.properties[0];
        baseY: number;
        targetY: number;
        riseProgress: number;
    };
}

// Temporal atmosphere colors (Dawn → Morning → Afternoon → Dusk)
const atmosphereColors = {
    dawn: { fog: 0x1a2a4a, ambient: 0x4a6fa5, intensity: 0.3 },
    morning: { fog: 0x2a2a2f, ambient: 0xd4a574, intensity: 0.5 },
    afternoon: { fog: 0x0a0a0b, ambient: 0xf0f0f5, intensity: 0.7 },
    dusk: { fog: 0x1a1520, ambient: 0xd4764a, intensity: 0.4 },
};

export class ExperienceScene {
    scene: THREE.Scene;
    materials: ReturnType<typeof createMaterials>;
    propertyMeshes: Map<string, PropertyMesh> = new Map();

    private fogVolume: THREE.Mesh | null = null;
    private dataParticles: THREE.Points | null = null;
    private heroText: THREE.Mesh | null = null;
    private subtitleText: THREE.Mesh | null = null;
    private lighting: THREE.Group | null = null;
    private ambientLight: THREE.AmbientLight | null = null;
    private directionalLight: THREE.DirectionalLight | null = null;
    private groundPlane: THREE.Group | null = null;
    private lastScrollProgress: number = 0;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.012);

        this.materials = createMaterials();

        this.setupScene();
    }

    private setupScene(): void {
        // Add ambient light (will be modulated by time of day)
        this.ambientLight = new THREE.AmbientLight(0x404050, 0.4);
        this.scene.add(this.ambientLight);

        // Add directional light (sun position changes with scroll)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(10, 20, 10);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);

        // Add lighting group
        this.lighting = createLighting();
        this.scene.add(this.lighting);

        // Add ground plane
        this.groundPlane = createGroundPlane(200, this.materials);
        this.scene.add(this.groundPlane);

        // Add fog volume
        this.fogVolume = createFogVolume(
            new THREE.Vector3(200, 50, 200),
            this.materials
        );
        this.scene.add(this.fogVolume);

        // Add hero text planes
        this.heroText = createTextPlane('MERIDIAN', 3);
        this.heroText.position.set(0, 4, -5);
        this.scene.add(this.heroText);

        this.subtitleText = createTextPlane('CAPITAL PORTFOLIO', 1.5);
        this.subtitleText.position.set(0, 1.5, -5);
        this.scene.add(this.subtitleText);

        // Create property monoliths (initially below ground)
        this.createPropertyMonoliths();

        // Add data visualization particles
        this.dataParticles = createDataParticles(
            800, // More particles
            new THREE.Vector3(120, 80, 120),
            this.materials
        );
        this.dataParticles.position.set(0, 0, -50);
        this.scene.add(this.dataParticles);
    }

    private createPropertyMonoliths(): void {
        portfolioData.properties.forEach((property, index) => {
            const monolith = createMonolith(
                property.scale.x,
                property.scale.y * 5,
                property.scale.z,
                this.materials
            ) as PropertyMesh;

            // Start below ground for rise animation
            const baseY = property.position.y;
            const targetY = property.scale.y * 2.5; // Final height

            monolith.position.set(
                property.position.x,
                baseY - 10, // Start below
                property.position.z
            );

            // Store animation data
            monolith.userData = {
                propertyId: property.id,
                propertyName: property.name,
                propertyData: property,
                baseY: baseY - 10,
                targetY: targetY,
                riseProgress: 0,
            };

            this.propertyMeshes.set(property.id, monolith);
            this.scene.add(monolith);
        });
    }

    update(time: number, scrollProgress: number): void {
        // Update temporal atmosphere based on scroll
        this.updateAtmosphere(scrollProgress);

        // Update fog shader
        if (this.fogVolume && this.fogVolume.material instanceof THREE.ShaderMaterial) {
            this.fogVolume.material.uniforms.uTime.value = time;
        }

        // Update particles with enhanced motion
        this.updateParticles(time, scrollProgress);

        // Update hero text opacity
        this.updateHeroText(scrollProgress);

        // Animate buildings rising based on scroll
        this.updateBuildingAnimations(time, scrollProgress);

        // Store for delta calculations
        this.lastScrollProgress = scrollProgress;
    }

    private updateAtmosphere(scrollProgress: number): void {
        // Determine time of day based on scroll
        let fogColor: THREE.Color;
        let ambientColor: THREE.Color;
        let lightIntensity: number;

        if (scrollProgress < 0.2) {
            // Dawn
            const t = scrollProgress / 0.2;
            fogColor = new THREE.Color(atmosphereColors.dawn.fog).lerp(
                new THREE.Color(atmosphereColors.morning.fog), t
            );
            ambientColor = new THREE.Color(atmosphereColors.dawn.ambient).lerp(
                new THREE.Color(atmosphereColors.morning.ambient), t
            );
            lightIntensity = THREE.MathUtils.lerp(atmosphereColors.dawn.intensity, atmosphereColors.morning.intensity, t);
        } else if (scrollProgress < 0.5) {
            // Morning to Afternoon
            const t = (scrollProgress - 0.2) / 0.3;
            fogColor = new THREE.Color(atmosphereColors.morning.fog).lerp(
                new THREE.Color(atmosphereColors.afternoon.fog), t
            );
            ambientColor = new THREE.Color(atmosphereColors.morning.ambient).lerp(
                new THREE.Color(atmosphereColors.afternoon.ambient), t
            );
            lightIntensity = THREE.MathUtils.lerp(atmosphereColors.morning.intensity, atmosphereColors.afternoon.intensity, t);
        } else if (scrollProgress < 0.8) {
            // Afternoon
            fogColor = new THREE.Color(atmosphereColors.afternoon.fog);
            ambientColor = new THREE.Color(atmosphereColors.afternoon.ambient);
            lightIntensity = atmosphereColors.afternoon.intensity;
        } else {
            // Dusk
            const t = (scrollProgress - 0.8) / 0.2;
            fogColor = new THREE.Color(atmosphereColors.afternoon.fog).lerp(
                new THREE.Color(atmosphereColors.dusk.fog), t
            );
            ambientColor = new THREE.Color(atmosphereColors.afternoon.ambient).lerp(
                new THREE.Color(atmosphereColors.dusk.ambient), t
            );
            lightIntensity = THREE.MathUtils.lerp(atmosphereColors.afternoon.intensity, atmosphereColors.dusk.intensity, t);
        }

        // Apply atmosphere changes
        if (this.scene.fog instanceof THREE.FogExp2) {
            this.scene.fog.color.copy(fogColor);
        }
        if (this.ambientLight) {
            this.ambientLight.color.copy(ambientColor);
            this.ambientLight.intensity = lightIntensity;
        }

        // Move directional light (sun position)
        if (this.directionalLight) {
            const sunAngle = scrollProgress * Math.PI; // 0 to PI (sunrise to sunset)
            this.directionalLight.position.set(
                Math.cos(sunAngle) * 30,
                20 + Math.sin(sunAngle) * 30,
                10
            );
            this.directionalLight.intensity = 0.4 + Math.sin(sunAngle) * 0.4;
        }
    }

    private updateParticles(time: number, scrollProgress: number): void {
        if (!this.dataParticles) return;

        const positions = this.dataParticles.geometry.attributes.position.array as Float32Array;
        const velocities = this.dataParticles.geometry.attributes.velocity?.array as Float32Array;

        if (velocities) {
            for (let i = 0; i < positions.length; i += 3) {
                // Enhanced particle motion
                positions[i] += velocities[i] * (1 + scrollProgress);
                positions[i + 1] += velocities[i + 1] * (1.5 + Math.sin(time * 0.5) * 0.5);
                positions[i + 2] += velocities[i + 2];

                // Reset particles that go too high
                if (positions[i + 1] > 50) {
                    positions[i + 1] = -30;
                }
            }

            this.dataParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Enhanced rotation based on scroll
        this.dataParticles.rotation.y = time * 0.015 + scrollProgress * Math.PI * 0.5;
    }

    private updateHeroText(scrollProgress: number): void {
        if (this.heroText && this.heroText.material instanceof THREE.MeshBasicMaterial) {
            const heroOpacity = scrollProgress < 0.05
                ? 0
                : scrollProgress < 0.15
                    ? (scrollProgress - 0.05) * 10
                    : scrollProgress < 0.25
                        ? 1 - (scrollProgress - 0.15) * 10
                        : 0;

            this.heroText.material.opacity = Math.max(0, Math.min(1, heroOpacity));
        }

        if (this.subtitleText && this.subtitleText.material instanceof THREE.MeshBasicMaterial) {
            const subtitleOpacity = scrollProgress < 0.08
                ? 0
                : scrollProgress < 0.18
                    ? (scrollProgress - 0.08) * 10
                    : scrollProgress < 0.28
                        ? 1 - (scrollProgress - 0.18) * 10
                        : 0;

            this.subtitleText.material.opacity = Math.max(0, Math.min(1, subtitleOpacity * 0.7));
        }
    }

    private updateBuildingAnimations(time: number, scrollProgress: number): void {
        // Properties rise from ground during scene 2 (0.2 - 0.5)
        const riseStart = 0.2;
        const riseEnd = 0.45;

        this.propertyMeshes.forEach((mesh, index) => {
            const property = mesh.userData.propertyData;
            const propertyIndex = Array.from(this.propertyMeshes.keys()).indexOf(mesh.userData.propertyId);

            // Staggered rise based on property value (higher value = rises first)
            const valueRank = property.value / 285000000; // Normalize to max value
            const staggerDelay = (1 - valueRank) * 0.1;
            const adjustedProgress = Math.max(0, Math.min(1,
                (scrollProgress - riseStart - staggerDelay) / (riseEnd - riseStart)
            ));

            // Smooth easing for rise
            const eased = 1 - Math.pow(1 - adjustedProgress, 4);
            mesh.userData.riseProgress = eased;

            // Calculate Y position
            const targetY = mesh.userData.targetY;
            const baseY = mesh.userData.baseY;
            mesh.position.y = baseY + (targetY - baseY) * eased;

            // Add subtle hover animation when close to camera
            const distanceFromCamera = Math.abs(scrollProgress * 100 - Math.abs(property.position.z));
            if (distanceFromCamera < 25 && eased > 0.9) {
                const hoverIntensity = 1 - distanceFromCamera / 25;
                mesh.position.y += Math.sin(time * 2) * 0.08 * hoverIntensity;
            }

            // Subtle rotation for organic feel
            mesh.rotation.y = Math.sin(time * 0.5 + propertyIndex) * 0.02;
        });
    }

    getPropertyAtDistance(cameraZ: number, threshold: number = 15): PropertyMesh | null {
        let closest: PropertyMesh | null = null;
        let minDistance = Infinity;

        this.propertyMeshes.forEach((mesh) => {
            const distance = Math.abs(mesh.position.z - cameraZ);
            if (distance < threshold && distance < minDistance) {
                minDistance = distance;
                closest = mesh;
            }
        });

        return closest;
    }

    dispose(): void {
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        this.propertyMeshes.clear();
    }
}

export default ExperienceScene;
